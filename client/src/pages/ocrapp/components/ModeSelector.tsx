import { motion } from 'framer-motion';

export default function ModeSelector({
  mode,
  onModeChange,
  modes,
  prompt,
  onPromptChange,
  findTerm,
  onFindTermChange,
}) {
  const selectedMode = modes.find((m) => m.id === mode);
  const needsInput = selectedMode?.needsInput;

  return (
    <div
      className="space-y-3 p-6"
      style={{
        backgroundColor: '#ffff',
        color: 'black',
        border: '1px solid #e0e0e0',
        borderRadius: '10px',
      }}
    >
      <h3 className="font-semibold">{modes.find((m) => m.id === mode)?.name}</h3>

      {/* <div className="grid grid-cols-4 gap-2">
        {modes.map((m) => {
          const Icon = m.icon;
          const isSelected = mode === m.id;

          return (
            <motion.button
              key={m.id}
              onClick={() => onModeChange(m.id)}
              className={`relative rounded-xl p-2 text-center transition-all ${isSelected ? 'glass border-white/20 shadow-lg' : 'border border-white/10 bg-white/5 hover:border-white/20'} `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSelected && (
                <motion.div
                  layoutId="selected-mode"
                  className={`absolute inset-0 rounded-xl bg-gradient-to-br`}
                  style={{ backgroundColor: '#eeeeee' }}
                  // transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}

              <div className="relative space-y-1">
                <div
                  className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg ${isSelected ? `bg-gradient-to-br` : 'bg-white/10'} `}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <p className={`text-xs`}>{m.name}</p>
              </div>
            </motion.button>
          );
        })}
      </div> */}

      {needsInput === 'findTerm' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <input
            type="text"
            value={findTerm}
            onChange={(e) => onFindTermChange(e.target.value)}
            placeholder="输入要查找的术语（例如，总计、发票号）"
            className="w-full !rounded-[10px] border border-black/10 bg-white/5 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none"
          />
        </motion.div>
      )}

      {needsInput === 'prompt' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="输入你的提示词..."
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm transition-colors focus:border-purple-500 focus:outline-none"
            rows={2}
          />
        </motion.div>
      )}
    </div>
  );
}
