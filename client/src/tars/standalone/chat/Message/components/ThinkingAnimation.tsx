import React from 'react';
import { motion } from 'framer-motion';

interface ThinkingAnimationProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  className?: string;
}

export const ThinkingAnimation: React.FC<ThinkingAnimationProps> = ({
  size = 'medium',
  text = '正在思考',
  className = '',
}) => {
  const textClass = size === 'small' ? 'text-xs' : size === 'medium' ? 'text-sm' : 'text-base';

  return (
    <div className={`p-2 flex items-center ${className}`}>
      <span className={`${textClass} text-gray-400`}>
        {text}
      </span>
      <motion.span
        className={`${textClass} text-gray-400 ml-1 inline-block`}
        animate={{ opacity: [0, 1, 0] }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          repeatType: 'loop',
          ease: 'easeInOut',
          times: [0, 0.5, 1],
        }}
      >
        •••
      </motion.span>
    </div>
  );
};
