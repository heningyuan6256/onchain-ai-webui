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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

  const categories = [
    '法律服务',
    '交通物流',
    '金融服务',
    '政企服务',
    '泛互联网',
    '教育科创',
    '企业服务',
    '文化传媒',
    '消费零售',
  ];
  const [applist, setAppList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const requestOptions: RequestInit = {
      method: 'get',
      redirect: 'follow',
    };
    fetch(`/apps/system/app/list?pageNum=1&pageSize=500`, requestOptions).then((res) => {
      res.json().then((data) => {
        setAppList(data?.rows || []);
        setLoading(false);
      });
    });
  }, []);

  return (
    <div className="flex h-[100%]">
      {/* 主体 */}
      <div className="flex flex-1 flex-col">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between p-4">
          <h1 className="text-[16px] font-bold text-[#333333]">应用市场</h1>
          <div className="flex flex-1 items-center justify-center">
            <Segmented<string>
              options={['应用模板', '应用实践', '解决方案']}
              onChange={(value) => {
                console.log(value); // string
              }}
            />
          </div>
          <div className="w-[64px]"></div>
        </div>

        <div className="flex flex-1 overflow-hidden border-t border-t-[#e4e4e4]">
          <div className="h-full w-full overflow-auto">
            {/* 卡片容器动画 */}
            <motion.div
              className="grid grid-cols-4 gap-[10px] overflow-hidden p-4"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {applist.map((app, idx) => (
                <motion.div
                  key={idx}
                  variants={cardVariants}
                  whileHover={{ scale: 1.03, boxShadow: '0px 4px 12px rgba(0,0,0,0.1)' }}
                  className="app_card_bg h-[168px] cursor-pointer rounded-sm border border-[#e6e8ee] p-5 transition-all duration-500 hover:border-[#0563B2]"
                  onClick={() => {
                    const searchParams = new URLSearchParams(location.search);
                    const user = searchParams.get('user');
                    navigate(
                      `/application/${app.app_url}?user=${user}&appId=${encodeURIComponent(app.app_id)}`,
                    );
                  }}
                >
                  <div className="flex h-[32px] items-center text-[13px] font-semibold text-[#333333]">
                    <Icon src={appsLog} className="mr-2 h-4 w-4" />
                    <div className="flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap">
                      {app.app_name}
                    </div>
                  </div>
                  <p className="mt-[8px] line-clamp-2 h-[32px] break-words text-xs text-[#26244C73]">
                    {app.app_description}
                  </p>
                  <div className="mt-[20px] flex justify-between">
                    <div className="flex flex-nowrap gap-2">
                      {['数字人视频', '智能体'].map((tag, i) => (
                        <span
                          key={i}
                          className="whitespace-nowrap rounded-sm bg-[#EFF0F3CC] px-2 py-1 text-xs text-[#8E8C99]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 whitespace-nowrap text-xs text-gray-400">
                      <Icon className="w-3 cursor-pointer" src={startSvg} />
                      {577}
                    </div>
                  </div>
                </motion.div>
              ))}
              {loading === false && (
                <>
                  <motion.div
                    key={'ocr'}
                    variants={cardVariants}
                    whileHover={{ scale: 1.03, boxShadow: '0px 4px 12px rgba(0,0,0,0.1)' }}
                    className="app_card_bg h-[168px] cursor-pointer rounded-sm border border-[#e6e8ee] p-5 transition-all duration-500 hover:border-[#0563B2]"
                    onClick={() => {
                      navigate(`/ocr?mode=plain_ocr`);
                    }}
                  >
                    <div className="flex h-[32px] items-center text-[13px] font-semibold text-[#333333]">
                      <Icon src={appsLog} className="mr-2 h-4 w-4" />
                      <div className="flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap">
                        {'通用OCR'}
                      </div>
                    </div>
                    <p className="mt-[8px] line-clamp-2 h-[32px] break-words text-xs text-[#26244C73]">
                      {'OCR应用'}
                    </p>
                    <div className="mt-[20px] flex justify-between">
                      <div className="flex flex-nowrap gap-2">
                        {['数字人视频', '智能体'].map((tag, i) => (
                          <span
                            key={i}
                            className="whitespace-nowrap rounded-sm bg-[#EFF0F3CC] px-2 py-1 text-xs text-[#8E8C99]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 whitespace-nowrap text-xs text-gray-400">
                        <Icon className="w-3 cursor-pointer" src={startSvg} />
                        {577}
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    key={'ocr'}
                    variants={cardVariants}
                    whileHover={{ scale: 1.03, boxShadow: '0px 4px 12px rgba(0,0,0,0.1)' }}
                    className="app_card_bg h-[168px] cursor-pointer rounded-sm border border-[#e6e8ee] p-5 transition-all duration-500 hover:border-[#0563B2]"
                    onClick={() => {
                      navigate(`/ocr?mode=describe`);
                    }}
                  >
                    <div className="flex h-[32px] items-center text-[13px] font-semibold text-[#333333]">
                      <Icon src={appsLog} className="mr-2 h-4 w-4" />
                      <div className="flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap">
                        {'图像描述'}
                      </div>
                    </div>
                    <p className="mt-[8px] line-clamp-2 h-[32px] break-words text-xs text-[#26244C73]">
                      {'OCR应用'}
                    </p>
                    <div className="mt-[20px] flex justify-between">
                      <div className="flex flex-nowrap gap-2">
                        {['数字人视频', '智能体'].map((tag, i) => (
                          <span
                            key={i}
                            className="whitespace-nowrap rounded-sm bg-[#EFF0F3CC] px-2 py-1 text-xs text-[#8E8C99]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 whitespace-nowrap text-xs text-gray-400">
                        <Icon className="w-3 cursor-pointer" src={startSvg} />
                        {577}
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    key={'ocr'}
                    variants={cardVariants}
                    whileHover={{ scale: 1.03, boxShadow: '0px 4px 12px rgba(0,0,0,0.1)' }}
                    className="app_card_bg h-[168px] cursor-pointer rounded-sm border border-[#e6e8ee] p-5 transition-all duration-500 hover:border-[#0563B2]"
                    onClick={() => {
                      navigate(`/ocr?mode=find_ref`);
                    }}
                  >
                    <div className="flex h-[32px] items-center text-[13px] font-semibold text-[#333333]">
                      <Icon src={appsLog} className="mr-2 h-4 w-4" />
                      <div className="flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap">
                        {'查找定位'}
                      </div>
                    </div>
                    <p className="mt-[8px] line-clamp-2 h-[32px] break-words text-xs text-[#26244C73]">
                      {'OCR应用'}
                    </p>
                    <div className="mt-[20px] flex justify-between">
                      <div className="flex flex-nowrap gap-2">
                        {['数字人视频', '智能体'].map((tag, i) => (
                          <span
                            key={i}
                            className="whitespace-nowrap rounded-sm bg-[#EFF0F3CC] px-2 py-1 text-xs text-[#8E8C99]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 whitespace-nowrap text-xs text-gray-400">
                        <Icon className="w-3 cursor-pointer" src={startSvg} />
                        {577}
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </motion.div>
          </div>

          {/* 右侧栏 */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex w-[240x] max-w-[240px] flex-col gap-6 border-l border-l-[#e4e4e4] bg-white p-6"
          >
            <div>
              <h2 className="mb-3 text-xs font-semibold text-gray-700">行业</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((c, i) => (
                  <span
                    key={i}
                    className="hover:[#0563B2] cursor-pointer rounded-sm border border-[#E4E4E4] bg-[#fff] px-3 py-1 text-xs text-[#26244CE0] transition hover:border-[#0563B2]"
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
