import React, { useEffect } from 'react';
import { MarkdownRenderer } from '@/tars/sdk/markdown-renderer';
import { FiCheck, FiCopy } from 'react-icons/fi';
import { useCopyToClipboard } from '@/tars/standalone/chat/Message/hooks/useCopyToClipboard';
import { Image } from 'antd';
import Icon from '@/components/icon';
import INCORRECTSVG from '@/assets/image/incorrect.svg';
import WORDSVG from '@/assets/image/front-wordfile.svg';
import EXCELSVG from '@/assets/image/front-downloadxlsx.svg';
import PDFSVG from '@/assets/image/front-pdffile.svg';
import DEFAULTFILE from '@/assets/image/front-file.svg';

import { Message } from '../types/chat';

interface MessageBubbleProps {
	message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
	const { isCopied, copyToClipboard } = useCopyToClipboard();

	const fileIcon = (type: string) => {
		if (type.includes('word')) return WORDSVG;
		if (type.includes('excel') || type.includes('sheet')) return EXCELSVG;
		if (type.includes('pdf')) return PDFSVG;
		return DEFAULTFILE;
	};

	const formatSize = (bytes: number) => {
		if (bytes < 1024) return bytes + ' B';
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
		return (bytes / 1024 / 1024).toFixed(1) + ' MB';
	};

	const handleCopy = () => {
		const text = typeof message.content === 'string' ? message.content : message.content.map((p: any) => p.text || '').join('\n');
		copyToClipboard(text);
	};

	const parts =
		message.files?.map((f: File) => ({
			type: f.type.startsWith('image/') ? ('image_url' as const) : ('file_icon' as const),
			fileName: f.name,
			mimeType: f.type,
			size: f.size,
		})) ?? [];
	const toBase64 = (file: File): Promise<string> =>
		new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = reject;
		});

	const [imgSrc, setImgSrc] = React.useState<Record<number, string>>({});

	useEffect(() => {
		parts.forEach((p, idx) => {
			if (p.type === 'image_url' && !p.fileName.startsWith('data:')) {
				const file = message.files?.[idx];
				if (file) toBase64(file).then((url) => setImgSrc((s) => ({ ...s, [idx]: url })));
			}
		});
	}, [parts, message.files]);
	return (
		<div
			className='chat-line'
			style={{
				flexDirection: 'column',
				alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
				padding: '16px 16px 0',
			}}
		>
			{parts.length > 0 && (
				<div className='flex flex-wrap gap-2  mb-2 rounded-lg  bg-white justify-center items-center'>
					{parts.map((p, idx) =>
						p.type === 'image_url' ? (
							<div
								key={idx}
								className='relative max-w-[180px] overflow-hidden border border-[#E0E0E0] bg-white text-[0px]'
								style={{ borderRadius: 5 }}
							>
								<Image
									src={imgSrc[idx] || p.fileName}
									alt={`upload-${idx}`}
									className='w-auto h-auto max-h-[120px] object-cover block'
								/>
							</div>
						) : (
							<div
								key={idx}
								className='relative h-[40px] w-[160px] rounded overflow-hidden border border-[#E0E0E0] bg-white flex items-center px-2 py-1'
							>
								<div className='flex-shrink-0 w-5 h-5 mr-2'>
									<Icon className='w-full h-full text-[#0563B2]' src={fileIcon(p.mimeType)} />
								</div>
								<div className='flex-1 min-w-0'>
									<div className='text-xs text-black font-semibold leading-tight truncate' title={p.fileName}>
										{p.fileName}
									</div>
									<div className='text-[9px] text-gray-500 leading-tight mt-0.5'>{formatSize(p.size)}</div>
								</div>
							</div>
						)
					)}
				</div>
			)}

			<div className='chat-bubble-wrapper' data-sender={message.sender}>
				<div className='chat-bubble' data-sender={message.sender}>
					<div className='chat-text'>
						<MarkdownRenderer content={message.content} />
					</div>
				</div>
			</div>

			{message.sender === 'bot' && (
				<div className='flex items-center justify-between w-full px-[15px] mt-1 text-xs'>
					<button
						onClick={handleCopy}
						className='flex items-center text-gray-400 hover:text-accent-500 dark:hover:text-accent-400 transition-colors cursor-pointer'
						title='Copy message'
					>
						{isCopied ? <FiCheck size={12} /> : <FiCopy size={12} />}
						<span className='ml-1'>{isCopied ? '复制成功' : '复制'}</span>
					</button>
					<span className='text-[#26244C73]'>字数：{message.content?.length ?? 0}</span>
				</div>
			)}
		</div>
	);
};
