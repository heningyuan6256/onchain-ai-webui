import React, { FC, useEffect, useState } from 'react';
import { Calculator, Calendar, CreditCard, Settings, Smile, User } from 'lucide-react';

import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
} from '@/components/ui/command';
import STARSVG from '../assets/image/front-lightupcollect.svg';
import { Button } from '@/components/ui/button';
import ADDSVG from '@/assets/image/front-add.svg';
import MORESVG from '@/assets/image/front-more.svg';
import ADDWHITESVG from '@/assets/image/front-addWhite.svg';
import EDITSVG from '@/assets/image/front-edit.svg';
import TRASHSVG from '@/assets/image/front-trash.svg';
import startSvg from '@/assets/image/front-whitestart.svg';

import appsLog from '@/assets/image/front-apps.svg';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import Icon from '@/components/icon';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { generateSnowId } from '@/utils';
import { chatService } from '@/services/chat';
import { useUploadData } from '@/contexts/UploadDataContext';
import { toast } from 'sonner';
import { useSession } from '@/tars/common/hooks/useSession';

import { motion } from 'framer-motion';
import { Segmented } from 'antd';

const containerVariants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1, // 每个子元素依次延迟
		},
	},
};

const cardVariants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			type: 'spring',
			stiffness: 120,
			damping: 15,
		},
	},
};

export default function AppMarket() {
	const navigate = useNavigate();
	const apps = [
		{
			title: '电商-爆单短视频制作官',
			desc: '专注电商带货的简单视频制作，提供创意文案撰写、视频生成及数据跟踪。',
			tags: ['数字人视频', '智能体'],
			stats: { views: 577, likes: 18 },
		},
		{
			title: '公众号爆文工厂',
			desc: '快速生成符合公众号推送规范的图文混合内容，支持行业分析与标题优化。',
			tags: ['内容创作', '工作流'],
			stats: { views: 259, likes: 56 },
		},
		{
			title: '支付宝MCP体验',
			desc: '支付场景下的链路体验，通过MCP协议快速接入支付宝收单支付服务。',
			tags: ['快捷支付', '智能体'],
			stats: { views: 10146, likes: 135 },
		},
		{
			title: 'PPT自动生成',
			desc: '根据关键词生成结构化PPT内容，适合培训、汇报与教学使用。',
			tags: ['生成PPT', '智能体'],
			stats: { views: 5252, likes: 74 },
		},
		{
			title: '支付宝MCP体验',
			desc: '支付场景下的链路体验，通过MCP协议快速接入支付宝收单支付服务。',
			tags: ['快捷支付', '智能体'],
			stats: { views: 10146, likes: 135 },
		},
	];

	const categories = ['法律服务', '交通物流', '金融服务', '政企服务', '泛互联网', '教育科创', '企业服务', '文化传媒', '消费零售'];
	const [applist, setAppList] = useState<any[]>([]);
	useEffect(() => {
		const requestOptions: RequestInit = {
			method: 'get',
			redirect: 'follow',
		};
		fetch(`/apps/system/app/list?pageNum=1&pageSize=500`, requestOptions).then((res) => {
			res.json().then((data) => {
				setAppList(data?.rows || []);
			});
		});
	}, []);

	return (
		<div className='flex h-[100%]'>
			{/* 主体 */}
			<div className='flex-1 flex-col flex'>
				{/* 顶部导航 */}
				<div className='flex justify-between items-center p-4'>
					<h1 className='text-[16px] font-bold text-[#333333]'>应用市场</h1>
					<div className='flex-1 flex justify-center items-center'>
						<Segmented<string>
							options={['应用模板', '应用实践', '解决方案']}
							onChange={(value) => {
								console.log(value); // string
							}}
						/>
					</div>
					<div className='w-[64px]'></div>
				</div>

				<div className='flex-1 flex border-t-[#e4e4e4] border-t overflow-hidden'>
					<div className='overflow-auto h-full w-full'>
						{/* 卡片容器动画 */}
						<motion.div
							className='grid grid-cols-4 gap-[10px] p-4 overflow-hidden'
							variants={containerVariants}
							initial='hidden'
							animate='show'
						>
							{applist.map((app, idx) => (
								<motion.div
									key={idx}
									variants={cardVariants}
									whileHover={{ scale: 1.03, boxShadow: '0px 4px 12px rgba(0,0,0,0.1)' }}
									className='border-[#e6e8ee] border app_card_bg h-[168px] rounded-sm p-5 hover:border-[#0563B2] transition-all duration-500 cursor-pointer'
									onClick={() => {
										navigate(`/application/${app.app_url}?appId=${encodeURIComponent(app.app_id)}`);
									}}
								>
									<div className='font-semibold text-[13px] text-[#333333] h-[32px] flex items-center'>
										<Icon src={appsLog} className='h-4 w-4 mr-2' />
										<div className='flex-1 whitespace-nowrap overflow-hidden overflow-ellipsis'>{app.app_name}</div>
									</div>
									<p className='text-xs text-[#26244C73] line-clamp-2 mt-[8px] h-[32px] break-words'>{app.app_description}</p>
									<div className='flex justify-between mt-[20px]'>
										<div className='flex gap-2 flex-nowrap'>
											{['数字人视频', '智能体'].map((tag, i) => (
												<span
													key={i}
													className='px-2 py-1 bg-[#EFF0F3CC] text-xs text-[#8E8C99] rounded-sm whitespace-nowrap'
												>
													{tag}
												</span>
											))}
										</div>
										<div className='flex text-xs text-gray-400 gap-1 whitespace-nowrap items-center'>
											<Icon className='cursor-pointer w-3' src={startSvg} />
											{577}
										</div>
									</div>
								</motion.div>
							))}
						</motion.div>
					</div>

					{/* 右侧栏 */}
					<motion.div
						initial={{ x: 100, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						transition={{ duration: 0.4, ease: 'easeOut' }}
						className='w-[240x] max-w-[240px] p-6 border-l border-l-[#e4e4e4] bg-white flex flex-col gap-6'
					>
						<div>
							<h2 className='text-xs font-semibold mb-3 text-gray-700'>行业</h2>
							<div className='flex flex-wrap gap-2'>
								{categories.map((c, i) => (
									<span
										key={i}
										className='text-[#26244CE0] px-3 py-1 bg-[#fff] border-[#E4E4E4] border text-xs rounded-sm cursor-pointer hover:border-[#0563B2] hover:[#0563B2] transition'
									>
										{c}
									</span>
								))}
							</div>
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	);
}
