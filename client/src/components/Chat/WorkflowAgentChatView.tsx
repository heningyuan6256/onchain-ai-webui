import { FC, memo, useCallback, useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { useForm } from 'react-hook-form';
import { Spinner } from '@librechat/client';
import { useParams, useSearchParams } from 'react-router-dom';
import { Constants, buildTree } from 'librechat-data-provider';
import type { TMessage } from 'librechat-data-provider';
import type { ChatFormValues } from '~/common';
import {
  ChatContext,
  AddedChatContext,
  useFileMapContext,
  ChatFormProvider,
  useChatContext,
} from '~/Providers';
import { useChatHelpers, useAddedResponse, useSSE } from '~/hooks';
import { useGetMessagesByConvoId } from '~/data-provider';
import MessagesView from './Messages/MessagesView';
import Presentation from './Presentation';
import WorkflowAgentChatForm from './Input/WorkflowAgentChatForm';
import { cn } from '~/utils';
import store from '~/store';
import { motion, AnimatePresence } from 'framer-motion';
import { CountUp } from 'countup.js';
import { ModelSelectorChatProvider } from './Menus/Endpoints/ModelSelectorChatContext';
import BeforeChat from './BeforeChat';

function LoadingSpinner() {
  return (
    <div className="relative flex-1 overflow-hidden overflow-y-auto">
      <div className="relative flex h-full items-center justify-center">
        <Spinner className="text-text-primary" />
      </div>
    </div>
  );
}

const CardData: FC<{ title: string; icon: string; count: number; index: number }> = (props) => {
  const dataRef = useRef(null);
  useEffect(() => {
    const countUp = new CountUp(dataRef.current!, Number(props.count), {
      duration: 1.0,
    });
    countUp.start();
    // return () => {
    //   countUp.d
    // }
  }, [props.count]);
  return (
    <div className="card_data flex-1 cursor-pointer">
      <motion.div
        key={props.index}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.3,
          delay: (props.index + 1) * 0.2,
        }}
      >
        <div className="mb-2 text-xs text-[#333333]">{props.title}</div>
        <div className="flex justify-between">
          <div>
            <img src={props.icon} className="h-[64px]" />
          </div>
          <div className="flex items-end text-4xl text-[#333333]" ref={dataRef}></div>
        </div>
      </motion.div>
    </div>
  );
};

function AgentChatView({ index = 0 }: { index?: number }) {
  const { conversationId } = useParams();
  const rootSubmission = useRecoilValue(store.submissionByIndex(index));
  const addedSubmission = useRecoilValue(store.submissionByIndex(index + 1));

  const searchParams = new URLSearchParams(location.search);

  const endpoint = searchParams.get('endpoint');

  const model = searchParams.get('model');

  console.log(model, endpoint, 'endpoint');

  const fileMap = useFileMapContext();

  const { data: messagesTree = null, isLoading } = useGetMessagesByConvoId(conversationId ?? '', {
    select: useCallback(
      (data: TMessage[]) => {
        const dataTree = buildTree({ messages: data, fileMap });
        return dataTree?.length === 0 ? null : (dataTree ?? null);
      },
      [fileMap],
    ),
    enabled: !!fileMap,
  });

  const chatHelpers = useChatHelpers(index, conversationId);
  const addedChatHelpers = useAddedResponse({ rootIndex: index });

  useSSE(rootSubmission, chatHelpers, false);
  useSSE(addedSubmission, addedChatHelpers, true);

  const methods = useForm<ChatFormValues>({
    defaultValues: { text: '' },
  });

  let content: JSX.Element | null | undefined;
  const isLandingPage =
    (!messagesTree || messagesTree.length === 0) &&
    (conversationId === Constants.NEW_CONVO || !conversationId);
  const isNavigating = (!messagesTree || messagesTree.length === 0) && conversationId != null;
  if (isLoading && conversationId !== Constants.NEW_CONVO) {
    content = <LoadingSpinner />;
  } else if ((isLoading || isNavigating) && !isLandingPage) {
    content = <LoadingSpinner />;
  } else if (!isLandingPage) {
    content = <MessagesView messagesTree={messagesTree} />;
  } else {
    content = <BeforeChat></BeforeChat>;
  }

  return (
    <ChatFormProvider {...methods}>
      <ChatContext.Provider value={chatHelpers}>
        <AddedChatContext.Provider value={addedChatHelpers}>
          <Presentation>
            <div className="flex h-full w-full flex-col">
              <>
                <div
                  className={cn(
                    'flex flex-col',
                    isLandingPage
                      ? 'flex-1 items-center justify-end sm:justify-center'
                      : 'h-full overflow-y-auto',
                  )}
                >
                  {content}
                  <div className={cn('w-full', isLandingPage && 'max-w-3xl xl:max-w-xl')}>
                    <ModelSelectorChatProvider>
                      <WorkflowAgentChatForm index={index} isAgent={true} />
                    </ModelSelectorChatProvider>
                  </div>
                </div>
              </>
            </div>
          </Presentation>
        </AddedChatContext.Provider>
      </ChatContext.Provider>
    </ChatFormProvider>
  );
}

export default memo(AgentChatView);
