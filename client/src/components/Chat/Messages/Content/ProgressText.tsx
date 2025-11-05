import * as Popover from '@radix-ui/react-popover';
import { Spinner } from '@librechat/client';
import { ChevronDown, ChevronUp } from 'lucide-react';
import CancelledIcon from './CancelledIcon';
import FinishedIcon from './FinishedIcon';
import { cn } from '~/utils';

const wrapperClass =
  'progress-text-wrapper text-token-text-secondary relative -mt-[0.75px] h-[32px] w-full leading-5 bg-[rgba(244,244,245,0.3)]';

const Wrapper = ({ popover, children }: { popover: boolean; children: React.ReactNode }) => {
  if (popover) {
    return (
      <div className={wrapperClass}>
        <Popover.Trigger asChild>
          <div
            className="progress-text-content bg-[rgba(244,244,245,0.3)] w-full py-[5px] px-[12px] absolute left-0 top-0 overflow-visible whitespace-nowrap"
            style={{ opacity: 1, transform: 'none' }}
            data-projection-id="78"
          >
            {children}
          </div>
        </Popover.Trigger>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <div
        className="progress-text-content bg-[rgba(244,244,245,0.3)] w-full text-xs rounded-[15px] py-[5px] px-[12px] border border-[#E0E0E0] absolute left-0 top-0 overflow-visible whitespace-nowrap"
        style={{ opacity: 1, transform: 'none' }}
        data-projection-id="78"
      >
        {children}
      </div>
    </div>
  );
};

export default function ProgressText({
  progress,
  onClick,
  inProgressText,
  finishedText,
  authText,
  hasInput = true,
  popover = false,
  isExpanded = false,
  error = false,
}: {
  progress: number;
  onClick?: () => void;
  inProgressText: string;
  finishedText: string;
  authText?: string;
  hasInput?: boolean;
  popover?: boolean;
  isExpanded?: boolean;
  error?: boolean;
}) {
  const getText = () => {
    if (error) {
      return finishedText;
    }
    if (progress < 1) {
      return authText ?? inProgressText;
    }
    return finishedText;
  };

  const getIcon = () => {
    if (error) {
      return <CancelledIcon />;
    }
    if (progress < 1) {
      return <Spinner />;
    }
    return <FinishedIcon />;
  };

  const text = getText();
  const icon = getIcon();
  const showShimmer = progress < 1 && !error;

  return (
    <Wrapper popover={popover}>
      <button
        type="button"
        className={cn(
          'inline-flex w-full items-center gap-2',
          hasInput ? '' : 'pointer-events-none',
          "text-xs",
          "flex",
          "items-center"
        )}
        disabled={!hasInput}
        onClick={hasInput ? onClick : undefined}
      >
        {icon}
        <span className={showShimmer ? 'shimmer text-xs' : 'text-xs'}>{text}</span>
        {hasInput &&
          (isExpanded ? (
            <ChevronUp className="size-4 shrink-0 translate-y-[1px]" />
          ) : (
            <ChevronDown className="size-4 shrink-0 translate-y-[1px]" />
          ))}
      </button>
    </Wrapper>
  );
}
