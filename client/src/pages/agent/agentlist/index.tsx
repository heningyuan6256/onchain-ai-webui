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
import { useToastContext } from '@librechat/client';
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
import request from '~/request/request';

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
  const { showToast } = useToastContext();

  const navigate = useNavigate();

  const [applist, setAppList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const getList = async () => {
    const requestOptions: RequestInit = {
      method: 'get',
      redirect: 'follow',
    };
    request(`/v1/agent/system/agent/list_agent?pageNum=1&pageSize=500`, requestOptions).then(
      (data) => {
        setAppList(data?.rows || []);
        setLoading(false);
      },
    );
  };
  useEffect(() => {
    getList();
  }, []);

  return (
    <div className="flex h-[100%]">
      {/* 主体 */}
      <div className="flex flex-1 flex-col">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between p-4">
          <h1 className="text-[16px] font-bold text-[#333333]">智能体广场</h1>
          <div className="flex flex-1 items-center justify-center"></div>
          <div className="w-[64px]"></div>
          <Button
            onClick={() => {
              const searchParams = new URLSearchParams(location.search);
              const user = searchParams.get('user');
              navigate(`/agentconfig/new?user=${user}`);
            }}
          >
            创建智能体
          </Button>
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
                >
                  <div className="flex h-[32px] items-center text-[13px] font-semibold text-[#333333]">
                    <Icon src={appsLog} className="mr-2 h-4 w-4" />
                    <div className="flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap">
                      {app.agent_name}
                    </div>
                  </div>
                  <p className="mt-[8px] line-clamp-2 h-[32px] break-words text-xs text-[#26244C73]">
                    {app.description}
                  </p>
                  <div className="mt-[20px] flex justify-between">
                    <div className="flex flex-nowrap gap-2">
                      <Button
                        onClick={() => {
                          const searchParams = new URLSearchParams(location.search);
                          const user = searchParams.get('user');
                          navigate(
                            `/agentconfig/new?user=${user}&agent_id=${encodeURIComponent(app.agent_id)}`,
                          );
                        }}
                      >
                        编辑
                      </Button>
                      <Button
                        onClick={() => {
                          const searchParams = new URLSearchParams(location.search);
                          const user = searchParams.get('user');
                          navigate(
                            `/agentchat/new?user=${user}&agent_id=${encodeURIComponent(app.agent_id)}`,
                          );
                        }}
                      >
                        使用
                      </Button>
                      <Button
                        onClick={async () => {
                          const res = await request('/v1/agent/system/agent/delete_agent', {
                            method: 'delete',
                            params: { agent_ids: app.agent_id },
                          });
                          console.log('xxxxxxxxxxddee', res);

                          if (res.code === 200) {
                            showToast({
                              message: res.message,
                              status: 'success',
                            });
                            getList();
                          } else {
                            showToast({
                              message: res.message,
                              status: 'error',
                            });
                          }
                        }}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
