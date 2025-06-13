import React, { useState, useEffect } from 'react';
import mockData from '../mock/jsonTemplates';

const SimpleJsonManager = () => {
  const [jsonFiles, setJsonFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [jsonContent, setJsonContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState({});
  const [notification, setNotification] = useState('');

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const API = `${BACKEND_URL}/api`;

  useEffect(() => {
    // Load configurations from backend
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      const response = await fetch(`${API}/json-configs`);
      if (response.ok) {
        const configs = await response.json();
        setJsonFiles(configs);
      } else {
        // Fallback to mock data if backend fails
        setJsonFiles(mockData.savedJsonFiles);
      }
    } catch (error) {
      console.error('Error loading configurations:', error);
      // Fallback to mock data
      setJsonFiles(mockData.savedJsonFiles);
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target.result);
          setJsonContent(JSON.stringify(content, null, 2));
          setFileName(file.name.replace('.json', ''));
          setSelectedFile(null);
          setIsEditing(true);
          showNotification(`تم تحميل ${file.name} بنجاح`);
        } catch (error) {
          showNotification('خطأ في الملف - الملف المحدد ليس JSON صالح');
        }
      };
      reader.readAsText(file);
    } else {
      showNotification('نوع ملف خاطئ - يرجى تحميل ملف JSON فقط');
    }
  };

  const handleSaveJson = async () => {
    if (!fileName.trim()) {
      showNotification('اسم مطلوب - يرجى إدخال اسم للملف');
      return;
    }

    try {
      const parsedJson = JSON.parse(jsonContent);
      
      const configData = {
        name: fileName,
        description: `تكوين Discord لـ ${fileName}`,
        channels: parsedJson.channels || []
      };

      // Save to backend
      const response = await fetch(`${API}/json-configs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configData)
      });

      if (response.ok) {
        const newConfig = await response.json();
        
        if (selectedFile) {
          // Update existing file in state
          setJsonFiles(prev => prev.map(file => 
            file.id === selectedFile.id ? newConfig : file
          ));
          showNotification(`تم تحديث ${fileName} بنجاح`);
        } else {
          // Add new file to state
          setJsonFiles(prev => [...prev, newConfig]);
          showNotification(`تم حفظ ${fileName} بنجاح`);
        }
      } else {
        throw new Error('Failed to save configuration');
      }

      // Reset form
      setJsonContent('');
      setFileName('');
      setSelectedFile(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving configuration:', error);
      showNotification('خطأ في حفظ الملف - تأكد من صحة تنسيق JSON');
    }
  };

  const handleEditFile = (file) => {
    setSelectedFile(file);
    setFileName(file.name);
    setJsonContent(JSON.stringify(file.channels ? {channels: file.channels} : file.content, null, 2));
    setIsEditing(true);
  };

  const handleDeleteFile = async (fileId) => {
    try {
      const response = await fetch(`${API}/json-configs/${fileId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setJsonFiles(prev => prev.filter(file => file.id !== fileId));
        showNotification('تم حذف الملف بنجاح');
      } else {
        throw new Error('Failed to delete configuration');
      }
    } catch (error) {
      console.error('Error deleting configuration:', error);
      showNotification('خطأ في حذف الملف');
    }
  };

  const handleCopyId = (fileId) => {
    navigator.clipboard.writeText(fileId);
    showNotification('تم نسخ معرف الملف إلى الحافظة');
  };

  const togglePreview = (fileId) => {
    setShowPreview(prev => ({
      ...prev,
      [fileId]: !prev[fileId]
    }));
  };

  const handleLoadTemplate = () => {
    setJsonContent(JSON.stringify(mockData.defaultTemplate, null, 2));
    setFileName('قالب افتراضي');
    setIsEditing(true);
    showNotification('تم تحميل القالب الافتراضي');
  };

  const handleDownloadJson = (file) => {
    const dataStr = JSON.stringify(file.channels ? {channels: file.channels} : file.content, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${file.name}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '24px',
      fontFamily: 'Arial, sans-serif',
      direction: 'rtl'
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px',
      color: 'white'
    },
    title: {
      fontSize: '3rem',
      fontWeight: 'bold',
      marginBottom: '16px',
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
    },
    subtitle: {
      fontSize: '1.25rem',
      opacity: '0.9'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
      gap: '32px'
    },
    card: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
      backdropFilter: 'blur(10px)'
    },
    cardHeader: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '24px'
    },
    cardTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      margin: '0 0 8px 0'
    },
    cardDesc: {
      opacity: '0.9',
      margin: '0'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '16px',
      marginBottom: '16px',
      transition: 'border-color 0.3s'
    },
    textarea: {
      width: '100%',
      minHeight: '300px',
      padding: '12px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      fontFamily: 'monospace',
      marginBottom: '16px',
      resize: 'vertical'
    },
    button: {
      padding: '12px 24px',
      backgroundColor: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      cursor: 'pointer',
      margin: '4px',
      transition: 'all 0.3s'
    },
    buttonSecondary: {
      padding: '8px 16px',
      backgroundColor: '#f0f0f0',
      color: '#333',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: '14px',
      cursor: 'pointer',
      margin: '2px',
      transition: 'all 0.3s'
    },
    buttonDanger: {
      padding: '8px 16px',
      backgroundColor: '#e74c3c',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      cursor: 'pointer',
      margin: '2px'
    },
    fileList: {
      maxHeight: '500px',
      overflowY: 'auto'
    },
    fileItem: {
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      backgroundColor: '#f9f9f9'
    },
    fileName: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      marginBottom: '8px'
    },
    fileInfo: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '8px'
    },
    fileId: {
      fontSize: '12px',
      color: '#999',
      fontFamily: 'monospace',
      backgroundColor: '#f0f0f0',
      padding: '4px 8px',
      borderRadius: '4px',
      display: 'inline-block',
      marginBottom: '12px'
    },
    preview: {
      backgroundColor: '#f5f5f5',
      border: '1px solid #ddd',
      borderRadius: '6px',
      padding: '12px',
      marginBottom: '16px',
      fontSize: '12px',
      fontFamily: 'monospace',
      maxHeight: '200px',
      overflowY: 'auto',
      direction: 'ltr'
    },
    notification: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: '#2ecc71',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      animation: 'slideIn 0.3s ease-out'
    },
    botInfo: {
      backgroundColor: 'rgba(46, 204, 113, 0.1)',
      border: '1px solid rgba(46, 204, 113, 0.3)',
      borderRadius: '8px',
      padding: '16px',
      marginTop: '24px'
    },
    code: {
      backgroundColor: 'rgba(46, 204, 113, 0.1)',
      padding: '8px 12px',
      borderRadius: '6px',
      fontFamily: 'monospace',
      fontSize: '14px',
      direction: 'ltr',
      display: 'block',
      margin: '8px 0'
    }
  };

  return (
    <div style={styles.container}>
      {notification && (
        <div style={styles.notification}>
          {notification}
        </div>
      )}
      
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>مدير ملفات Discord JSON</h1>
          <p style={styles.subtitle}>
            قم برفع وإدارة ملفات JSON لإنشاء قنوات Discord تلقائياً باستخدام البوت
          </p>
        </div>

        <div style={styles.grid}>
          {/* Left Panel - JSON Editor */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>📄 محرر JSON</h2>
              <p style={styles.cardDesc}>قم بتحميل أو تحرير ملف JSON الخاص بك</p>
            </div>

            {/* File Upload */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                رفع ملف JSON
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  style={styles.input}
                />
                <button
                  onClick={handleLoadTemplate}
                  style={styles.buttonSecondary}
                >
                  قالب افتراضي
                </button>
              </div>
            </div>

            {/* File Name */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                اسم الملف
              </label>
              <input
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="أدخل اسم الملف..."
                style={styles.input}
              />
            </div>

            {/* JSON Content */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                محتوى JSON
              </label>
              <textarea
                value={jsonContent}
                onChange={(e) => setJsonContent(e.target.value)}
                placeholder="أدخل أو الصق محتوى JSON هنا..."
                style={styles.textarea}
                dir="ltr"
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={handleSaveJson}
                style={{...styles.button, opacity: (!jsonContent.trim() || !fileName.trim()) ? 0.5 : 1}}
                disabled={!jsonContent.trim() || !fileName.trim()}
              >
                📤 {selectedFile ? 'تحديث' : 'حفظ'} الملف
              </button>
              {isEditing && (
                <button
                  onClick={() => {
                    setJsonContent('');
                    setFileName('');
                    setSelectedFile(null);
                    setIsEditing(false);
                  }}
                  style={styles.buttonSecondary}
                >
                  إلغاء
                </button>
              )}
            </div>
          </div>

          {/* Right Panel - Saved Files */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>📁 الملفات المحفوظة ({jsonFiles.length})</h2>
              <p style={styles.cardDesc}>قائمة بجميع ملفات JSON المحفوظة</p>
            </div>

            {jsonFiles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#666' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                <p style={{ fontSize: '18px', marginBottom: '8px' }}>لا توجد ملفات محفوظة</p>
                <p style={{ fontSize: '14px' }}>قم برفع أو إنشاء ملف JSON جديد</p>
              </div>
            ) : (
              <div style={styles.fileList}>
                {jsonFiles.map((file) => (
                  <div key={file.id} style={styles.fileItem}>
                    <div style={styles.fileName}>{file.name}</div>
                    <div style={styles.fileInfo}>
                      <span style={{ backgroundColor: '#e74c3c', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
                        {file.channelCount} قناة
                      </span>
                      <span style={{ margin: '0 8px' }}>•</span>
                      <span>{new Date(file.createdAt).toLocaleDateString('ar-SA')}</span>
                    </div>
                    <div style={styles.fileId}>
                      المعرف: {file.id}
                    </div>

                    {/* Preview */}
                    {showPreview[file.id] && (
                      <div style={styles.preview}>
                        <pre>{JSON.stringify(file.content, null, 2)}</pre>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => togglePreview(file.id)}
                        style={styles.buttonSecondary}
                      >
                        {showPreview[file.id] ? '👁️‍🗨️ إخفاء' : '👁️ عرض'}
                      </button>
                      <button
                        onClick={() => handleCopyId(file.id)}
                        style={styles.buttonSecondary}
                      >
                        📋 نسخ المعرف
                      </button>
                      <button
                        onClick={() => handleDownloadJson(file)}
                        style={styles.buttonSecondary}
                      >
                        💾 تحميل
                      </button>
                      <button
                        onClick={() => handleEditFile(file)}
                        style={styles.buttonSecondary}
                      >
                        ✏️ تحرير
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        style={styles.buttonDanger}
                      >
                        🗑️ حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bot Command Info */}
            <div style={styles.botInfo}>
              <h3 style={{ color: '#27ae60', marginBottom: '12px' }}>🤖 استخدام البوت</h3>
              <p style={{ marginBottom: '8px', color: '#2c3e50' }}>
                لإنشاء القنوات باستخدام البوت، استخدم الأمر التالي في Discord:
              </p>
              <code style={styles.code}>/recreate [معرف_الملف]</code>
              <p style={{ fontSize: '12px', color: '#7f8c8d', margin: '0' }}>
                مثال: <code>/recreate json_1702834567890</code>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        input:focus, textarea:focus {
          border-color: #667eea;
          outline: none;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
      `}</style>
    </div>
  );
};

export default SimpleJsonManager;