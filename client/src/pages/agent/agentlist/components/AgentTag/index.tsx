import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
interface TagProps {
  color: string;
  children: ReactNode;
  className?: string;
}

export default function Tag({ color, children, className }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex select-none items-center rounded-[3px] px-2 py-0.5 text-xs font-medium',
        className,
      )}
      style={{
        color,
        backgroundColor: `${color}14`,
      }}
    >
      {children}
    </span>
  );
}
