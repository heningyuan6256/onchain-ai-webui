import { useEffect } from 'react';
import { Spinner } from '@librechat/client';
import { useParams } from 'react-router-dom';
import { Constants, EModelEndpoint } from 'librechat-data-provider';
import { useGetModelsQuery } from 'librechat-data-provider/react-query';
import type { TPreset } from 'librechat-data-provider';
import { useGetConvoIdQuery, useGetStartupConfig, useGetEndpointsQuery } from '~/data-provider';
import { useNewConvo, useAppStartup, useAssistantListMap, useIdChangeEffect } from '~/hooks';
import { getDefaultModelSpec, getModelSpecPreset, logger } from '~/utils';
import { ToolCallsMapProvider } from '~/Providers';
import ChatView from '~/components/Chat/ChatView';
import useAuthRedirect from '../../../routes/useAuthRedirect';
import temporaryStore from '~/store/temporary';
import { useRecoilCallback } from 'recoil';
import store from '~/store';
import AgentPanelSwitch from '~/components/SidePanel/Agents/AgentPanelSwitch';
import AgentChat from '../agentChat';
import { useNavigate } from 'react-router-dom';
export default function ChatRoute() {
  const { conversationId = '' } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (!conversationId) {
      navigate('/agentconfig/new', { replace: true });
    }
  }, [conversationId]);

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      <div style={{ width: '50%', padding: '18px 24px' }}>
        <div style={{ flex: 1, overflow: 'auto', height: '100%' }}>
          <AgentPanelSwitch></AgentPanelSwitch>
        </div>
      </div>
      <div style={{ width: '50%' }}>
        <AgentChat />
      </div>
    </div>
  );
}
