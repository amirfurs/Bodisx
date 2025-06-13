const mockData = {
  // Default template for users to start with
  defaultTemplate: {
    "name": "قالب افتراضي",
    "description": "قالب أساسي لإنشاء قنوات Discord",
    "channels": [
      { "type": 4, "name": "📋【الأساسيات】" },
      { "type": 0, "name": "📜┇القوانين・rules", "parent": "📋【الأساسيات】" },
      { "type": 0, "name": "📢┇الإعلانات・announcements", "parent": "📋【الأساسيات】" },
      { "type": 2, "name": "🔊・العام・general-voice", "parent": "📋【الأساسيات】" },
      
      { "type": 4, "name": "💬【المجتمع】" },
      { "type": 0, "name": "💬┇الدردشة-العامة・general-chat", "parent": "💬【المجتمع】" },
      { "type": 0, "name": "🎮┇الألعاب・gaming", "parent": "💬【المجتمع】" },
      { "type": 2, "name": "🔊・صوتي-عام・general-voice", "parent": "💬【المجتمع】" }
    ]
  },

  // Pre-saved JSON files for demonstration
  savedJsonFiles: [
    {
      id: "json_1702834567890",
      name: "التيمية الفضلاء",
      content: {
        "name": "التيمية الفضلاء",
        "description": "خادم علميّ عقديّ فلسفيّ",
        "channels": [
          { "type": 4, "name": "📑📜【الأساسيات】" },
          { "type": 0, "name": "📜┇القوانين・rules", "parent": "📑📜【الأساسيات】" },
          { "type": 0, "name": "🤖┇البوتات・bots", "parent": "📑📜【الأساسيات】" },
          { "type": 0, "name": "📢┇الإعلانات・announcements", "parent": "📑📜【الأساسيات】" },
          { "type": 0, "name": "🎖️┇نظام-المراتب・ranks-system", "parent": "📑📜【الأساسيات】" },
          { "type": 2, "name": "🔊・📜┇القوانين・rules", "parent": "📑📜【الأساسيات】" },
          { "type": 2, "name": "🔊・🤖┇البوتات・bots", "parent": "📑📜【الأساسيات】" },
          { "type": 2, "name": "🔊・📢┇الإعلانات・announcements", "parent": "📑📜【الأساسيات】" },
          { "type": 2, "name": "🔊・🎖️┇نظام-المراتب・ranks-system", "parent": "📑📜【الأساسيات】" },

          { "type": 4, "name": "🕌📖【العقيدة】" },
          { "type": 0, "name": "🕌┇ساحة-العقيدة・aqidah-forum", "parent": "🕌📖【العقيدة】" },
          { "type": 0, "name": "📚┇شرح-المتون・texts-and-commentaries", "parent": "🕌📖【العقيدة】" },
          { "type": 0, "name": "📖┇الردود-والنقاشات・creed-debates", "parent": "🕌📖【العقيدة】" },
          { "type": 0, "name": "🛡️┇ردود-على-الشبهات・refutations", "parent": "🕌📖【العقيدة】" },
          { "type": 2, "name": "🔊・🕌┇ساحة-العقيدة・aqidah-forum", "parent": "🕌📖【العقيدة】" },
          { "type": 2, "name": "🔊・📚┇شرح-المتون・texts-and-commentaries", "parent": "🕌📖【العقيدة】" },
          { "type": 2, "name": "🔊・📖┇الردود-والنقاشات・creed-debates", "parent": "🕌📖【العقيدة】" },
          { "type": 2, "name": "🔊・🛡️┇ردود-على-الشبهات・refutations", "parent": "🕌📖【العقيدة】" },

          { "type": 4, "name": "🧠📘【الفلسفة والمنطق】" },
          { "type": 0, "name": "📘┇فلسفة-اللغة・philosophy-of-language", "parent": "🧠📘【الفلسفة والمنطق】" },
          { "type": 0, "name": "⚖️┇المنطق-والاستدلال・logic-and-epistemology", "parent": "🧠📘【الفلسفة والمنطق】" },
          { "type": 0, "name": "🔍┇المعقول-والمكشوف・reason-vs-revelation", "parent": "🧠📘【الفلسفة والمنطق】" },
          { "type": 0, "name": "📡┇الفكر-الغربي・western-thought", "parent": "🧠📘【الفلسفة والمنطق】" },
          { "type": 2, "name": "🔊・📘┇فلسفة-اللغة・philosophy-of-language", "parent": "🧠📘【الفلسفة والمنطق】" },
          { "type": 2, "name": "🔊・⚖️┇المنطق-والاستدلال・logic-and-epistemology", "parent": "🧠📘【الفلسفة والمنطق】" },
          { "type": 2, "name": "🔊・🔍┇المعقول-والمكشوف・reason-vs-revelation", "parent": "🧠📘【الفلسفة والمنطق】" },
          { "type": 2, "name": "🔊・📡┇الفكر-الغربي・western-thought", "parent": "🧠📘【الفلسفة والمنطق】" },

          { "type": 4, "name": "📐📏【المباحث الكلامية】" },
          { "type": 0, "name": "🧠┇المباحث-الكلامية・kalam-discussions", "parent": "📐📏【المباحث الكلامية】" },
          { "type": 0, "name": "📐┇مباحث-الصفات・attributes-debate", "parent": "📐📏【المباحث الكلامية】" },
          { "type": 0, "name": "🚫┇مباحث-البدعة・innovation-and-taqlid", "parent": "📐📏【المباحث الكلامية】" },
          { "type": 2, "name": "🔊・🧠┇المباحث-الكلامية・kalam-discussions", "parent": "📐📏【المباحث الكلامية】" },
          { "type": 2, "name": "🔊・📐┇مباحث-الصفات・attributes-debate", "parent": "📐📏【المباحث الكلامية】" },
          { "type": 2, "name": "🔊・🚫┇مباحث-البدعة・innovation-and-taqlid", "parent": "📐📏【المباحث الكلامية】" },

          { "type": 4, "name": "💬🗣️【المجتمع】" },
          { "type": 0, "name": "💬┇الدردشة-العامة・general-chat", "parent": "💬🗣️【المجتمع】" },
          { "type": 0, "name": "📎┇المراجع-والمصادر・resources", "parent": "💬🗣️【المجتمع】" },
          { "type": 0, "name": "🎙️┇ساحة-الصوتيات・voice-hall", "parent": "💬🗣️【المجتمع】" },
          { "type": 0, "name": "📆┇الفعاليات-والمجالس・events-and-meetings", "parent": "💬🗣️【المجتمع】" },
          { "type": 2, "name": "🔊・💬┇الدردشة-العامة・general-chat", "parent": "💬🗣️【المجتمع】" },
          { "type": 2, "name": "🔊・📎┇المراجع-والمصادر・resources", "parent": "💬🗣️【المجتمع】" },
          { "type": 2, "name": "🔊・🎙️┇ساحة-الصوتيات・voice-hall", "parent": "💬🗣️【المجتمع】" },
          { "type": 2, "name": "🔊・📆┇الفعاليات-والمجالس・events-and-meetings", "parent": "💬🗣️【المجتمع】" },

          { "type": 4, "name": "🌟🎓【التميّز】" },
          { "type": 0, "name": "🎓┇أهل-الفضل・elite-members", "parent": "🌟🎓【التميّز】" },
          { "type": 0, "name": "📝┇المساهمات-العلمية・academic-input", "parent": "🌟🎓【التميّز】" },
          { "type": 0, "name": "🌿┇استراحة-الفكر・philosophical-lounge", "parent": "🌟🎓【التميّز】" },
          { "type": 2, "name": "🔊・🎓┇أهل-الفضل・elite-members", "parent": "🌟🎓【التميّز】" },
          { "type": 2, "name": "🔊・📝┇المساهمات-العلمية・academic-input", "parent": "🌟🎓【التميّز】" },
          { "type": 2, "name": "🔊・🌿┇استراحة-الفكر・philosophical-lounge", "parent": "🌟🎓【التميّز】" }
        ]
      },
      createdAt: "2024-12-17T15:30:00.000Z",
      channelCount: 48
    },
    {
      id: "json_1702834567891",
      name: "خادم الألعاب",
      content: {
        "name": "خادم الألعاب",
        "description": "مجتمع الألعاب والترفيه",
        "channels": [
          { "type": 4, "name": "🎮【الألعاب】" },
          { "type": 0, "name": "🎮┇عام-الألعاب・general-gaming", "parent": "🎮【الألعاب】" },
          { "type": 0, "name": "🔫┇إطلاق-النار・fps-games", "parent": "🎮【الألعاب】" },
          { "type": 0, "name": "⚔️┇آر-بي-جي・rpg-games", "parent": "🎮【الألعاب】" },
          { "type": 2, "name": "🔊・🎮┇صوتي-الألعاب・gaming-voice", "parent": "🎮【الألعاب】" },
          
          { "type": 4, "name": "🏆【المسابقات】" },
          { "type": 0, "name": "🏆┇المسابقات・tournaments", "parent": "🏆【المسابقات】" },
          { "type": 0, "name": "🥇┇النتائج・results", "parent": "🏆【المسابقات】" },
          { "type": 2, "name": "🔊・🏆┇صوتي-المسابقات・tournament-voice", "parent": "🏆【المسابقات】" }
        ]
      },
      createdAt: "2024-12-16T10:15:00.000Z",
      channelCount: 9
    },
    {
      id: "json_1702834567892",
      name: "مجتمع التعلم",
      content: {
        "name": "مجتمع التعلم",
        "description": "مساحة للتعلم وتبادل المعرفة",
        "channels": [
          { "type": 4, "name": "📚【التعليم】" },
          { "type": 0, "name": "📚┇المكتبة・library", "parent": "📚【التعليم】" },
          { "type": 0, "name": "💻┇البرمجة・programming", "parent": "📚【التعليم】" },
          { "type": 0, "name": "🎨┇التصميم・design", "parent": "📚【التعليم】" },
          { "type": 0, "name": "📈┇التسويق・marketing", "parent": "📚【التعليم】" },
          { "type": 2, "name": "🔊・📚┇دروس-مباشرة・live-lessons", "parent": "📚【التعليم】" },
          
          { "type": 4, "name": "❓【المساعدة】" },
          { "type": 0, "name": "❓┇الأسئلة・questions", "parent": "❓【المساعدة】" },
          { "type": 0, "name": "💡┇الحلول・solutions", "parent": "❓【المساعدة】" },
          { "type": 2, "name": "🔊・❓┇مساعدة-صوتية・voice-help", "parent": "❓【المساعدة】" }
        ]
      },
      createdAt: "2024-12-15T14:20:00.000Z",
      channelCount: 10
    }
  ],

  // Channel type explanations for reference
  channelTypes: {
    0: "نص - Text Channel",
    2: "صوتي - Voice Channel", 
    4: "فئة - Category Channel",
    5: "إعلانات - Announcement Channel",
    13: "مرحلة - Stage Channel",
    15: "منتدى - Forum Channel"
  }
};

export default mockData;