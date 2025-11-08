import { FC, useEffect, useMemo, useRef, useState } from "react";
import "./index.css";
import Icon from "@/components/icon";
import CollectSvg from "@/assets/image/front-collect.svg";
import StarSVG from "@/assets/image/front-lightupcollect.svg";
import ShareSvg from "@/assets/image/front-share.svg";

import ChatView, { messageDataItem, messageItem } from "@/components/ChatView";
import ChatTextBox from "@/components/ChatTextBox";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import ChatPreview from "@/components/ChatPreview";
import { useUploadData } from "@/contexts/UploadDataContext";
import { toast } from "sonner";
import { useLatest, useUnmount, useUpdateEffect } from "ahooks";
import { useSession } from "@/tars/common/hooks/useSession";
import GridSkeleton from "@/components/loading";
import { userid } from "@/components/nav-projects";

const Chat: FC = () => {
  const location = useLocation();
  const isShareMode = location.search.split("=")[1];

  const state = location.state as { inputMessage?: string; useKnowledge?: boolean };
  // const initialMessage = state?.inputMessage ?? "";
  const initialKnowledge = state?.useKnowledge ?? false;
  // const [submitMessage, setSubmitMessage] = useState(initialMessage);
  const [useKnowledge, setUseKnowledge] = useState<boolean>(initialKnowledge);
  const [messageList, setMessageList] = useState<messageDataItem[]>([]);

  const {
    sessions,
    activeSessionId,
    groupedMessages,
    updateSessionMetadata,
    abortQuery,
    isProcessing,
    statusLoading,
    loadSessions,
  } = useSession();

  const chatId = useMemo(() => {
    return location.pathname.split("/conversations/")[1].split("?")[0];
  }, [location.pathname]);

  const { refreshChatData, chatData } = useUploadData();
  const [step, setStep] = useState(0);

  const latestStep = useLatest(step);
  const chatViewRef = useRef(null);

  const currentChatData = useMemo(() => {
    return chatData.find((item) => item.id == chatId);
  }, [chatData, chatId]);

  useEffect(() => {
    if (isShareMode) {
      setStep(0);
      const interval = setInterval(() => {
        if (latestStep.current + 1 >= messageList.length) {
          setStep(messageList.length);
          clearInterval(interval);
        } else {
          setStep(latestStep.current + 1);
        }
      }, 1000);
    }
  }, [isShareMode, messageList]);

  const ActiveSession = useMemo(() => {
    return (sessions || []).find((item) => item.id == activeSessionId);
  }, [sessions, activeSessionId]);

  const chatTitle = useMemo(() => {
    const name = (sessions || []).find((item) => item.id == activeSessionId)?.name;
    return name;
  }, [sessions, activeSessionId]);

  // const { abortQuery } = useSession();

  // useEffect(() => {
  //   return () => {
  //     abortQuery();
  //   };
  // });

  useUnmount(() => {
    abortQuery();
    // handleAbort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });
  const [showLoading, setShowLoading] = useState(true);
  const [fade, setFade] = useState("fade-in");

  useEffect(() => {
    if (!statusLoading) {
      setFade("fade-out");
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [statusLoading]);

  if (statusLoading) {
    return (
      <div style={{ height: "100%", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ width: "563px" }}>
          <div style={{ marginBottom: "30px" }}>
            <GridSkeleton size="small" />
          </div>
          <div style={{ marginBottom: "30px" }}>
            <GridSkeleton size="medium" />
          </div>
          <GridSkeleton size="medium" />
        </div>
      </div>
    );
  }

  return (
    <div className="home_container h-full w-full flex overflow-hidden">
      <div className="flex-4 flex flex-col overflow-hidden">
        <div className="h-[60px] h-min-[60px] pl-6 setting_title text-[18px] flex items-center font-medium justify-between">
          <div style={{ width: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {chatTitle}
          </div>
          <div className="flex">
            <span
              onClick={async () => {
                await updateSessionMetadata({
                  sessionId: activeSessionId!,
                  metadata: {
                    name: chatTitle,
                    tags:
                      ActiveSession?.tags && ActiveSession?.tags.find((item) => item === "fav")
                        ? [localStorage.getItem("id")!]
                        : ["fav", localStorage.getItem("id")!],
                  },
                });
                // await chatService.toggleFavorite(chatId, !currentChatData.is_favorite);
                toast.success(
                  `${ActiveSession?.tags && ActiveSession?.tags.find((item) => item === "fav") ? "取消" : ""}收藏成功`
                );
                // refreshChatData();
                loadSessions();
              }}
            >
              <Icon
                className={"w-5 mr-5 cursor-pointer"}
                src={ActiveSession?.tags && ActiveSession?.tags.find((item) => item === "fav") ? StarSVG : CollectSvg}
              ></Icon>
            </span>
            {/* <span
              onClick={() => {
                window.open(`/conversations/${chatId}?share=1`);
              }}
            >
              <Icon className={"w-5 cursor-pointer"} src={ShareSvg}></Icon>
            </span> */}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex">
          {" "}
          <ChatView
            ref={chatViewRef}
            // inputMessage={submitMessage}
            useKnowledge={useKnowledge}
            chatId={chatId}
            onSubmit={() => {
              // setSubmitMessage("");
            }}
            step={step}
            onChangeMessage={(msgs) => {
              let allMsgs: messageDataItem[] = [];
              msgs.forEach((item) => {
                if (item.data) {
                  item.data.forEach((v) => {
                    allMsgs = allMsgs.concat(v);
                  });
                }
              });
              if (!isShareMode) {
                setStep(allMsgs.length);
              }
              setMessageList(allMsgs);
            }}
          ></ChatView>
        </div>
        {!isShareMode && (
          <div className="flex justify-center mb-3.5">
            {
              <ChatTextBox
                knowledge={useKnowledge}
                onSubmit={(msg) => {
                  //@ts-ignore
                  chatViewRef.current!.sendMessage(msg);
                  // setSubmitMessage(msg);
                }}
                disabled={false}
                onSetKnowledge={(checked) => {
                  setUseKnowledge(checked);
                }}
                onStop={() => {
                  //@ts-ignore
                  chatViewRef.current!.handleStopGeneration();
                }}
              ></ChatTextBox>
            }
          </div>
        )}
      </div>
      <div className="bg-[#E0E0E0] h-full w-[2px]"></div>
      <div className="flex-3 overflow-hidden">
        <ChatPreview
          step={step}
          messages={messageList}
          onSetStep={(e) => {
            setStep(e);
          }}
        ></ChatPreview>
      </div>
    </div>
  );
};
export default Chat;
