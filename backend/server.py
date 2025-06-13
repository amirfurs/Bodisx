from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
import json
import asyncio
import discord
from discord.ext import commands


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Discord Bot Setup
DISCORD_BOT_TOKEN = os.getenv('DISCORD_BOT_TOKEN')
DISCORD_APPLICATION_ID = os.getenv('DISCORD_APPLICATION_ID')

# Create Discord bot instance
intents = discord.Intents.default()
intents.guilds = True
intents.guild_messages = True
intents.message_content = True

class DiscordBot(commands.Bot):
    def __init__(self):
        super().__init__(command_prefix='!', intents=intents)
        
    async def on_ready(self):
        print(f'{self.user} has connected to Discord!')
        try:
            synced = await self.tree.sync()
            print(f"Synced {len(synced)} command(s)")
        except Exception as e:
            print(f"Failed to sync commands: {e}")

# Global bot instance
discord_bot = None

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class ChannelConfig(BaseModel):
    name: str
    type: int  # 0=text, 2=voice, 4=category
    parent: Optional[str] = None
    position: Optional[int] = None

class JsonConfiguration(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = ""
    channels: List[Dict[Any, Any]]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    channel_count: int

class JsonConfigurationCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    channels: List[Dict[Any, Any]]

class JsonConfigurationResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = ""
    channels: List[Dict[Any, Any]]
    created_at: datetime
    channel_count: int


# Discord Bot Commands
async def create_channels_from_config(guild, config):
    """Create channels based on configuration with rate limit handling"""
    created_channels = []
    category_map = {}  # Map category names to Discord category objects
    
    # First pass: Create categories
    for channel_data in config.get('channels', []):
        if channel_data.get('type') == 4:  # Category
            try:
                await asyncio.sleep(1)  # Rate limit prevention
                
                channel_name = channel_data.get('name', 'unnamed-category')
                category = await guild.create_category(
                    name=channel_name,
                    reason="Channel recreation via bot command"
                )
                category_map[channel_name] = category
                created_channels.append(category)
                print(f"Created category: {channel_name}")
                
            except discord.Forbidden:
                print(f"Permission denied for category: {channel_name}")
                continue
            except Exception as e:
                print(f"Error creating category {channel_name}: {e}")
                continue
    
    # Second pass: Create text and voice channels
    for channel_data in config.get('channels', []):
        if channel_data.get('type') in [0, 2]:  # Text or Voice channel
            try:
                await asyncio.sleep(1)  # Rate limit prevention
                
                channel_type = channel_data.get('type', 0)
                channel_name = channel_data.get('name', 'unnamed-channel')
                parent_name = channel_data.get('parent')
                
                # Get parent category if specified
                parent = None
                if parent_name and parent_name in category_map:
                    parent = category_map[parent_name]
                
                # Create channel based on type
                if channel_type == 0:  # Text channel
                    channel = await guild.create_text_channel(
                        name=channel_name,
                        category=parent,
                        reason="Channel recreation via bot command"
                    )
                elif channel_type == 2:  # Voice channel
                    channel = await guild.create_voice_channel(
                        name=channel_name,
                        category=parent,
                        reason="Channel recreation via bot command"
                    )
                
                created_channels.append(channel)
                print(f"Created channel: {channel_name} (type: {channel_type})")
                
            except discord.Forbidden:
                print(f"Permission denied for channel: {channel_name}")
                continue
            except Exception as e:
                print(f"Error creating channel {channel_name}: {e}")
                continue
    
    return created_channels


# Helper function to validate JSON structure
def validate_config_structure(config: Dict[Any, Any]) -> bool:
    """Validate JSON configuration structure"""
    required_fields = ['channels']
    
    if not all(field in config for field in required_fields):
        return False
    
    for channel in config.get('channels', []):
        if not isinstance(channel, dict):
            return False
        if 'name' not in channel or 'type' not in channel:
            return False
        if channel['type'] not in [0, 2, 4]:  # Valid channel types
            return False
    
    return True


# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Discord Bot API is running"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# JSON Configuration endpoints
@api_router.post("/json-configs", response_model=JsonConfigurationResponse)
async def create_json_config(config: JsonConfigurationCreate):
    """Save JSON configuration to database"""
    try:
        # Validate configuration structure
        config_data = {"channels": config.channels}
        if not validate_config_structure(config_data):
            raise HTTPException(status_code=400, detail="Invalid configuration structure")
        
        # Create configuration object
        json_config = JsonConfiguration(
            name=config.name,
            description=config.description or "",
            channels=config.channels,
            channel_count=len(config.channels)
        )
        
        # Save to database
        config_dict = json_config.dict()
        result = await db.json_configurations.insert_one(config_dict)
        
        # Return the created configuration
        config_dict["_id"] = str(result.inserted_id)
        return JsonConfigurationResponse(**config_dict)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/json-configs", response_model=List[JsonConfigurationResponse])
async def get_json_configs():
    """Get all JSON configurations"""
    try:
        configs = []
        async for config in db.json_configurations.find():
            config["_id"] = str(config["_id"])
            configs.append(JsonConfigurationResponse(**config))
        return configs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/json-configs/{config_id}", response_model=JsonConfigurationResponse)
async def get_json_config(config_id: str):
    """Get specific JSON configuration by ID"""
    try:
        config = await db.json_configurations.find_one({"id": config_id})
        if not config:
            raise HTTPException(status_code=404, detail="Configuration not found")
        
        config["_id"] = str(config.get("_id", ""))
        return JsonConfigurationResponse(**config)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/json-configs/{config_id}")
async def delete_json_config(config_id: str):
    """Delete JSON configuration"""
    try:
        result = await db.json_configurations.delete_one({"id": config_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Configuration not found")
        
        return {"message": "Configuration deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/upload-json")
async def upload_json_config(file: UploadFile = File(...)):
    """Upload JSON configuration file"""
    try:
        if not file.filename.endswith('.json'):
            raise HTTPException(status_code=400, detail="File must be JSON format")
        
        content = await file.read()
        config_data = json.loads(content.decode('utf-8'))
        
        # Validate configuration structure
        if not validate_config_structure(config_data):
            raise HTTPException(status_code=400, detail="Invalid configuration structure")
        
        return {"config": config_data, "message": "Configuration uploaded successfully"}
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/discord/recreate/{guild_id}/{config_id}")
async def recreate_discord_channels(guild_id: str, config_id: str):
    """Recreate Discord channels based on stored configuration"""
    try:
        # Get configuration from database
        config = await db.json_configurations.find_one({"id": config_id})
        if not config:
            raise HTTPException(status_code=404, detail="Configuration not found")
        
        # Check if Discord bot is available
        if not discord_bot or not discord_bot.is_ready():
            raise HTTPException(status_code=503, detail="Discord bot is not ready")
        
        # Get Discord guild
        guild = discord_bot.get_guild(int(guild_id))
        if not guild:
            raise HTTPException(status_code=404, detail="Discord server not found")
        
        # Check bot permissions
        if not guild.me.guild_permissions.manage_channels:
            raise HTTPException(status_code=403, detail="Bot lacks 'Manage Channels' permission")
        
        # Create channels
        created_channels = await create_channels_from_config(guild, config)
        
        return {
            "message": f"Successfully created {len(created_channels)} channels",
            "created_channels": len(created_channels),
            "config_name": config.get("name", "Unknown")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Initialize Discord bot on startup"""
    global discord_bot
    
    if DISCORD_BOT_TOKEN:
        try:
            discord_bot = DiscordBot()
            
            @discord_bot.tree.command(name="recreate", description="Recreate channels based on stored JSON configuration")
            async def recreate_command(interaction: discord.Interaction, config_id: str):
                """Slash command to recreate channels"""
                await interaction.response.defer()
                
                try:
                    # Get configuration from database
                    config = await db.json_configurations.find_one({"id": config_id})
                    if not config:
                        await interaction.followup.send("❌ Configuration not found!")
                        return
                    
                    guild = interaction.guild
                    
                    # Validate permissions
                    if not guild.me.guild_permissions.manage_channels:
                        await interaction.followup.send("❌ Bot lacks 'Manage Channels' permission!")
                        return
                    
                    # Create channels
                    created_channels = await create_channels_from_config(guild, config)
                    
                    await interaction.followup.send(
                        f"✅ Successfully created {len(created_channels)} channels from '{config.get('name', 'Unknown')}' configuration!"
                    )
                    
                except Exception as e:
                    await interaction.followup.send(f"❌ Error: {str(e)}")
            
            # Start bot in background
            asyncio.create_task(discord_bot.start(DISCORD_BOT_TOKEN))
            logger.info("Discord bot initialization started")
            
        except Exception as e:
            logger.error(f"Failed to initialize Discord bot: {e}")
    else:
        logger.warning("Discord bot token not provided, bot functionality disabled")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    if discord_bot:
        await discord_bot.close()
    client.close()
