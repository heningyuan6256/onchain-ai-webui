import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Loader2, Settings } from 'lucide-react';
import ImageUpload from './components/ImageUpload';
import ModeSelector from './components/ModeSelector';
import ResultPanel from './components/ResultPanel';
import { ChatSidebar } from '../appChat/components/ChatSidebar';
import { ChatHeader } from '../appChat/components/ChatHeader';
import AdvancedSettings from './components/AdvancedSettings';
// import axios from 'axios';
import { FileText, Eye, Search, Wand2 } from 'lucide-react';

const API_BASE = 'http://heningyuan.synology.me:23470/api';
const modes = [
  {
    id: 'plain_ocr',
    name: '通用OCR',
    icon: 'FileText',
    color: 'from-blue-500 to-cyan-500',
    desc: '从图像中提取全部文字内容，支持中英文、数字及符号的精准识别。可处理复杂排版、表格、手写体等多种场景，输出结构化文本，方便后续编辑与分析',
    needsInput: false,
  },
  {
    id: 'describe',
    name: '图像描述',
    icon: 'Eye',
    color: 'from-violet-500 to-purple-500',
    desc: '基于多模态AI技术深度理解图像内容，自动生成详细且通顺的自然语言描述。可识别物体、场景、人物动作、情感氛围等要素，适用于内容审核、无障碍访问等场景',
    needsInput: false,
  },
  {
    id: 'find_ref',
    name: '查找定位',
    icon: 'Search',
    color: 'from-yellow-500 to-orange-500',
    desc: '在文档图像中智能检索指定关键词，返回匹配的文本片段及其在图中的具体位置坐标。支持模糊匹配与上下文关联，帮助快速定位关键信息所在区域',
    needsInput: 'findTerm',
  },
  {
    id: 'freeform',
    name: '自定义提示',
    icon: 'Wand2',
    color: 'from-fuchsia-500 to-pink-500',
    desc: '提供完全灵活的AI交互方式，您可自定义提示词来执行各类图像分析任务。支持多轮对话、格式指定、逻辑判断等高级操作，满足个性化业务需求',
    needsInput: 'prompt',
  },
];
function Ocr() {
  const [mode, setMode] = useState('plain_ocr');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    setMode(query.get('mode') || 'ocr');
  }, []);
  // Form state
  const [prompt, setPrompt] = useState('');
  const [findTerm, setFindTerm] = useState('');
  const [advancedSettings, setAdvancedSettings] = useState({
    base_size: 1024,
    image_size: 640,
    crop_mode: true,
    test_compress: false,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [includeCaption, setIncludeCaption] = useState(false);
  const handleImageSelect = useCallback(
    (file) => {
      if (file === null) {
        // Clear everything when removing image
        setImage(null);
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(null);
        setError(null);
        setResult(null);
      } else {
        setImage(file);
        setImagePreview(URL.createObjectURL(file));
        setError(null);
        setResult(null);
      }
    },
    [imagePreview],
  );

  const handleSubmit = async () => {
    if (!image) {
      setError('Please upload an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('mode', mode);
      formData.append('prompt', prompt);
      // Enable grounding only for find mode
      formData.append('grounding', mode === 'find_ref');
      formData.append('include_caption', includeCaption);
      formData.append('find_term', findTerm);
      formData.append('schema', '');
      formData.append('base_size', advancedSettings.base_size);
      formData.append('image_size', advancedSettings.image_size);
      formData.append('crop_mode', advancedSettings.crop_mode);
      formData.append('test_compress', advancedSettings.test_compress);

      const requestOptions: RequestInit = {
        method: 'POST',
        body: formData,
        redirect: 'follow',
      };

      const response = await fetch(`${API_BASE}/ocr`, requestOptions)
        .then((res) => res.json())
        .catch((err) => {
          console.error('请求失败:', err);
        });
      setResult(response);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = useCallback(() => {
    if (result?.text) {
      navigator.clipboard.writeText(result.text);
    }
  }, [result]);

  const handleDownload = useCallback(() => {
    if (!result?.text) return;

    const extensions = {
      plain_ocr: 'txt',
      describe: 'txt',
      find_ref: 'txt',
      freeform: 'txt',
    };

    const ext = extensions[mode] || 'txt';
    const blob = new Blob([result.text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deepseek-ocr-result.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result, mode]);

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <ChatHeader title={modes.find((item) => item.id === mode).name} />
      <div className="content-wrapper flex-1 overflow-hidden">
        <div className="main-area flex-1 overflow-hidden">
          {/* Animated background */}
          <div className="fixed inset-0 -z-10">{/* 背景内容保持不变 */}</div>

          {/* Main Content - 核心修改部分 */}
          <main className="mx-auto w-full max-w-7xl overflow-y-auto px-6 py-8">
            {/* 使用flex布局，让两栏自然适应高度 */}
            <div className="flex gap-6">
              {/* Left Panel - Upload & Controls */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="w-1/2 space-y-6" // 固定宽度为一半，不设置overflow
              >
                <ModeSelector
                  modes={modes}
                  mode={mode}
                  onModeChange={setMode}
                  prompt={prompt}
                  onPromptChange={setPrompt}
                  findTerm={findTerm}
                  onFindTermChange={setFindTerm}
                />

                {/* Image Upload */}
                <ImageUpload onImageSelect={handleImageSelect} preview={imagePreview} />
                <motion.button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="glass flex w-full items-center justify-between rounded-2xl px-4 py-3 transition-colors hover:bg-white/5"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-2">
                    <Settings className="text-400 h-5 w-5" />
                    <span className="font-semibold">高级设置</span>
                  </div>

                  <motion.div
                    animate={{ rotate: showAdvanced ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </motion.div>
                </motion.button>

                {/* Advanced Settings Panel */}
                <AnimatePresence>
                  {showAdvanced && (
                    <AdvancedSettings
                      settings={advancedSettings}
                      onSettingsChange={setAdvancedSettings}
                      includeCaption={includeCaption}
                      onIncludeCaptionChange={setIncludeCaption}
                    />
                  )}
                </AnimatePresence>
                {/* Action Button */}
                <motion.button
                  onClick={handleSubmit}
                  disabled={!image || loading}
                  className={`relative w-full p-[2px] ${
                    !image || loading ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                  style={{ borderRadius: 10 }}
                  whileHover={!loading && image ? { scale: 1.02 } : {}}
                  whileTap={!loading && image ? { scale: 0.98 } : {}}
                >
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: '#282f40', borderRadius: 10 }}
                  />
                  <div
                    style={{ borderRadius: 10 }}
                    className="bg-dark-100 relative flex items-center justify-center gap-3 px-8 py-4"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#ffff' }} />
                        <span className="font-semibold" style={{ color: '#ffff' }}>
                          解析中...
                        </span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5" style={{ color: '#ffff' }} />
                        <span className="font-semibold" style={{ color: '#ffff' }}>
                          解析图片
                        </span>
                      </>
                    )}
                  </div>
                </motion.button>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl border-red-500/50 bg-red-500/10 p-4"
                  >
                    <p className="text-sm text-red-400">{error}</p>
                  </motion.div>
                )}
              </motion.div>

              {/* Right Panel - Results */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-1/2" // 固定宽度为一半，不设置overflow
              >
                <ResultPanel
                  result={result}
                  loading={loading}
                  imagePreview={imagePreview}
                  onCopy={handleCopy}
                  onDownload={handleDownload}
                />
              </motion.div>
            </div>
          </main>
        </div>
        <ChatSidebar
          title={modes.find((item) => item.id === mode).name}
          appDescription={modes.find((item) => item.id === mode).desc}
        />
      </div>
    </div>
  );
}

export default Ocr;
