import { FC, useEffect, useMemo, useRef, useState } from 'react';
import '@/pages/index.css';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import ATTACHMENTSVG from '@/assets/image/front-document.svg';
import ARROWSVG from '@/assets/image/front-arrow.svg';
import AISVG from '@/assets/image/front-ai.svg';
import AIWhiteSVG from '@/assets/image/front-ai-white.svg';
import LibrarySVG from '@/assets/image/front-library.svg';
import ChooseSvg from '@/assets/image/front-choose.svg';
import UnChooseSvg from '@/assets/image/front-unchoose.svg';
import INCORRECTSVG from '@/assets/image/incorrect.svg';
import WORDSVG from '@/assets/image/front-wordfile.svg';
import EXCELSVG from '@/assets/image/front-downloadxlsx.svg';
import PDFSVG from '@/assets/image/front-pdffile.svg';
import DEFAULTFILE from '@/assets/image/front-file.svg';
import { Toggle } from '@/components/ui/toggle';
import Icon from '@/components/icon';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { useUploadData } from '@/contexts/UploadDataContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DropdownMenuLabel } from '@radix-ui/react-dropdown-menu';
import { ChatCompletionContentPart } from '@multimodal/agent-interface';
import ChatLoading from '@/components/ChatLoading';

export interface ChatTextBoxProps {
	onSubmit: (msg: any, files?: File[]) => void;
	onSetKnowledge?: (status: boolean) => void;
	knowledge?: boolean;
	disabled?: boolean;
	isupload?: boolean;
}

const ChatTextBox: FC<ChatTextBoxProps> = (props) => {
	const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
	const [uploadedImages, setUploadedImages] = useState<ChatCompletionContentPart[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [inputMessage, setInputMessage] = useState('');
	const [isComposing, setIsComposing] = useState(false);

	const { isStreaming, libraryData, checkList, setCheckList, thinking, setThinking } = useUploadData();
	const fileIcon = (type: string): string => {
		if (type.startsWith('image/')) return '';
		if (type.includes('word')) return WORDSVG;
		if (type.includes('sheet') || type.includes('excel')) return EXCELSVG;
		if (type.includes('pdf')) return PDFSVG;
		return DEFAULTFILE;
	};
	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (isStreaming || isComposing || props.disabled) return;
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files) return;
		Array.from(files).forEach((file) => {
			setUploadedFiles((prev) => [...prev, file]);
			if (file.type.startsWith('image/')) {
				const reader = new FileReader();
				reader.onload = (ev) => {
					if (ev.target?.result)
						setUploadedImages((prev) => [
							...prev,
							{ type: 'image_url', image_url: { url: ev.target!.result as string, detail: 'auto' } },
						]);
				};
				reader.readAsDataURL(file);
			} else {
				setUploadedImages((prev) => [...prev, { type: 'file_icon', fileName: file.name, mimeType: file.type } as any]);
			}
		});
		if (fileInputRef.current) fileInputRef.current.value = '';
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
		if (!props.isupload) return;
		const items = e.clipboardData?.items;
		if (!items) return;
		Array.from(items).forEach((item) => {
			const file = item.getAsFile();
			if (!file) return;
			setUploadedFiles((prev) => [...prev, file]);
			if (file.type.startsWith('image/')) {
				const reader = new FileReader();
				reader.onload = (ev) => {
					if (ev.target?.result)
						setUploadedImages((prev) => [
							...prev,
							{ type: 'image_url', image_url: { url: ev.target!.result as string, detail: 'auto' } },
						]);
				};
				reader.readAsDataURL(file);
			} else {
				setUploadedImages((prev) => [...prev, { type: 'file_icon', fileName: file.name, mimeType: file.type } as any]);
			}
		});
	};
	const handleRemoveFile = (index: number) => {
		setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
		setUploadedImages((prev) => prev.filter((_, i) => i !== index));
	};

	/* ---------------- 知识库默认全选 ---------------- */
	useEffect(() => {
		setCheckList(libraryData.map((item) => item.id));
	}, [libraryData.length]);
	const formatSize = (bytes: number) => {
		if (bytes < 1024) return bytes + ' B';
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
		return (bytes / 1024 / 1024).toFixed(1) + ' MB';
	};
	/* ---------------- 发送按钮 ---------------- */
	const handleSend = () => {
		if (!inputMessage.trim() && uploadedFiles.length === 0) return;
		props.onSubmit(inputMessage, uploadedFiles);

		setTimeout(() => {
			setUploadedFiles([]);
			setUploadedImages([]);
			setInputMessage('');
		}, 300);
	};

	return (
		<div className='chat_box mb-2.5 h-[175px]' style={{ width: '100%' }}>
			<ChatLoading loading={!!props.disabled}>
				<div className='chat_input textarea_bg border-[rgba(0,0,0,0)] border hover:border-[#0563B2] hover:border min-h-[121px] transition-all rounded-[8px]'>
					{uploadedImages.length > 0 && (
						<div className='px-[10px] pt-[10px] overflow-x-auto'>
							<div className='flex items-center gap-2 w-max'>
								{uploadedImages.map((img, idx) => (
									<>
										{img.type === 'image_url' ? (
											<div className='relative w-[72px] h-[72px] rounded overflow-hidden border border-[#E0E0E0] flex-shrink-0'>
												<img src={img.image_url.url} alt={`upload-${idx}`} className='w-full h-full object-cover' />
												<span
													onClick={() => handleRemoveFile(idx)}
													className='absolute top-0 right-0 bg-white text-black rounded-full text-xs cursor-pointer h-[12px] w-[12px]'
												>
													<Icon src={INCORRECTSVG} />
												</span>
											</div>
										) : (
											<div className='relative w-[160px] h-[40px] rounded overflow-hidden border border-[#E0E0E0] bg-white flex items-center p-1 flex-shrink-0'>
												<div className='flex-shrink-0 w-6 h-6 mr-1'>
													<Icon className='w-full h-full text-[#0563B2]' src={fileIcon(img?.mimeType)} />
												</div>
												<div className='flex-1 min-w-0'>
													<div
														className='text-[11px] text-black font-semibold leading-tight truncate'
														title={img?.fileName}
													>
														{img?.fileName}
													</div>
													<div className='text-[9px] text-gray-500 leading-tight mt-0.5'>
														{formatSize(uploadedFiles[idx]?.size ?? 0)}
													</div>
												</div>
												<span
													onClick={() => handleRemoveFile(idx)}
													className='absolute top-0 right-0 bg-white text-black rounded-full text-xs cursor-pointer h-[12px] w-[12px] flex items-center justify-center'
												>
													<Icon src={INCORRECTSVG} />
												</span>
											</div>
										)}
									</>
								))}
							</div>
						</div>
					)}
					<Textarea
						value={inputMessage}
						disabled={!!props.disabled}
						placeholder='您好，询问相关问题'
						className={`placeholder:text-[rgba(0,0,0,0.3)] placeholder:text-xs ${
							uploadedImages.length ? 'h-[29px]' : 'h-[121px]'
						} max-h-[${uploadedImages.length ? '29px' : '121px'}] border-none shadow-none resize-none text-xs`}
						onChange={(e) => setInputMessage(e.target.value)}
						onKeyDown={handleKeyDown}
						onPaste={handlePaste}
						onCompositionStart={() => setIsComposing(true)}
						onCompositionEnd={() => setIsComposing(false)}
					/>
				</div>
			</ChatLoading>

			<div className='chat_sub'>
				<div className='flex'>
					<div
						className={`rounded-[50%] h-[24px] w-[24px] flex items-center justify-center bg-muted ${
							props.isupload ? 'cursor-pointer hover:bg-gray-200' : 'cursor-not-allowed opacity-50'
						}`}
						onClick={props.isupload ? () => fileInputRef.current?.click() : undefined}
					>
						<Tooltip>
							<TooltipTrigger asChild>
								<span className={props.isupload ? '' : 'cursor-not-allowed'}>
									<Icon className='w-2.5 h-2.5' src={ATTACHMENTSVG} />
								</span>
							</TooltipTrigger>
							<TooltipContent>{props.isupload ? '支持图片上传（jpg/png/gif）' : '当前不可上传'}</TooltipContent>
						</Tooltip>

						<input ref={fileInputRef} type='file' multiple disabled={!props.isupload} onChange={handleFileChange} className='hidden' />
					</div>

					<Toggle
						pressed={thinking}
						onPressedChange={setThinking}
						className='rounded-[12px] h-[24px] text-xs font-[400] w-[82px] ml-[10px] cursor-pointer'
					>
						<div className='w-3'>
							<Icon className={!thinking ? 'w-3 h-3' : 'w-0 h-0'} src={AISVG} />
							<Icon className={!thinking ? 'w-0 h-0' : 'w-3 h-3'} src={AIWhiteSVG} />
						</div>
						深入研究
					</Toggle>
				</div>

				<div className='flex items-center'>
					{/* 知识库下拉 */}
					<DropdownMenu>
						{/* <DropdownMenuTrigger asChild>
							<span className='mr-1.5 text-xs whitespace-nowrap cursor-pointer'>
								{props.knowledge
									? checkList.length === 0
										? '未选择'
										: checkList.length === libraryData.length
										? '工业知识库'
										: libraryData.find((item) => checkList.includes(item.id))?.name || ''
									: '工业知识库'}
							</span>
						</DropdownMenuTrigger> */}
						<DropdownMenuContent className='w-[160px]'>
							<DropdownMenuLabel>
								<div
									className='flex cursor-pointer justify-between h-[36px] items-center px-2'
									onClick={() => setCheckList(checkList.length !== libraryData.length ? libraryData.map((i) => i.id) : [])}
								>
									<div className='text-xs text-[rgba(51,51,51,0.8)]'>全选</div>
									<Icon className='w-4 h-4' src={checkList.length === libraryData.length ? ChooseSvg : UnChooseSvg} />
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator className='px-1.5' />
							{libraryData.map((item) => (
								<DropdownMenuItem key={item.id} className='py-0 h-[28px]'>
									<div
										className='flex cursor-pointer justify-between flex-1 w-full h-full'
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											setCheckList([item.id]);
										}}
									>
										<div className='text-xs text-[rgba(51,51,51,0.8)] flex'>
											<span className='mr-1.5'>
												<Icon src={LibrarySVG} />
											</span>
											<div className='flex-1 overflow-hidden text-ellipsis'>{item.name}</div>
										</div>
										<Icon className='w-4 h-4' src={checkList.includes(item.id) ? ChooseSvg : UnChooseSvg} />
									</div>
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>

					<Separator orientation='vertical' className='data-[orientation=vertical]:h-4 mr-2.5' />

					{/* 发送按钮 */}
					<Button
						size='icon'
						className='bg-[#0563B2] h-[24px] w-[24px] rounded-[50%] p-0 cursor-pointer'
						onClick={handleSend}
						disabled={!inputMessage || uploadedImages.length === 0}
					>
						<Icon className='w-4 h-4 rotate-180' src={ARROWSVG} />
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ChatTextBox;
