import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useToast } from '../hooks/use-toast';
import { Upload, FileText, Trash2, Copy, Eye, EyeOff, Download } from 'lucide-react';
import mockData from '../mock/jsonTemplates';

const JsonManager = () => {
  const [jsonFiles, setJsonFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [jsonContent, setJsonContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    // Load mock data on component mount
    setJsonFiles(mockData.savedJsonFiles);
  }, []);

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
          toast({
            title: "ملف محمل بنجاح",
            description: `تم تحميل ${file.name} بنجاح`,
          });
        } catch (error) {
          toast({
            title: "خطأ في الملف",
            description: "الملف المحدد ليس JSON صالح",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "نوع ملف خاطئ",
        description: "يرجى تحميل ملف JSON فقط",
        variant: "destructive",
      });
    }
  };

  const handleSaveJson = () => {
    if (!fileName.trim()) {
      toast({
        title: "اسم مطلوب",
        description: "يرجى إدخال اسم للملف",
        variant: "destructive",
      });
      return;
    }

    try {
      const parsedJson = JSON.parse(jsonContent);
      const newJsonFile = {
        id: `json_${Date.now()}`,
        name: fileName,
        content: parsedJson,
        createdAt: new Date().toISOString(),
        channelCount: parsedJson.channels ? parsedJson.channels.length : 0,
      };

      if (selectedFile) {
        // Update existing file
        setJsonFiles(prev => prev.map(file => 
          file.id === selectedFile.id ? newJsonFile : file
        ));
        toast({
          title: "تم التحديث",
          description: `تم تحديث ${fileName} بنجاح`,
        });
      } else {
        // Add new file
        setJsonFiles(prev => [...prev, newJsonFile]);
        toast({
          title: "تم الحفظ",
          description: `تم حفظ ${fileName} بنجاح`,
        });
      }

      // Reset form
      setJsonContent('');
      setFileName('');
      setSelectedFile(null);
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "خطأ في JSON",
        description: "تأكد من صحة تنسيق JSON",
        variant: "destructive",
      });
    }
  };

  const handleEditFile = (file) => {
    setSelectedFile(file);
    setFileName(file.name);
    setJsonContent(JSON.stringify(file.content, null, 2));
    setIsEditing(true);
  };

  const handleDeleteFile = (fileId) => {
    setJsonFiles(prev => prev.filter(file => file.id !== fileId));
    toast({
      title: "تم الحذف",
      description: "تم حذف الملف بنجاح",
    });
  };

  const handleCopyId = (fileId) => {
    navigator.clipboard.writeText(fileId);
    toast({
      title: "تم النسخ",
      description: "تم نسخ معرف الملف إلى الحافظة",
    });
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
    toast({
      title: "تم تحميل القالب",
      description: "تم تحميل القالب الافتراضي",
    });
  };

  const handleDownloadJson = (file) => {
    const dataStr = JSON.stringify(file.content, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${file.name}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            مدير ملفات Discord JSON
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            قم برفع وإدارة ملفات JSON لإنشاء قنوات Discord تلقائياً باستخدام البوت
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - JSON Editor */}
          <div className="space-y-6">
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  محرر JSON
                </CardTitle>
                <CardDescription className="text-indigo-100">
                  قم بتحميل أو تحرير ملف JSON الخاص بك
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="file-upload" className="text-sm font-medium">
                    رفع ملف JSON
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleLoadTemplate}
                      variant="outline"
                      className="whitespace-nowrap hover:bg-indigo-50 transition-colors"
                    >
                      قالب افتراضي
                    </Button>
                  </div>
                </div>

                {/* File Name */}
                <div className="space-y-2">
                  <Label htmlFor="file-name" className="text-sm font-medium">
                    اسم الملف
                  </Label>
                  <Input
                    id="file-name"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="أدخل اسم الملف..."
                    className="transition-all focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* JSON Content */}
                <div className="space-y-2">
                  <Label htmlFor="json-content" className="text-sm font-medium">
                    محتوى JSON
                  </Label>
                  <Textarea
                    id="json-content"
                    value={jsonContent}
                    onChange={(e) => setJsonContent(e.target.value)}
                    placeholder="أدخل أو الصق محتوى JSON هنا..."
                    className="min-h-[400px] font-mono text-sm transition-all focus:ring-2 focus:ring-indigo-500"
                    dir="ltr"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSaveJson}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:scale-105"
                    disabled={!jsonContent.trim() || !fileName.trim()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {selectedFile ? 'تحديث' : 'حفظ'} الملف
                  </Button>
                  {isEditing && (
                    <Button
                      onClick={() => {
                        setJsonContent('');
                        setFileName('');
                        setSelectedFile(null);
                        setIsEditing(false);
                      }}
                      variant="outline"
                      className="hover:bg-gray-50 transition-colors"
                    >
                      إلغاء
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Saved Files */}
          <div className="space-y-6">
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  الملفات المحفوظة ({jsonFiles.length})
                </CardTitle>
                <CardDescription className="text-purple-100">
                  قائمة بجميع ملفات JSON المحفوظة
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {jsonFiles.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">لا توجد ملفات محفوظة</p>
                    <p className="text-sm">قم برفع أو إنشاء ملف JSON جديد</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {jsonFiles.map((file) => (
                      <div
                        key={file.id}
                        className="border rounded-lg p-4 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-gray-50"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-800 mb-1">
                              {file.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                              <Badge variant="secondary" className="text-xs">
                                {file.channelCount} قناة
                              </Badge>
                              <span>•</span>
                              <span>{new Date(file.createdAt).toLocaleDateString('ar-SA')}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <span>المعرف:</span>
                              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                {file.id}
                              </code>
                            </div>
                          </div>
                        </div>

                        {/* Preview */}
                        {showPreview[file.id] && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                            <pre className="text-xs text-gray-600 overflow-x-auto max-h-48 overflow-y-auto" dir="ltr">
                              {JSON.stringify(file.content, null, 2)}
                            </pre>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                          <Button
                            onClick={() => togglePreview(file.id)}
                            size="sm"
                            variant="outline"
                            className="text-xs hover:bg-indigo-50 transition-colors"
                          >
                            {showPreview[file.id] ? (
                              <>
                                <EyeOff className="w-3 h-3 mr-1" />
                                إخفاء
                              </>
                            ) : (
                              <>
                                <Eye className="w-3 h-3 mr-1" />
                                عرض
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => handleCopyId(file.id)}
                            size="sm"
                            variant="outline"
                            className="text-xs hover:bg-green-50 transition-colors"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            نسخ المعرف
                          </Button>
                          <Button
                            onClick={() => handleDownloadJson(file)}
                            size="sm"
                            variant="outline"
                            className="text-xs hover:bg-blue-50 transition-colors"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            تحميل
                          </Button>
                          <Button
                            onClick={() => handleEditFile(file)}
                            size="sm"
                            variant="outline"
                            className="text-xs hover:bg-yellow-50 transition-colors"
                          >
                            تحرير
                          </Button>
                          <Button
                            onClick={() => handleDeleteFile(file.id)}
                            size="sm"
                            variant="outline"
                            className="text-xs text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            حذف
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bot Command Info */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-teal-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3 text-emerald-800">
                  استخدام البوت
                </h3>
                <div className="space-y-2 text-sm text-emerald-700">
                  <p>لإنشاء القنوات باستخدام البوت، استخدم الأمر التالي في Discord:</p>
                  <code className="block bg-emerald-100 p-3 rounded-lg font-mono text-emerald-800" dir="ltr">
                    /recreate [معرف_الملف]
                  </code>
                  <p className="text-xs text-emerald-600">
                    مثال: <code>/recreate json_1702834567890</code>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonManager;