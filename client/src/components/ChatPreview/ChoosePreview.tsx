import { FC } from "react";
import { chooseTypes, messageDataItem } from "../ChatView";
import EventEmitter from "@/utils/EventEmitter";

export interface ChossePreviewProps {
  message: chooseTypes;
}

const ChoosePreview: FC<ChossePreviewProps> = (props) => {
  console.log(props.message, "props.message");
  return (
    <div className="rounded-[15px] overflow-hidden flex-1 flex flex-col border border-[#E0E0E0] h-full">
      <div className="h-[40px] bg-[#F4F4F5] flex items-center text-xs font-[#333333] pl-5 pr-4 justify-between">
        <div>请选择以下数据以供AI助手识别:</div>
        {/* <Icon className="w-4 cursor-pointer" src={TRASHSVG}></Icon> */}
      </div>
      <div className="flex-1 text-[#F4F4F5] py-3 px-5 font-mono text-sm leading-relaxed overflow-y-auto">
        <div className="text-xs text-[#333333] rounded-[15px] max-w-full break-words mb-4 flex flex-wrap gap-2">
          {props.message.content.map((vi, index) => (
            <div
              key={index}
              className="flex items-center justify-center px-3 py-1 bg-[#f5f5f5] rounded-[8px] cursor-pointer hover:bg-[#e0e0e0] h-[30px]"
              onClick={() => EventEmitter.dispatchEvent("chatMessage", { msg: `${props.message.name}为${vi}` })}
            >
              {vi}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChoosePreview;
