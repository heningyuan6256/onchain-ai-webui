import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useToastContext } from '@librechat/client';
import defaultAvatar from '/assets/defaultavatar.svg';
import wishlisted from '../../../assets/image/wishlisted.svg';
import collect from '../../../assets/image/collect.svg';
import Icon from '@/components/icon';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import request from '~/request/request';
import { PlusOutlined } from '@ant-design/icons';
import './index.css';
import { Button, Input, Row, Col, Divider } from 'antd';
import SEARCHSVG from '../../../assets/image/front-search.svg';
import editsvg from '../../../assets/image/edit.svg';
import agentnodata from '../../../assets/image/agentnodata.svg';
import categories from '~/pages/agent/agentlist/category';
import CategoryFilter from './components/CategoryFilter';
import Tag from './components/AgentTag';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { debounce } from 'lodash';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};
const cardVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { type: 'spring', stiffness: 120, damping: 15 },
  },
};

export default function AppMarket() {
  const { showToast } = useToastContext();
  const categoryFilterRef = useRef(null);
  const [categories, setCategories] = useState<any[]>([]);
  const navigate = useNavigate();
  const [applist, setAppList] = useState<any[]>([]);
  const [publisOrilist, setPublisOrilist] = useState<any[]>([]);
  const [publislist, setPublislist] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const updatePublislist = () => {
    if (categoryFilterRef?.current) {
      setPublislist(
        publisOrilist?.filter((item) => {
          return item.tag1 === categoryFilterRef?.current?.activeId;
        }) || [],
      );
    }
  };
  const getList = async () => {
    const userId = localStorage.getItem('id');
    request(`/v1/agent/system/agent/list_agent`, {
      method: 'get',
      redirect: 'follow',
      params: {
        pageNum: 1,
        pageSize: 10000,
        user_id: userId,
        name: search,
      },
    }).then((data) => {
      setAppList(data?.rows || []);
      setLoading(false);
    });
  };
  useEffect(() => {
    if (search) {
      getList();
    }
  }, [search]);
  const getOriPublisList = async () => {
    const requestOptions: RequestInit = { method: 'get', redirect: 'follow' };
    const userId = localStorage.getItem('id');
    request(
      `/v1/agent/system/agent/shared_agent?pageNum=1&pageSize=10000&user_id=${userId}`,
      requestOptions,
    ).then((data) => {
      setPublisOrilist(data?.rows || []);
      setLoading(false);
    });
  };
  const getCategories = async () => {
    const requestOptions: RequestInit = { method: 'get', redirect: 'follow' };
    request(
      `/backend/sys/dict/data/list?pageNum=1&pageSize=10000&dictType=agenttag`,
      requestOptions,
    ).then((data) => {
      setCategories(
        data?.rows?.map((item) => {
          return { value: item.dictValue, label: item.dictLabel, color: item.cssClass };
        }) || [],
      );
    });
  };
  useEffect(() => {
    getList();
    getOriPublisList();
    getCategories();
  }, []);
  useEffect(() => {
    updatePublislist();
  }, [categoryFilterRef, publisOrilist]);
  return (
    <div className="flex h-[100%]">
      <div className="flex flex-1 flex-col">
        <div className="mr-12 mt-8 flex items-center justify-between">
          <div className="flex flex-1 items-center justify-center" />
          <div className="agent-action-btns">
            <Button
              style={{ borderRadius: 16 }}
              color="default"
              variant="solid"
              className="btn-publish"
              size="small"
              icon={<PlusOutlined />}
              type="primary"
              onClick={() => {
                const searchParams = new URLSearchParams(location.search);
                const user = searchParams.get('user');
                navigate(`/agentconfig/new?user=${user}`);
              }}
            >
              创建智能体
            </Button>
            <div className="h-[30px]"></div>
          </div>
        </div>
        <div className="h-full w-full overflow-auto">
          <div className="flex flex-1">
            <div className="h-full w-full overflow-auto">
              <div className="big-title">工业智能体</div>
              <div className="small-title">
                The Intelligent Engine Powering Next-Generation Manufacturing
              </div>
              <Input
                className="search"
                prefix={<Icon src={SEARCHSVG} />}
                placeholder="搜索智能体"
                onChange={debounce((e: any) => {
                  console.log('xxxxx', e.target.value);
                  setSearch(e.target.value);
                }, 500)}
              />

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="listbody p-4"
              >
                {applist?.length ? (
                  <Row gutter={[15, 15]}>
                    {applist.map((app, idx) => (
                      <Col key={idx} xs={14} sm={12} md={12} lg={10} xl={8} xxl={6}>
                        <motion.div
                          onClick={() => {
                            const searchParams = new URLSearchParams(location.search);
                            const user = searchParams.get('user');
                            navigate(
                              `/agentchat/new?user=${user}&agent_id=${encodeURIComponent(app.agent_id)}`,
                            );
                          }}
                          style={{ minWidth: '230px' }}
                          variants={cardVariants}
                          whileHover={{ y: -8, boxShadow: '0 12px 24px rgba(0,0,0,0.12)' }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="app_card_bg agentcard relative h-[148px] cursor-pointer rounded-sm border border-[#e6e8ee] p-4 transition-all duration-500 hover:border-[#0563B2]"
                        >
                          <div
                            className="absolute right-6 top-2 h-3 w-3"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const searchParams = new URLSearchParams(location.search);
                              const user = searchParams.get('user');
                              navigate(
                                `/agentconfig/new?user=${user}&agent_id=${encodeURIComponent(app.agent_id)}`,
                              );
                            }}
                          >
                            <Icon src={editsvg} />
                          </div>
                          <span
                            style={{ backgroundColor: app.published ? '#1cdbce' : '#d0d0d0' }}
                            className={`absolute right-2 top-2 h-3 w-3 rounded-full border-2 border-white`}
                            title={app.published ? '已发布' : '未发布'}
                          />
                          <div className="flex text-[13px] font-semibold text-[#333333]">
                            <Icon
                              src={app?.agent_img ? app?.agent_img : defaultAvatar}
                              className="mr-2 h-12 w-12 flex-shrink-0 rounded-[14px]"
                            />
                            <div className="min-w-0">
                              <div className="agentname overflow-hidden overflow-ellipsis whitespace-nowrap">
                                {app.agent_name}
                              </div>
                              <span
                                style={{
                                  height: '36px',
                                  display: '-webkit-box',
                                  WebkitBoxOrient: 'vertical',
                                  WebkitLineClamp: 2,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  wordBreak: 'break-all',
                                }}
                                className="agentdes"
                              >
                                {app.description}
                              </span>
                            </div>
                          </div>
                          <Divider
                            className="m-0"
                            style={{ marginBottom: '4px', marginTop: '10px' }}
                          />

                          <div>
                            <div className="flex justify-between">
                              <div className="agentobj h-6 w-[calc(25%)]">分类</div>
                              <div className="agentvalue h-6 w-[calc(30%)]">
                                <Tag
                                  color={
                                    categories.find((item) => {
                                      return item?.value === app?.tag1;
                                    })?.color || 'green'
                                  }
                                >
                                  {categories.find((item) => {
                                    return item?.value === app?.tag1;
                                  })?.label || '其它'}
                                </Tag>
                              </div>
                              <div className="agentobj h-6 w-[calc(20%)]">状态</div>
                              <div className="agentvalue h-6 w-[calc(20%)]">
                                {app?.is_shared === '1' ? '已发布' : '未发布'}
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <div className="agentobj h-6 w-[calc(25%)]">更新时间</div>
                              <div className="agentvalue h-6 w-[calc(30%)]">
                                {dayjs(app?.update_time).format('YYYY.MM.DD') ?? '无'}
                              </div>
                              <div className="agentobj h-6 w-[calc(20%)]">创建人</div>
                              <div className="agentvalue h-6 w-[calc(20%)]">
                                {app?.create_user_name ?? '未知'}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Icon className="m-auto" src={agentnodata}></Icon>
                )}
              </motion.div>
            </div>
          </div>
          <div className="flex flex-1">
            <div className="h-full w-full overflow-auto">
              <div className="big-title">智能体广场</div>
              <div className="small-title">
                The Playground for Industrial Intelligence Innovation
              </div>
              <div className="search" style={{ height: '34px' }}>
                <CategoryFilter
                  categories={categories}
                  onChange={updatePublislist}
                  ref={categoryFilterRef}
                ></CategoryFilter>
              </div>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="listbody p-4"
              >
                {publislist?.length ? (
                  <Row gutter={[15, 15]}>
                    {publislist.map((app, idx) => (
                      <Col key={idx} xs={14} sm={12} md={12} lg={10} xl={8} xxl={6}>
                        <motion.div
                          style={{ minWidth: '230px' }}
                          variants={cardVariants}
                          onClick={() => {
                            const searchParams = new URLSearchParams(location.search);
                            const user = searchParams.get('user');
                            navigate(
                              `/agentchat/new?user=${user}&agent_id=${encodeURIComponent(app.agent_id)}`,
                            );
                          }}
                          whileHover={{ y: -8, boxShadow: '0 12px 24px rgba(0,0,0,0.12)' }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="app_card_bg agentcard relative h-[88px] cursor-pointer rounded-sm border border-[#e6e8ee] p-4 transition-all duration-500 hover:border-[#0563B2]"
                        >
                          <div
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              let collectres: any;
                              const userId = localStorage.getItem('id');
                              if (app.collect === '1') {
                                collectres = await request(
                                  `/v1/agent/system/agent/unsave_agent?user_id=${userId}&agent_id=${app.agent_id}`,
                                  { method: 'post' },
                                );
                              } else {
                                collectres = await request(
                                  `/v1/agent/system/agent/Collect_agent?user_id=${userId}&agent_id=${app.agent_id}`,
                                  { method: 'post' },
                                );
                              }
                              if (collectres?.code === 200) {
                                toast.success(collectres?.message);
                              } else {
                                toast.error(collectres?.message ?? '操作失败');
                              }
                              getOriPublisList();
                            }}
                          >
                            <Icon
                              src={app.collect === '1' ? wishlisted : collect}
                              className={`absolute right-2 top-2 h-3 w-3 cursor-pointer`}
                            />
                          </div>
                          <div className="flex text-[13px] font-semibold text-[#333333]">
                            <Icon
                              src={app?.agent_img ? app?.agent_img : defaultAvatar}
                              className="mr-2 h-12 w-12 flex-shrink-0 rounded-[14px]"
                            />
                            <div className="min-w-0">
                              <div className="agentname overflow-hidden overflow-ellipsis whitespace-nowrap">
                                {app.agent_name}
                              </div>
                              <span
                                style={{
                                  height: '36px',
                                  display: '-webkit-box',
                                  WebkitBoxOrient: 'vertical',
                                  WebkitLineClamp: 2,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  wordBreak: 'break-all',
                                }}
                                className="agentdes"
                              >
                                {app.description}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Icon className="m-auto" src={agentnodata}></Icon>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
