import { useEffect, useRef, useState } from 'react';
import { Spinner } from '@librechat/client';
import { useParams } from 'react-router-dom';
import { Constants, EModelEndpoint } from 'librechat-data-provider';
import { useGetModelsQuery } from 'librechat-data-provider/react-query';
import type { TPreset } from 'librechat-data-provider';
import { useGetConvoIdQuery, useGetStartupConfig, useGetEndpointsQuery } from '~/data-provider';
import { useNewConvo, useAppStartup, useAssistantListMap, useIdChangeEffect } from '~/hooks';
import { getDefaultModelSpec, getModelSpecPreset, logger } from '~/utils';
import { AgentPanelProvider, ToolCallsMapProvider } from '~/Providers';
import ChatView from '~/components/Chat/ChatView';
import useAuthRedirect from '../../../routes/useAuthRedirect';
import temporaryStore from '~/store/temporary';
import { useRecoilCallback } from 'recoil';
import store from '~/store';
import { PlusOutlined, UndoOutlined } from '@ant-design/icons';
import { Button, Image, Modal, Popconfirm } from 'antd';
import AgentPanelSwitch from '~/components/SidePanel/Agents/AgentPanelSwitch';
import AgentChat from '../agentChat';
import { useNavigate } from 'react-router-dom';
import { useAgentPanelContext } from '~/Providers/AgentPanelContext';
import { Panel, isEphemeralAgent } from '~/common';
import { AgentPanelRef } from '~/components/SidePanel/Agents/AgentPanel';
import Header from './components/header';
import './index.css';
import request from '~/request/request';
import { toast } from 'sonner';
import deletesvg from '~/assets/image/delete.svg';
import Icon from '~/components/icon';
import { Button as UIButton } from '~/components/ui/button';

export default function AgentConfig() {
  return (
    <AgentPanelProvider>
      <AgentConfigContent />
    </AgentPanelProvider>
  );
}

function AgentConfigContent() {
  const ref = useRef<AgentPanelRef>(null);
  const search = new URLSearchParams(location.search);
  const { conversationId = '' } = useParams();
  const navigate = useNavigate();
  const {
    activePanel,
    agentsConfig,
    setActivePanel,
    endpointsConfig,
    setCurrentAgentId,
    agent_id: current_agent_id,
  } = useAgentPanelContext();
  const showDeleteConfirm = () => {
    const modal = Modal.confirm({
      width: 368,
      closable: true,
      title: <div className="confiremodeltitle">{'删除智能体'}</div>,
      content: <div className="confiremodeldesc">{'此操作不可撤销，是否继续？'}</div>,
      icon: <Icon src={deletesvg} className="mr-2 mt-0.5 h-[16px] w-[16px]" />,
      centered: true,
      forceRender: true,
      footer: (
        <div className="mt-4 flex justify-end gap-1">
          <UIButton
            className="mr-1 h-[30px] w-[64px] cursor-pointer rounded-[20px] border border-[#E0E0E0] bg-[#fff] text-xs font-normal"
            variant={'secondary'}
            onClick={() => modal.destroy()}
          >
            取消
          </UIButton>
          <UIButton
            className="h-[30px] w-[64px] cursor-pointer rounded-[20px] text-xs font-normal"
            onClick={async () => {
              const res = await request('/v1/agent/system/agent/delete_agent', {
                method: 'delete',
                params: { agent_ids: agentData?.id },
              });
              if (res.code === 200) {
                toast.success(res.message);
                navigate('/agentlist', { replace: true });
              } else {
                toast.error(res?.message ?? '删除失败');
              }
              modal.destroy();
            }}
          >
            确定
          </UIButton>
        </div>
      ),
    });
  };
  useEffect(() => {
    if (!conversationId) {
      navigate('/agentconfig/new', { replace: true });
    }
  }, [conversationId]);
  const [agentData, setAgentData] = useState<any>(null);
  const updatemodel = () => {
    setAgentData(ref.current?.newquerymodel);
  };
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header></Header>

      <div
        style={{
          padding: '15px 32px 15px 20px',
          borderBottom: '1px solid #E0E0E0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'PingFangSC, PingFang SC',
              fontWeight: 600,
              fontSize: 15,
              color: '#333333',
              lineHeight: '15px',
              fontStyle: 'normal',
              marginBottom: 8,
              marginTop: 8,
            }}
          >
            {agentData?.name ?? '未保存的智能体'}
          </div>
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',

              fontFamily: 'PingFangSC, PingFang SC',
              fontWeight: 400,
              fontSize: 11,
              color: '#333333',
              lineHeight: '18px',
              fontStyle: 'normal',
            }}
          >
            <div
              style={{
                borderRadius: '100%',
                backgroundColor: agentData?.is_shared === '1' ? '#36ecd3' : '#D0D0D0',
                height: 7,
                width: 7,
              }}
            ></div>
            <span>{agentData?.is_shared === '1' ? '已发布' : '未发布'}</span>
            <div
              style={{
                width: '1px',
                height: '16px',
                background: '#E0E0E0',
              }}
            ></div>
            <span
              style={{
                color: 'rgba(0,0,0,0.3)',
              }}
            >
              更新时间
            </span>
            <span>{agentData?.update_time?.replace('T', ' ').slice(0, 19)}</span>

            <div
              style={{
                width: '1px',
                height: '16px',
                background: '#E0E0E0',
              }}
            ></div>
            <span
              style={{
                color: 'rgba(0,0,0,0.3)',
              }}
            >
              创建人
            </span>
            <span>{agentData?.create_user_name}</span>
          </div>
        </div>
        <div className="agent-action-btns2">
          {search.get('agent_id') !== undefined && search.get('agent_id') !== null && (
            <Button
              size="small"
              icon={<Icon src={deletesvg} className="h-[11px] w-[11px]"></Icon>}
              className="btn-save"
              onClick={showDeleteConfirm}
            >
              删除
            </Button>
          )}
          <Button
            className="btn-save"
            size="small"
            icon={<UndoOutlined />}
            variant="outlined"
            onClick={() => {
              ref?.current?.submitForm();
            }}
          >
            {search.get('agent_id') !== undefined && search.get('agent_id') !== null
              ? '保存'
              : '创建'}
          </Button>
          {search.get('agent_id') !== undefined && search.get('agent_id') !== null && (
            <Button
              color="default"
              variant="solid"
              className="btn-publish"
              size="small"
              icon={<PlusOutlined />}
              type="primary"
              onClick={async () => {
                const publishres = await request('/v1/agent/system/agent/share_agent', {
                  method: 'POST',
                  params: {
                    agent_id: agentData?.id,
                    is_shared: agentData?.is_shared === '1' ? '0' : '1',
                  },
                });
                if (publishres?.code === 200) {
                  toast.success(publishres.message);
                  ref?.current?.queryAgent(agentData?.id);
                } else {
                  toast.error(publishres?.message ?? '发布失败');
                }
              }}
            >
              {agentData?.is_shared === '1' ? '取消发布' : '发布'}
            </Button>
          )}
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div
          style={{
            borderRight: '1px solid #E0E0E0',

            width: '35%',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <div>
            {activePanel === Panel.model ? (
              <div
                style={{
                  height: 34,
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #E0E0E0',
                  padding: '9px 20px',
                  fontWeight: 600,
                  fontSize: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => setActivePanel(Panel.builder)}
                  >
                    <Image src="/img/svgs/back.svg" width={24} height={24} preview={false} />
                    <span style={{ color: '#ababab' }}>基本信息&nbsp;/&nbsp;</span>
                  </div>
                  <span style={{ color: '#333' }}>模型参数</span>
                </div>
                <div
                  style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => ref.current?.setValue('model_parameters', {})}
                >
                  <Image src="/img/svgs/reset.svg" width={16} height={16} preview={false} />
                  <span style={{ color: '#333' }}>&nbsp;重置</span>
                </div>
              </div>
            ) : (
              <div
                style={{
                  height: 32,
                  borderBottom: '1px solid #E0E0E0',
                  padding: '8px 20px',
                  fontWeight: 600,
                  fontSize: 12,
                  color: '#333',
                }}
              >
                基本信息
              </div>
            )}
          </div>
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: ' 0px 14px 0px 24px',
            }}
          >
            <AgentPanelSwitch ref={ref} updatemodel={updatemodel} />
          </div>
        </div>

        <div
          style={{
            width: '65%',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <div
            style={{
              borderBottom: '1px solid #E0E0E0',
              padding: '8px 20px',
              fontWeight: 600,
              fontSize: 12,
              color: '#333',
              height: 32,
            }}
          >
            调试预览
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <AgentChat />
          </div>
        </div>
      </div>
    </div>
  );
}
