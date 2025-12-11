import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import categories from '~/pages/agent/agentlist/category';

export interface Category {
  value: string | number;
  label: string;
}

export interface CategoryFilterRef {
  activeId: string | number;
}

interface CategoryFilterProps {
  onChange?: (id: string | number) => void;
}

const CategoryFilter = forwardRef<CategoryFilterRef, CategoryFilterProps>(({ onChange }, ref) => {
  const [activeId, setActiveId] = useState(categories[0].value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    get activeId() {
      return activeId;
    },
  }));

  const updateSlider = (val: typeof activeId) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const btn = wrapper.querySelector(`[data-id="${val}"]`) as HTMLButtonElement;
    if (!btn) return;
    setSliderStyle({ left: btn.offsetLeft, width: btn.offsetWidth });
  };

  useEffect(() => {
    updateSlider(activeId);
    onChange?.(activeId);
  }, [activeId]);

  useEffect(() => {
    const onResize = () => updateSlider(activeId);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [activeId]);

  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });

  return (
    <div className="relative inline-flex items-center gap-2 rounded-full p-1" ref={wrapperRef}>
      <div
        className="absolute bottom-1 top-1 rounded-full shadow-md transition-all duration-300 ease-out"
        style={{
          left: sliderStyle.left,
          width: sliderStyle.width,
          background: 'linear-gradient(139deg, #FFFFFF 0%, #F4F4F5 100%)',
          borderRadius: '60px',
          border: '1px solid #E0E0E0',
        }}
      />

      {categories.map((cat) => (
        <button
          key={cat.value}
          data-id={cat.value}
          onClick={() => setActiveId(cat.value)}
          className={`relative z-10 px-3.5 py-2 text-sm font-medium transition-colors duration-200 ${
            activeId === cat.value ? 'text-blue-600' : 'text-gray-600 hover:text-black'
          }`}
          style={{
            color: activeId === cat.value ? '#333' : 'rgba(0,0,0,0.3)',
            fontSize: '12px',
            width: 'max-content',
          }}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
});

CategoryFilter.displayName = 'CategoryFilter';
export default CategoryFilter;
