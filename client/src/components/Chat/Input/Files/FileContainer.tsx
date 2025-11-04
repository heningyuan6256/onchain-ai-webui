import type { TFile } from 'librechat-data-provider';
import type { ExtendedFile } from '~/common';
import { getFileType, cn } from '~/utils';
import FilePreview from './FilePreview';
import RemoveFile from './RemoveFile';
import Icon from '~/components/icon';
import FileSvg from "@/assets/image/file.svg";

const FileContainer = ({
  file,
  overrideType,
  buttonClassName,
  containerClassName,
  onDelete,
  onClick,
}: {
  file: Partial<ExtendedFile | TFile>;
  overrideType?: string;
  buttonClassName?: string;
  containerClassName?: string;
  onDelete?: () => void;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}) => {
  const fileType = getFileType(overrideType ?? file.type);

  return (
    <div
      className={cn('group relative inline-block text-sm text-text-primary', containerClassName)}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={file.filename}
        className={cn(
          'h-[62px] relative overflow-hidden rounded-2xl border border border-[#E0E0E0] bg-white',
          buttonClassName,
        )}
        style={{ borderRadius: '10px 10px 2px 2px', padding: '10px 10px 18px 10px' }}
      >
        <div className="w-56 p-0 text-xs">
          <div className="flex flex-row items-center gap-2">
            <Icon className="mr-1.5 w-[28px]" src={FileSvg}></Icon>{" "}
            {/* <FilePreview file={file} fileType={fileType} className="relative" /> */}
            <div className="overflow-hidden">
              <div className="truncate font-medium" title={file.filename}>
                {file.filename}
              </div>
              <div className="truncate text-[10px] text-[#D0D0D0]" style={{ textAlign: 'left' }} title={"上传完成"}>
                <span className='text-xs' style={{ transform: 'scale(0.8)', lineHeight: '18px' }}>上传完成</span>
              </div>
            </div>
          </div>
        </div>
      </button>
      {onDelete && <RemoveFile onRemove={onDelete} />}
      <div className='absolute bottom-0 bg-[#31D780] h-[3px] w-full'>
      </div>
    </div>
  );
};

export default FileContainer;
