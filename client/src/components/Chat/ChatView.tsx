import { FC, memo, useCallback, useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { useForm } from 'react-hook-form';
import { Spinner } from '@librechat/client';
import { useParams } from 'react-router-dom';
import { Constants, buildTree } from 'librechat-data-provider';
import type { TMessage } from 'librechat-data-provider';
import type { ChatFormValues } from '~/common';
import { ChatContext, AddedChatContext, useFileMapContext, ChatFormProvider } from '~/Providers';
import { useChatHelpers, useAddedResponse, useSSE } from '~/hooks';
import ConversationStarters from './Input/ConversationStarters';
import { useGetMessagesByConvoId } from '~/data-provider';
import MessagesView from './Messages/MessagesView';
import Presentation from './Presentation';
import ChatForm from './Input/ChatForm';
import Landing from './Landing';
import Header from './Header';
import Footer from './Footer';
import { cn } from '~/utils';
import store from '~/store';
import { motion, AnimatePresence } from "framer-motion";
import UPLOADLIGHTGREYSVG from "@/assets/image/front-uploadLightGrey.svg";
import KNOWLEDGEUNITSVG from "@/assets/image/front-knowledgeunitlightgrey.svg";

import LIBRARYLIGHTSVG from "@/assets/image/front-libraryGrey.svg";
import { useUploadData } from "@/contexts/UploadDataContext";
import { CountUp } from 'countup.js';
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import ADDSVG from "@/assets/image/front-add.svg";

import ARROWBLACKSVG from "@/assets/image/front-arrowBlack.svg";
import Icon from "@/components/icon";
import { LibraryModel } from '../nav-projects';



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
    <div className="flex-1 card_data cursor-pointer">
      <motion.div
        key={props.index} // 用唯一标识
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.3,
          delay: (props.index + 1) * 0.2, // 顺序进入
        }}
      >
        <div className="text-[#333333] text-xs mb-2">{props.title}</div>
        <div className="flex justify-between">
          <div>
            <img src={props.icon} className="h-[64px]" />
          </div>
          <div className="items-end flex text-[#333333] text-4xl" ref={dataRef}>
            {/* {props.count} */}
          </div>
        </div>
      </motion.div>
    </div>
  );
};


function ChatView({ index = 0 }: { index?: number }) {
  const { conversationId } = useParams();
  const rootSubmission = useRecoilValue(store.submissionByIndex(index));
  const addedSubmission = useRecoilValue(store.submissionByIndex(index + 1));
  const centerFormOnLanding = useRecoilValue(store.centerFormOnLanding);

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
    content = <Landing centerFormOnLanding={centerFormOnLanding} />;
  }

  const libraryContentData = [
    {
      title: "工业知识库",
      count: 1,
      icon: LIBRARYLIGHTSVG,
    },
    {
      title: "已上传文件",
      count: 3,
      icon: UPLOADLIGHTGREYSVG,
    },
    {
      title: "知识单元",
      count: 28,
      icon: KNOWLEDGEUNITSVG,
    },
  ];
  const { chunksLength, filesLength, libraryData, refreshChatData, thinking } = useUploadData();


  return (
    <ChatFormProvider {...methods}>
      <ChatContext.Provider value={chatHelpers}>
        <AddedChatContext.Provider value={addedChatHelpers}>
          <Presentation>
            <div className="flex h-full w-full flex-col">
              {!isLoading && <Header />}
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
                  <div
                    className={cn(
                      'w-full',
                      isLandingPage && 'max-w-3xl transition-all duration-200 xl:max-w-4xl',
                    )}
                  >
                    <ChatForm index={index} />
                    <div className="chat_box h-[180px]">
                      <div className="flex gap-2.5 mb-2">
                        {libraryContentData.map((item, index) => {
                          if (item.title === "已上传文件") {
                            item.count = filesLength;
                          } else if (item.title === "知识单元") {
                            item.count = chunksLength;
                          } else if (item.title === "工业知识库") {
                            item.count = libraryData.length;
                          }
                          return <CardData key={index} {...item} index={index}></CardData>;
                        })}
                      </div>
                      <Dialog>
                        <DialogTrigger>
                          <div className="flex justify-between items-center enter_library h-8 px-4 cursor-pointer w-[548px] border border-[#E0E0E0] hover:border-[#0563B2] transition-all hover:border">
                            <div className="flex">
                              <Icon className="w-4 h-4 rotate-180 mr-1.5" src={ADDSVG}></Icon>
                              <div className="text-xs text-[#333333]">构建知识库</div>
                            </div>
                            <div>
                              <img className="h-4 w-4 rotate-270" src={ARROWBLACKSVG} />
                            </div>
                          </div>
                        </DialogTrigger>
                        <LibraryModel></LibraryModel>
                      </Dialog>
                    </div>
                    {/* {isLandingPage ? <ConversationStarters /> : <Footer />} */}
                  </div>
                </div>
                {/* {isLandingPage && <Footer />} */}
              </>
            </div>
          </Presentation>
        </AddedChatContext.Provider>
      </ChatContext.Provider>
    </ChatFormProvider>
  );
}

export default memo(ChatView);
