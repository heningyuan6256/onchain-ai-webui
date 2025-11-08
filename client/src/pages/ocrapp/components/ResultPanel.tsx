import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Download, Sparkles, Loader2, CheckCircle2, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ResultPanel({ result, loading, imagePreview, onCopy, onDownload }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  {
    /* <Markdown content={text} isLatestMessage={isLatestMessage} /> */
  }
  // Check if text looks like HTML (model outputs HTML, not markdown)
  const isHTML =
    result?.text &&
    (result.text.includes('<table') ||
      result.text.includes('<tr>') ||
      result.text.includes('<td>') ||
      result.text.includes('<div') ||
      result.text.includes('<p>') ||
      result.text.includes('<h1') ||
      result.text.includes('<h2'));

  // Also check if it looks like markdown (for backwards compatibility)
  const isMarkdown =
    result?.text &&
    !isHTML &&
    (result.text.includes('##') ||
      result.text.includes('**') ||
      result.text.includes('```') ||
      result.text.includes('- ') ||
      result.text.includes('|'));

  // Draw boxes function
  const drawBoxes = useCallback(() => {
    if (!result?.boxes?.length || !canvasRef.current || !imgRef.current) {
      console.log('❌ Cannot draw - missing:', {
        hasBoxes: !!result?.boxes?.length,
        hasCanvas: !!canvasRef.current,
        hasImgRef: !!imgRef.current,
      });
      return;
    }

    console.log('🎨 Drawing boxes:', result.boxes);

    const img = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    console.log('📐 Image dimensions:', {
      displayWidth: img.offsetWidth,
      displayHeight: img.offsetHeight,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      imageDims: result.image_dims,
    });

    // Set canvas size to match displayed image
    canvas.width = img.offsetWidth;
    canvas.height = img.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate scale factors
    const scaleX = img.offsetWidth / (result.image_dims?.w || img.naturalWidth);
    const scaleY = img.offsetHeight / (result.image_dims?.h || img.naturalHeight);

    console.log('📏 Scale factors:', { scaleX, scaleY });

    // Draw boxes
    result.boxes.forEach((box, idx) => {
      const [x1, y1, x2, y2] = box.box;
      const colors = ['#00ff00', '#00ffff', '#ff00ff', '#ffff00', '#ff0066'];
      const color = colors[idx % colors.length];
      // Scale coordinates
      const sx = x1 * scaleX;
      const sy = y1 * scaleY;
      const sw = (x2 - x1) * scaleX;
      const sh = (y2 - y1) * scaleY;

      console.log(`📦 Box ${idx} (${box.label}):`, {
        original: [x1, y1, x2, y2],
        scaled: [sx, sy, sx + sw, sy + sh],
        dimensions: { width: sw, height: sh },
      });

      // Draw semi-transparent fill

      ctx.fillStyle = color + '33';
      ctx.fillRect(sx, sy, sw, sh);

      // Draw thick neon border
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.strokeRect(sx, sy, sw, sh);
      ctx.shadowBlur = 0;

      // Label background
      if (box.label) {
        ctx.font = 'bold 14px Inter';
        const metrics = ctx.measureText(box.label);
        const padding = 8;
        const labelHeight = 24;

        ctx.fillStyle = color;
        ctx.fillRect(sx, sy - labelHeight, metrics.width + padding * 2, labelHeight);

        // Label text
        ctx.fillStyle = '#000';
        ctx.fillText(box.label, sx + padding, sy - 7);
      }
    });

    console.log('✅ Finished drawing', result.boxes.length, 'boxes');
  }, [result]);

  // Trigger drawing when image loads
  useEffect(() => {
    if (imageLoaded && result?.boxes?.length) {
      console.log('🚀 Image loaded, drawing boxes now');
      drawBoxes();
    }
  }, [imageLoaded, result, drawBoxes]);

  // Reset imageLoaded when result changes
  useEffect(() => {
    setImageLoaded(false);
  }, [result]);

  // Redraw on window resize
  useEffect(() => {
    if (!imageLoaded || !result?.boxes?.length) return;

    const handleResize = () => {
      console.log('📐 Window resized, redrawing');
      drawBoxes();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imageLoaded, result, drawBoxes]);

  return (
    <div
      className="glass min-h-0 space-y-4 p-6"
      style={{
        backgroundColor: '#ffff',
        color: 'black',
        border: '1px solid #e0e0e0',
        borderRadius: 10,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="text-400 h-5 w-5" />
          <h3 className="font-semibold">结果</h3>
        </div>

        {result && (
          <div className="flex gap-2">
            <motion.button
              onClick={onCopy}
              className="glass-hover rounded-lg p-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="复制"
            >
              <Copy className="h-4 w-4" />
            </motion.button>
            <motion.button
              onClick={onDownload}
              className="glass glass-hover rounded-lg p-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="下载"
            >
              <Download className="h-4 w-4" />
            </motion.button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center space-y-4 py-20"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="h-16 w-16 rounded-full border-4 border-purple-500/20 border-t-purple-500"
              />
              <Loader2 className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 transform text-purple-400" />
            </div>
            <p className="animate-pulse text-sm">AI正在解析你的图片</p>
          </motion.div>
        ) : result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Preview with boxes */}
            {imagePreview && result.boxes && result.boxes.length > 0 && (
              <div className="relative min-h-0 overflow-y-auto rounded-xl border border-white/10 bg-black">
                <img
                  ref={imgRef}
                  src={imagePreview}
                  alt="Result"
                  className="block w-full"
                  onLoad={() => {
                    console.log('🖼️ Image loaded, triggering draw');
                    setImageLoaded(true);
                  }}
                />
                <canvas
                  ref={canvasRef}
                  className="pointer-events-none absolute left-0 top-0 min-h-0 w-full"
                  style={{ display: 'block' }}
                />
              </div>
            )}

            {/* Text result */}
            <div className="max-h-96 overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-4">
              {isHTML ? (
                <div
                  className="prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: result.text }}
                />
              ) : isMarkdown ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{result.text}</ReactMarkdown>
                </div>
              ) : (
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.75rem',
                    color: '#212121',
                    fontWeight: 'normal',
                    fontStyle: 'normal',
                  }}
                >
                  {result.text}
                </span>
              )}
            </div>

            {/* Raw Response Viewer */}
            {result.raw_text && (
              <details className="glass min-h-0 overflow-y-auto rounded-xl">
                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 transition-colors hover:bg-white/5">
                  <span className="text-sm font-medium">🔍 原始模型响应</span>
                  <ChevronDown className="h-4 w-4" />
                </summary>
                <div className="space-y-2 border-t border-white/10 px-4 py-3">
                  <span
                    className="mb-2 text-xs"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.75rem',
                      color: '#212121',
                      fontWeight: 'normal',
                      fontStyle: 'normal',
                    }}
                  >
                    模型的未处理输出（可用于调试）
                  </span>
                  <div className="max-h-64 overflow-y-auto rounded-lg p-3">
                    <span
                      className="select-all whitespace-pre-wrap break-words font-mono text-xs"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.75rem',
                        color: '#212121',
                        fontWeight: 'normal',
                        fontStyle: 'normal',
                      }}
                    >
                      {result.raw_text}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => navigator.clipboard.writeText(result.raw_text)}
                      className="rounded-lg bg-white/5 px-3 py-1 text-xs transition-colors hover:bg-white/10"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.75rem',
                        color: '#212121',
                        fontWeight: 'normal',
                        fontStyle: 'normal',
                      }}
                    >
                      复制
                    </button>
                    <span
                      className="py-1 text-xs"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.75rem',
                        color: '#212121',
                        fontWeight: 'normal',
                        fontStyle: 'normal',
                      }}
                    >
                      {result.raw_text.length} 字符
                    </span>
                  </div>
                </div>
              </details>
            )}

            <details className="glass min-h-0 overflow-y-auto rounded-xl">
              <summary className="flex cursor-pointer items-center justify-between px-4 py-3 transition-colors hover:bg-white/5">
                <span className="text-sm font-medium">⚙️ 元数据和调试信息</span>
                <ChevronDown className="h-4 w-4" />
              </summary>
              <div className="space-y-3 border-t border-white/10 px-4 py-3">
                {result.metadata && (
                  <div>
                    <p
                      className="mb-2 text-xs"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.75rem',
                        color: '#212121',
                        fontWeight: 'normal',
                        fontStyle: 'normal',
                      }}
                    >
                      处理元数据
                    </p>
                    <span
                      className="whitespace-pre-wrap text-xs"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.75rem',
                        color: '#212121',
                        fontWeight: 'normal',
                        fontStyle: 'normal',
                      }}
                    >
                      {JSON.stringify(result.metadata, null, 2)}
                    </span>
                  </div>
                )}
                {result.boxes?.length > 0 && (
                  <div>
                    <p
                      className="mb-2 text-xs"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.75rem',
                        color: '#212121',
                        fontWeight: 'normal',
                        fontStyle: 'normal',
                      }}
                    >
                      解析的边界框 ({result.boxes.length})
                    </p>
                    <div
                      className="max-h-32 space-y-1 overflow-y-auto p-2"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.75rem',
                        color: '#212121',
                        fontWeight: 'normal',
                        borderRadius: 10,
                        fontStyle: 'normal',
                      }}
                    >
                      {result.boxes.map((box, idx) => (
                        <div
                          key={idx}
                          className="font-mono text-xs"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '0.75rem',
                            color: '#212121',
                            fontWeight: 'normal',
                            fontStyle: 'normal',
                          }}
                        >
                          <span>Box {idx + 1}:</span> <span>{box.label}</span>{' '}
                          <span className="">[{box.box.map((n) => Math.round(n)).join(', ')}]</span>
                        </div>
                      ))}
                    </div>
                    <p
                      className="mt-2 text-xs"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.75rem',
                        color: '#212121',
                        fontWeight: 'normal',
                        fontStyle: 'normal',
                      }}
                    >
                      坐标从模型输出（0-999）缩放到图像像素
                    </p>
                  </div>
                )}
              </div>
            </details>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">解析完成!</span>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center space-y-4 py-20"
          >
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="h-20 w-20 rounded-full blur-xl"
              />
              <Sparkles className="text-400 absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 transform" />
            </div>
            <div className="text-center">
              <p className="text-lg">准备就绪</p>
              <p className="mt-1 text-sm">上传一张图片，点击分析！</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
