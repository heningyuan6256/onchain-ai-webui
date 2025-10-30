import { motion } from "framer-motion";
import React from "react";
import classNames from "classnames";

type ChatLoadingProps = {
  loading: boolean;
  children: React.ReactNode;
};

const ChatLoading: React.FC<ChatLoadingProps> = ({ loading, children }) => {
  return (
    <div className="relative">
      {/* 正常内容 */}
      <div className={classNames({ "pointer-events-none opacity-50": loading })}>
        {children}
      </div>

      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm bg-white/30 dark:bg-black/20 overflow-hidden">
          {/* 浅灰色粒子背景 */}
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute w-1 h-1 rounded-full bg-gray-300/50 dark:bg-gray-500/40"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: ["0%", "-40%", "0%"],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* 中间卡片 */}
          <motion.div
            // initial={{ scale: 0.95 }}
            // animate={{ scale: [0.95, 1.02, 0.95] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm bg-white/70 dark:bg-white/10 backdrop-blur-md"
          >
            {/* 圆点加载 */}
            <div className="flex space-x-1">
              {[0, 0.15, 0.3].map((delay, i) => (
                <motion.span
                  key={i}
                  className="w-1 h-1 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 dark:from-gray-200 dark:to-gray-400"
                  animate={{ y: ["0%", "-40%", "0%"], opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatType: "loop",
                    delay,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
            <span className="text-gray-600 dark:text-gray-200 text-sm font-medium tracking-wide">
              AI Agent Running...
            </span>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ChatLoading;
