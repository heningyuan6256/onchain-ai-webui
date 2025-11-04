import type { TFile } from 'librechat-data-provider';
import type { ExtendedFile } from '~/common';
import { getFileType, cn } from '~/utils';
import FilePreview from './FilePreview';
import RemoveFile from './RemoveFile';
import Icon from '~/components/icon';
import FileSvg from "@/assets/image/file.svg";
import INCORRECTSVG from "@/assets/image/incorrect.svg";
import Image from './Image';
import ImagePreview from './ImagePreview';

const FileContainer = ({
  file,
  overrideType,
  buttonClassName,
  containerClassName,
  isImage,
  onDelete,
  onClick,
  source,
  url
}: {
  file: Partial<ExtendedFile | TFile>;
  overrideType?: string;
  buttonClassName?: string;
  containerClassName?: string;
  url?: string;
  isImage?: boolean;
  source?: string
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
          'h-[62px] w-[160px] relative overflow-hidden rounded-2xl border border border-[#E0E0E0] bg-white',
          buttonClassName,
        )}
        style={{ borderRadius: '10px 10px 2px 2px', padding: '10px 10px 18px 10px' }}
      >
        <div className="p-0 text-xs">
          <div className="flex flex-row items-center gap-2">
            {
              isImage ? <ImagePreview source={source} className="w-[28px] h-[28px]" url={url} progress={1} /> : <Icon className="mr-1.5 w-[28px]" src={FileSvg}></Icon>
            }
            <div className="overflow-hidden">
              <div className="truncate font-medium" title={file.filename}>
                {file.filename || "图片"}
              </div>
              <div className="truncate text-[10px] text-[#D0D0D0]" style={{ textAlign: 'left' }}>
                <span className='text-xs' style={{ transform: 'scale(0.8)', lineHeight: '18px' }}>{file.progress < 1 ? "解析中" : "上传完成"}</span>
              </div>
            </div>
          </div>
        </div>
      </button>
      {onDelete && <span onClick={onDelete} className='absolute right-[-3px] top-[-3px]' style={{ cursor: 'pointer' }}><Icon src={INCORRECTSVG} className='w-[12px]'></Icon></span>}
      <div className={`absolute bottom-0 bg-[#31D780] h-[3px] ${file.progress == 1 ? "w-full" : "w-[60%]"}`}>
      </div>
    </div>
  );
};

export default FileContainer;
