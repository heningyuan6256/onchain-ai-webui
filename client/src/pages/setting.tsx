import Icon from "@/components/icon";
import { Input } from "@/components/ui/input";
import { FC, useState } from "react";
import DeepseakSVG from "../assets/image/front-deepseek.svg";
import GeminiSVG from "../assets/image/front-gemini.svg";
import GPTSVG from "../assets/image/front-gpt.svg";
import LLAMASVG from "../assets/image/front-llama.svg";
import EDITSVG from "../assets/image/front-edit.svg";

import UNCHOOSESVG from "../assets/image/front-unchoose.svg";

import CHOOSESVG from "../assets/image/front-choose.svg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
export interface CardDataProps {
  title: string;
  icon: string;
  desc: string;
  keyD: string;
  checked?: string;
  onSetChecked: (data: string) => void;
}

const CardData: FC<CardDataProps> = (props) => {
  return (
    <div
      className="flex justify-between h-[75px] border-b border-[#E0E0E0] cursor-pointer"
      onClick={() => props.onSetChecked(props.keyD)}
    >
      <div className="pt-4 pb-4">
        <div className="mb-1 flex">
          {" "}
          <Icon className="mr-1.5" src={props.icon}></Icon> {props.title}
        </div>
        <div className="text-[rgba(0,0,0,0.3)] text-xs">{props.desc}</div>
      </div>
      <div className="flex items-center pr-5">
        {props.checked == props.keyD ? <Icon src={CHOOSESVG}></Icon> : <Icon src={UNCHOOSESVG}></Icon>}
      </div>
    </div>
  );
};

const FloatIMG: FC = () => {
  return (
    <div className="h-5 w-5 absolute border border-[#E0E0E0] rounded-[50%] flex items-center justify-center right-0 bottom-0 bg-[#ffffff] cursor-pointer">
      <Icon src={EDITSVG} className="h-[10px] w-[10px]"></Icon>
    </div>
  );
};

const setting: FC = () => {
  const [checked, setChecked] = useState<any>("");
  return (
    <div className="home_container h-full w-full flex flex-col">
      <div className="h-[60px] flex items-center pl-[20px] setting_title">设置</div>
      <div className="flex-1 flex justify-center items-center">
        <div className="w-[516px]">
          <div className="mb-5 font-semibold text-[18px]">用户名</div>
          <div className="mb-6 flex items-center">
            <div className="h-[56px] min-w-[56px] mr-4 relative cursor-pointer">
              <Avatar className="h-[56px] min-w-[56px] rounded-[50%]">
                <AvatarImage src={"CN"} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <FloatIMG></FloatIMG>
            </div>
            <Input
              className="h-[42px] rounded-[15px] placeholder:text-xs border-[#0563B2]"
              placeholder="修改后的用户名"
              value={"heningyuan"}
            ></Input>
          </div>
          <div className="bg-[#E0E0E0] h-[1px] w-full mb-5"></div>
          <div className="font-semibold text-[18px]">活跃度</div>
          <div className="text-xs text-[rgba(0,0,0,0.3)] mb-4">关于活跃度的解释说明</div>
          <div className="border border-[#E0E0E0] h-[217px] p-5 mb-5 rounded-[15px] flex gap-[3px] flex-wrap">
            {Array.from({ length: 365 })
              .fill({})
              .map((item, index) => {
                return (
                  <div
                    className={`bg-[${
                      index == 10 || index == 78 ? (index == 78 ? "#0563B2" : "#0563B2") : "#F4F4F5"
                    }] min-h-3 h-3 min-w-3 rounded-[3px]`}
                  ></div>
                );
              })}
          </div>
          <div className="bg-[#E0E0E0] h-[1px] w-full mb-5"></div>
          {/* <div className="font-semibold text-[18px]">模型选择</div> */}
          <div className="text-xs text-[rgba(0,0,0,0.3)] mb-4">关于模型选择的解释说明</div>
          <div className="border border-[#E0E0E0] h-[299px] px-5 mb-5 rounded-[15px] overflow-auto">
            {[
              {
                title: "Gemma 3",
                desc: "一些关于该模型的描述文字，一些关于该模型",
                keyD: "gemma",
                icon: GeminiSVG,
              },
              {
                title: "DeepSeek R1",
                desc: "一些关于该模型的描述文字，一些关于该模型",
                keyD: "deepseek",
                icon: DeepseakSVG,
              },
              { title: "OpenAI | o2", desc: "一些关于该模型的描述文字，一些关于该模型", keyD: "openai", icon: GPTSVG },
              { title: "Llama 3.3", desc: "一些关于该模型的描述文字，一些关于该模型", keyD: "llmam", icon: LLAMASVG },
            ].map((item) => {
              return (
                <CardData
                  {...item}
                  checked={checked}
                  onSetChecked={(key) => {
                    setChecked(key);
                  }}
                ></CardData>
              );
            })}
            <div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default setting;
