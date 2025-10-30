import { FC, useRef, useState } from "react";
import Icon from "../icon";
import AISVG from "@/assets/image/front-ai.svg";
import ExpandSvg from "@/assets/image/front-expand.svg";
import PlayStartSvg from "@/assets/image/front-start.svg";
import PlayStopSvg from "@/assets/image/front-stop.svg";
import { Slider } from "@/components/ui/slider";
import CmdPreview from "./CmdPreview";
import { judgeIsMcp, messageDataItem, messageItem } from "../ChatView";
import ChoosePreview from "./ChoosePreview";
import { WorkspaceDetail } from "@/tars/standalone/workspace/WorkspaceDetail";
import { Shell } from "@/tars/standalone/app/Layout/Shell";
import { WorkspacePanel } from "@/tars/standalone/workspace/WorkspacePanel";

export interface ChatPreviewProps {
  messages: messageDataItem[];
  step: number;
  onSetStep: (step: number) => void;
  addrees?: string;
}

const ChatPreview: FC<ChatPreviewProps> = (props) => {
  const currentMessage = props.messages[props.step - 1 || 0];
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isRunning, setIsRunning] = useState(false); // 控制播放状态

  const startAutoStep = () => {
    // 如果已经在播放，则忽略点击
    if (isRunning) return;

    let currentStep = 0;
    props.onSetStep(currentStep);
    setIsRunning(true);

    timerRef.current = setInterval(() => {
      currentStep += 1;
      if (currentStep > props.messages.length) {
        stopAutoStep();
        return;
      }
      props.onSetStep(currentStep);
    }, 1000);
  };

  const stopAutoStep = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="h-[60px] px-6 setting_title text-[18px] flex items-center font-medium">OnChain Remote</div>
      <div className="flex-1 px-5 pt-3 pb-5 flex flex-col overflow-hidden h-full">
        {/* <div className="rounded-[15px] border border-[#E0E0E0] h-[40px] w-[447px] px-4 flex items-center bg-[#fff] mb-4">
          <Icon src={AISVG} className="w-[14px]"></Icon>
          <div className="text-[rgba(51,51,51,0.8)] text-xs font-normal text-ellipsis overflow-hidden whitespace-nowrap pl-2.5">
            正在浏览 {props.addrees || "http://www.onchainplm.com"}
          </div>
        </div> */}
        {/* {judgeIsMcp(props.messages[(props.step - 1) || 0].content) ? <CmdPreview></CmdPreview> : <></>} */}
        <div className="flex-1 overflow-hidden h-full">
          {/* {currentMessage?.type == "choose" && <ChoosePreview message={currentMessage}></ChoosePreview>}
          {typeof currentMessage?.content === "string" && judgeIsMcp(currentMessage?.content) && (
            <CmdPreview
              message={[
                { type: "cmd", content: "Connecting to onchain to list tools..." },
                { type: "output", content: "Connected to onchain" },
                { type: "cmd", content: "Getting tools from onchain..." },
                { type: "output", content: "Found 37 tools in onchain" },
              ]}
            ></CmdPreview>
          )} */}

          <div className="flex-1 flex flex-col overflow-hidden h-full">
            <Shell className="h-full rounded-xl shadow-lg shadow-gray-200/50 dark:shadow-gray-950/20">
              <WorkspacePanel />
            </Shell>
          </div>
          {/* {currentMessage?.type == "choose" && <ChoosePreview message={currentMessage}></ChoosePreview>} */}
        </div>
        {/* <div className="h-[40px] w-full flex items-center px-4 border border-[#E0E0E0] rounded-[15px] mt-2.5 text-xs text-[rgba(51,51,51,0.8)]">
          <div className="flex">
            <span className="cursor-pointer w-[20px] h-[20px] mr-2" onClick={isRunning ? stopAutoStep : startAutoStep}>
              <Icon src={isRunning ? PlayStopSvg : PlayStartSvg}></Icon>
            </span>
          </div>
          <div className="pr-3">
            {props.step}/{props.messages.length}
          </div>
          <div className="flex-1">
            <Slider
              value={[props.step]}
              max={props.messages.length}
              step={1}
              onValueChange={(e) => {
                props.onSetStep(e[0]);
              }}
            />
          </div>
          <div className="flex">
            <span
              className="rotate-180 w-2.5 ml-3 cursor-pointer"
              onClick={() => {
                props.onSetStep(props.step ? props.step - 1 : 0);
              }}
            >
              <Icon src={ExpandSvg}></Icon>
            </span>
            <span
              className="w-2.5 ml-2 cursor-pointer"
              onClick={() => {
                props.onSetStep(props.step + 1 > props.messages.length ? props.messages.length : props.step + 1);
              }}
            >
              <Icon src={ExpandSvg}></Icon>
            </span>
          </div>
        </div> */}
      </div>
      {/* <div className="flex justify-center">{ChatBox}</div> */}
    </div>
  );
};

export default ChatPreview;
