import { motion } from 'framer-motion'
import { Sliders } from 'lucide-react'

export default function AdvancedSettings({ settings, onSettingsChange, includeCaption, onIncludeCaptionChange }) {
  const handleChange = (key, value) => {
    onSettingsChange({
      ...settings,
      [key]: value
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="glass p-6 rounded-2xl space-y-4"
      style={{
        backgroundColor: '#ffff',
        color: 'black',
        border: '1px solid #e0e0e0',
        borderRadius: 10,
      }}
    >


      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.75rem',
            color: '#212121',
            fontWeight: 'normal',
            fontStyle: 'normal',
            borderRadius: '10px',
          }}>基底尺寸</label>
          <input
            type="number"
            value={settings.base_size}
            onChange={(e) => handleChange('base_size', parseInt(e.target.value))}
            className="w-full !rounded-[10px] border border-black/10 bg-white/5 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.75rem',
            color: '#212121',
            fontWeight: 'normal',
            fontStyle: 'normal',
            borderRadius: '10px',
          }}>图像尺寸</label>
          <input
            type="number"
            value={settings.image_size}
            onChange={(e) => handleChange('image_size', parseInt(e.target.value))}
            className="w-full !rounded-[10px] border border-black/10 bg-white/5 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.75rem',
            color: '#212121',
            fontWeight: 'normal',
            fontStyle: 'normal',
            borderRadius: '10px',
          }}>裁剪模式</label>
          <select
            value={settings.crop_mode ? 'true' : 'false'}
            onChange={(e) => handleChange('crop_mode', e.target.value === 'true')}
            className="w-full !rounded-[10px] border border-black/10 bg-white/5 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none"
          >
            <option value="true">启用</option>
            <option value="false">禁用</option>
          </select>
        </div>

        <div className="space-y-2">
          <label style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.75rem',
            color: '#212121',
            fontWeight: 'normal',
            fontStyle: 'normal',
            borderRadius: '10px',
          }}>测试压缩</label>
          <select
            value={settings.test_compress ? 'true' : 'false'}
            onChange={(e) => handleChange('test_compress', e.target.value === 'true')}
            className="w-full !rounded-[10px] border border-black/10 bg-white/5 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none"
          >
            <option value="false">禁用</option>
            <option value="true">启用</option>
          </select>
        </div>
      </div>

      <div className="pt-2 border-t border-white/10">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeCaption}
            onChange={(e) => onIncludeCaptionChange(e.target.checked)}
            className="accent-blue-500"
          />
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.75rem',
            color: '#212121',
            fontWeight: 'normal',
            fontStyle: 'normal',
            borderRadius: '10px',
          }}>包括图像标题</span>
        </label>
      </div>
    </motion.div>
  )
}
