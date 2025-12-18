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
  const navigate = useNavigate();
  const [headerCategory, setHeaderCategory] = useState<any[]>([]);
  const [siderCategory, setSiderCategory] = useState<any[]>([]);
  const [headerCategorySelected, setHeaderCategorySelected] = useState<string>();
  const [siderCategorySelected, setSiderCategorySelected] = useState<string[]>([]);

  const [applist, setAppList] = useState<any[]>([]);
  const [fliterList, setFliterList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const getAppList = async () => {
    const requestOptions: RequestInit = {
      method: 'get',
      redirect: 'follow',
    };
    request(`/apps/system/app/list?pageNum=1&pageSize=10000`, requestOptions).then((data) => {
      setAppList(data?.rows || []);
      setLoading(false);
    });
  };
  useEffect(() => {
    const headerTagValue = headerCategory.find((item) => item.label === headerCategorySelected);
    const siderTagValue = siderCategory.filter((item) =>
      siderCategorySelected.includes(item.label),
    );
    if (headerTagValue && Array.isArray(applist) && Array.isArray(siderTagValue)) {
      setFliterList(
        applist.filter((item) => {
          if (
            siderTagValue.length !== 0 &&
            !siderTagValue.find((o) => {
              return o.value === item.tag2;
            })
          ) {
            return false;
          }
          return item.tag1 === headerTagValue.value;
        }),
      );
    }
  }, [headerCategorySelected, siderCategorySelected, applist]);
  const getHeaderCategories = async () => {
    const requestOptions: RequestInit = { method: 'get', redirect: 'follow' };
    request(
      `/backend/sys/dict/data/list?pageNum=1&pageSize=10000&dictType=appheadertag`,
      requestOptions,
    ).then((data) => {
      setHeaderCategory(
        data?.rows?.map((item) => {
          return { value: item.dictValue, label: item.dictLabel };
        }) || [],
      );
      if (data?.rows?.length) {
        setHeaderCategorySelected(data?.rows[0].dictLabel);
      }
    });
  };
  const getSiderCategories = async () => {
    const requestOptions: RequestInit = { method: 'get', redirect: 'follow' };
    request(
      `/backend/sys/dict/data/list?pageNum=1&pageSize=10000&dictType=appsidertag`,
      requestOptions,
    ).then((data) => {
      setSiderCategory(
        data?.rows?.map((item) => {
          return { value: item.dictValue, label: item.dictLabel };
        }) || [],
      );
    });
  };
  useEffect(() => {
    getAppList();
    getHeaderCategories();
    getSiderCategories();
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
              value={headerCategorySelected}
              options={headerCategory.map((item) => {
                return item.label;
              })}
              onChange={(value) => {
                setHeaderCategorySelected(value);
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
              {fliterList.map((app, idx) => (
                <motion.div
                  key={idx}
                  variants={cardVariants}
                  whileHover={{ scale: 1.03, boxShadow: '0px 4px 12px rgba(0,0,0,0.1)' }}
                  className="app_card_bg h-[168px] cursor-pointer rounded-sm border border-[#e6e8ee] p-5 transition-all duration-500 hover:border-[#0563B2]"
                  onClick={() => {
                    const searchParams = new URLSearchParams(location.search);
                    const user = searchParams.get('user');
                    navigate(
                      `/wagentchat/new?user=${user}&workflowId=${encodeURIComponent(app.workflow_id)}`,
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
                      {[
                        headerCategory?.find((o) => o.value === app.tag1),
                        siderCategory?.find((o) => o.value === app.tag2),
                      ]
                        .filter(Boolean) // 去掉 undefined
                        .map((tag, i) => (
                          <span
                            key={i}
                            className="whitespace-nowrap rounded-sm bg-[#EFF0F3CC] px-2 py-1 text-xs text-[#8E8C99]"
                          >
                            {tag.label}
                          </span>
                        ))}
                    </div>
                    {/* <div className="flex items-center gap-1 whitespace-nowrap text-xs text-gray-400">
                      <Icon className="w-3 cursor-pointer" src={startSvg} />
                      {577}
                    </div> */}
                  </div>
                </motion.div>
              ))}
              {loading === false &&
                headerCategorySelected === '应用模板' &&
                (siderCategorySelected?.length === 0
                  ? true
                  : siderCategorySelected.includes('泛互联网')) && (
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
                          {['应用模板', '泛互联网'].map((tag, i) => (
                            <span
                              key={i}
                              className="whitespace-nowrap rounded-sm bg-[#EFF0F3CC] px-2 py-1 text-xs text-[#8E8C99]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        {/* <div className="flex items-center gap-1 whitespace-nowrap text-xs text-gray-400">
                          <Icon className="w-3 cursor-pointer" src={startSvg} />
                          {577}
                        </div> */}
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
                          {['应用模板', '泛互联网'].map((tag, i) => (
                            <span
                              key={i}
                              className="whitespace-nowrap rounded-sm bg-[#EFF0F3CC] px-2 py-1 text-xs text-[#8E8C99]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        {/* <div className="flex items-center gap-1 whitespace-nowrap text-xs text-gray-400">
                          <Icon className="w-3 cursor-pointer" src={startSvg} />
                          {577}
                        </div> */}
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
                          {['应用模板', '泛互联网'].map((tag, i) => (
                            <span
                              key={i}
                              className="whitespace-nowrap rounded-sm bg-[#EFF0F3CC] px-2 py-1 text-xs text-[#8E8C99]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        {/* <div className="flex items-center gap-1 whitespace-nowrap text-xs text-gray-400">
                          <Icon className="w-3 cursor-pointer" src={startSvg} />
                          {577}
                        </div> */}
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
                {siderCategory.map((c, i) => (
                  <span
                    onClick={(e) => {
                      setSiderCategorySelected((lastValue) => {
                        if (lastValue.find((item) => item === c.label)) {
                          return lastValue.filter((item) => item !== c.label);
                        } else {
                          return [...lastValue, c.label];
                        }
                      });
                    }}
                    key={i}
                    className={cn(
                      'hover:[#0563B2] cursor-pointer rounded-sm border border-[#E4E4E4] px-3 py-1 text-xs text-[#26244CE0] transition hover:border-[#0563B2]',
                      siderCategorySelected.includes(c.label) ? 'bg-[#e3e3e3]' : 'bg-[#fff]',
                    )}
                  >
                    {c.label}
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
