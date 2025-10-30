import React from 'react';
import { ToolResultContentPart } from '..//types';
import { motion } from 'framer-motion';
import { FiDownload, FiZoomIn } from 'react-icons/fi';
import { BrowserShell } from './BrowserShell';

interface ImageRendererProps {
  part: ToolResultContentPart;
  onAction?: (action: string, data: any) => void;
}

/**
 * Renders image content with zoom and download actions
 */
export const ImageRenderer: React.FC<ImageRendererProps> = ({ part, onAction }) => {
  const { imageData, mimeType = 'image/png', name } = part;

  if (!imageData) {
    return <div className="text-gray-500 italic">Image data missing</div>;
  }

  const imgSrc = `data:${mimeType};base64,${imageData}`;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imgSrc;
    link.download = name || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoom = () => {
    if (onAction) {
      onAction('zoom', { src: imgSrc, alt: name });
    }
  };

  const isScreenshot =
    name?.toLowerCase().includes('screenshot') || name?.toLowerCase().includes('browser');

  const actionButtons = (
    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleZoom}
        className="p-2 bg-gray-800/70 hover:bg-gray-800/90 rounded-full text-white"
        title="Zoom"
      >
        <FiZoomIn size={16} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleDownload}
        className="p-2 bg-gray-800/70 hover:bg-gray-800/90 rounded-full text-white"
        title="Download"
      >
        <FiDownload size={16} />
      </motion.button>
    </div>
  );

  if (isScreenshot) {
    return (
      <div className="relative group">
        <BrowserShell title={name || 'Browser Screenshot'}>
          <img src={imgSrc} alt={name || 'Image'} className="w-full h-auto object-contain" />
        </BrowserShell>
        {actionButtons}
      </div>
    );
  }

  return (
    <div className="relative group">
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-2 border border-gray-200/50 dark:border-gray-700/30 shadow-sm"
      >
        <div className="relative">
          <img
            src={imgSrc}
            alt={name || 'Image'}
            className="max-h-[70vh] object-contain rounded-lg mx-auto"
          />

          {actionButtons}
        </div>
      </motion.div>
    </div>
  );
};
