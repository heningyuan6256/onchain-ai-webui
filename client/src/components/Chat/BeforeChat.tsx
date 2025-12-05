// BeforeChat.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';

const BeforeChat: FC = () => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
      {/* 欢迎标题 */}
      <motion.h1
        className="mb-3 text-2xl font-semibold text-gray-800"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        你好！我是你的 AI 助手
      </motion.h1>

      {/* 描述文案 */}
      <motion.p
        className="max-w-md text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.3 }}
      >
        你可以问我任何问题，比如：
      </motion.p>

      {/* 示例问题（静态展示，仅作引导） */}
      <motion.div
        className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-500">
          “帮我写一段 Python 代码”
        </div>
        <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-500">
          “总结这篇文章的重点”
        </div>
        <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-500">
          “今天的天气怎么样？”
        </div>
        <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-500">
          “给我讲个笑话 😊”
        </div>
      </motion.div>

      {/* 底部提示 */}
      <motion.div
        className="mt-8 text-xs text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
      >
        在下方输入框中输入任意内容即可开始对话
      </motion.div>
    </div>
  );
};

export default BeforeChat;
