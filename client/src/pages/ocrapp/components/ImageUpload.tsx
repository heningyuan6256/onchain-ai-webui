import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

export default function ImageUpload({ onImageSelect, preview }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles?.[0]) {
        onImageSelect(acceptedFiles[0]);
      }
    },
    [onImageSelect],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp'],
    },
    multiple: false,
  });

  return (
    <div
      className="glass space-y-4 p-6"
      style={{
        backgroundColor: '#ffff',
        color: 'black',
        border: '1px solid #e0e0e0',
        borderRadius: '10px',
      }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">上传图片</h3>
        <ImageIcon className="text-400 h-5 w-5" />
      </div>

      {!preview ? (
        <motion.div
          {...getRootProps()}
          className={`relative cursor-pointer border-2 border-dashed p-12 text-center transition-all duration-300 ${isDragActive ? 'border-purple-500 bg-purple-500/10' : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'} `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <input {...getInputProps()} />

          <div className="space-y-4">
            <motion.div
              animate={{
                y: isDragActive ? -10 : 0,
                scale: isDragActive ? 1.1 : 1,
              }}
              className="flex justify-center"
            >
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r opacity-50 blur-xl"
                  style={{ backgroundColor: '#868788ff' }}
                />
                <div
                  className="relative rounded-2xl bg-gradient-to-br p-4"
                  style={{ backgroundColor: '#868788ff' }}
                >
                  <Upload className="h-8 w-8" />
                </div>
              </div>
            </motion.div>

            <div>
              <p className="text-xg font-medium">
                {isDragActive ? '系统繁忙' : '拖拽放入你的图像'}
              </p>
              <p className="mt-1 text-sm text-gray-400">或点击上传图像最大10MB</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="group relative overflow-hidden"
        >
          <img src={preview} alt="Preview" className="w-full border border-white/10" />
          <div className="absolute right-3 top-3 flex gap-2">
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onImageSelect(null);
              }}
              className="flex items-center gap-2 bg-red-500/90 px-3 py-2 opacity-100 shadow-lg backdrop-blur-sm transition-colors hover:bg-red-600"
              whileHover={{ scale: 1.05 }}
              style={{ borderRadius: 10 }}
              whileTap={{ scale: 0.95 }}
              title="Remove image"
            >
              <X className="h-4 w-4" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
