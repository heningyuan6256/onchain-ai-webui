import React, { useState, useEffect, useMemo } from 'react';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessages } from './components/ChatMessages';
import { ChatInput } from './components/ChatInput';
import { useChatSessions } from './hooks/useChatSessions';
import { useChat } from './hooks/useChat';
import { N8NService } from './services/n8nService';
import { StorageService } from './services/storageService';
import './N8NChatbot.css';
import ChatTextBox from './components/ChatTextBox';
import { useMount } from 'ahooks';
import { chatService } from '@/services/chat';
import { useSearchParams } from 'react-router-dom';
import request from '~/request/request';
const N8NChatbot: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [app, setApp] = useState({});
  const app_url = useMemo(() => {
    return location.pathname.split('/application/')[1].split('?')[0];
  }, [location.pathname]);
  const appId = useMemo(() => {
    return JSON.parse(decodeURIComponent(searchParams.get('appId') || ''));
  }, [searchParams]);
  useEffect(() => {
    const requestOptions: RequestInit = {
      method: 'get',
      redirect: 'follow',
    };
    request(`/apps/system/app/query_app?app_id=${appId}`, requestOptions).then((data) => {
      setApp(data?.rows);

      if (!data?.rows.workflow_id) return;
      chatService.getIsupload(data?.rows.workflow_id).then((res) => {
        if (res?.code === 200) {
          setIsupload(
            res?.data?.data?.nodes?.find(
              (node: any) =>
                node.type === '@n8n/n8n-nodes-langchain.chatTrigger' &&
                node.parameters?.options?.allowFileUploads === true,
            ) !== undefined,
          );
        }
      });
    });
  }, [appId]);

  const [n8nWebhookUrl, setN8nWebhookUrl] = useState(`/chat/webhook/${app_url}/chat`);
  const [isupload, setIsupload] = useState(false);
  const [n8nService] = useState(() => new N8NService(n8nWebhookUrl));

  const {
    chatSessions,
    currentSessionId,
    messages,
    createNewSession,
    switchSession,
    deleteSession,
    updateMessages,
    saveCurrentSession,
  } = useChatSessions();

  const { sendMessage, isLoading } = useChat(
    messages,
    updateMessages,
    currentSessionId,
    n8nService,
  );

  useEffect(() => {
    n8nService.updateWebhookUrl(n8nWebhookUrl);
  }, [n8nService]);

  const refrashAppCount = async () => {
    if (!app.workflow_id) return;
    const res = await chatService.getAppTimes(app.workflow_id);

    if (res?.code === 200) {
      setAppCount(res.rows.count);
    }
  };
  const [appCount, setAppCount] = useState(0);
  useEffect(() => {
    refrashAppCount();
  }, [app]);

  useEffect(() => {
    if (messages.length % 2 === 0) {
      refrashAppCount();
    }
  }, [messages.length]);

  return (
    <div className="app-shell">
      <ChatHeader title={app.app_name} />
      <div className="content-wrapper">
        <div className="main-area">
          <ChatMessages
            onSubmit={sendMessage}
            app={app}
            messages={messages}
            isLoading={isLoading}
          />
          <div style={{ paddingInline: '25%' }}>
            <ChatTextBox
              isupload={isupload}
              onSubmit={sendMessage}
              disabled={isLoading}
              onSetKnowledge={() => {}}
              knowledge={false}
            />
          </div>
        </div>
        <ChatSidebar
          title={app.app_name}
          interactionParams={appCount}
          appDescription={app.app_description}
        />
      </div>
    </div>
  );
};

export default N8NChatbot;
