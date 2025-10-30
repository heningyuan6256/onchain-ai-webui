import { FC, useEffect, useMemo, useRef, useState } from "react";
import "@/pages/index.css";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ATTACHMENTSVG from "../../assets/image/front-document.svg";
import StopSvg from "../../assets/image/front-stop.svg";
import UnChooseSvg from "../../assets/image/front-unchoose.svg";
import ChooseSvg from "../../assets/image/front-choose.svg";
import AISVG from "../../assets/image/front-ai.svg";
import AIWhiteSVG from "../../assets/image/front-ai-white.svg";
import ARROWSVG from "../../assets/image/front-arrow.svg";
import LibrarySVG from "../../assets/image/front-library.svg";

import { Toggle } from "@/components/ui/toggle";
import Icon from "@/components/icon";
import { Tooltip } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useUploadData } from "@/contexts/UploadDataContext";
import INCORRECTSVG from "../../assets/image/incorrect.svg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";
import { useSession } from "@/tars/common/hooks/useSession";
import { ChatCompletionContentPart } from "@multimodal/agent-interface";
import ChatLoading from "../ChatLoading";

export interface ChatTextBoxProps {
  onSubmit: (msg: any) => void;
  onStop?: () => void;
  onSetKnowledge: (status: boolean) => void;
  knowledge: boolean;
  disabled?: boolean;
}

const ChatTextBox: FC<ChatTextBoxProps> = (props) => {
  const [uploadedImages, setUploadedImages] = useState<ChatCompletionContentPart[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inputMessage, setInputMessaage] = useState("");

  const { isProcessing, abortQuery } = useSession();

  const [isComposing, setIsComposing] = useState(false);

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const { isStreaming, libraryData, checkList, setCheckList, thinking, setThinking } = useUploadData();
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    console.log(e, "eeee");

    if (isStreaming || isProcessing || isComposing) {
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // 阻止默认换行

      const messageContent =
        uploadedImages.length > 0
          ? [
              ...uploadedImages,
              //@ts-ignore
              ...(e.target.value ? [{ type: "text", text: e.target.value } as ChatCompletionContentPart] : []),
            ]
          : //@ts-ignore
            e.target.value;

      //@ts-ignore
      e.target.value && props.onSubmit(messageContent);
      setUploadedImages([]);
      setInputMessaage("");
    }
  };

  // const [checkList, setCheckList] = useState<string[]>([]);

  const checkedLibrary = useMemo(() => {
    // if (!props.knowledge) {
    //   return <span>工业知识库</span>;
    // } else {
    if (!checkList.length) {
      return <span>未选择</span>;
    }
    if (checkList.length == libraryData.length) {
      return <span>工业知识库</span>;
    } else {
      return <span>{libraryData.find((item) => checkList.includes(item.id))?.name || ""}</span>;
    }
    // }
  }, [checkList, libraryData, props.knowledge]);

  useEffect(() => {
    setCheckList(libraryData.map((item) => item.id));
  }, [libraryData.length]);

  const handleAbort = async () => {
    if (!isProcessing) return;

    // setIsAborting(true);
    try {
      await abortQuery();
    } catch (error) {
      console.error("Failed to abort:", error);
    } finally {
      // setIsAborting(false);
    }
  };
  console.log(isProcessing, "isProcessing");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newImage: ChatCompletionContentPart = {
            type: "image_url",
            image_url: {
              url: event.target.result as string,
              detail: "auto",
            },
          };
          setUploadedImages((prev) => [...prev, newImage]);
        }
      };
      reader.readAsDataURL(file);
    });

    // 重置 input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    let hasImage = false;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.type.indexOf("image") !== -1) {
        const blob = item.getAsFile();
        if (!blob) continue;

        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const newImage: ChatCompletionContentPart = {
              type: "image_url",
              image_url: {
                url: event.target.result as string,
                detail: "auto",
              },
            };
            setUploadedImages((prev) => [...prev, newImage]);
          }
        };
        reader.readAsDataURL(blob);

        hasImage = true;
      }
    }

    if (hasImage) {
      console.log("Pasted image");
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="chat_box mb-2.5 h-[175px]">
      <ChatLoading loading={!!props.disabled}>
        <div className="chat_input textarea_bg border-[rgba(0,0,0,0)] border hover:border-[#0563B2] hover:border min-h-[121px] transition-all rounded-[8px]">
          {uploadedImages.length > 0 && (
            <div className="flex flex-wrap gap-2 px-[10px] pt-[10px]">
              {uploadedImages.map((image: any, index) => (
                <div key={index} className="relative w-[72px] h-[72px] rounded overflow-hidden border border-[#E0E0E0]">
                  <img src={image.image_url.url} alt={`upload-${index}`} className="w-full h-full object-cover" />
                  <span
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-0 right-0 bg-white text-black rounded-full text-xs cursor-pointer h-[12px] w-[12px]"
                  >
                    <Icon src={INCORRECTSVG}></Icon>
                  </span>
                </div>
              ))}
            </div>
          )}

          <Textarea
            value={inputMessage}
            disabled={!!props.disabled}
            placeholder="您好，询问相关问题"
            className={`placeholder:text-[rgba(0,0,0,0.3)] placeholder:text-xs ${
              uploadedImages.length ? "h-[29px]" : "h-[121px]"
            } max-h-[${uploadedImages.length ? "29px" : "121px"}] border-none shadow-none resize-none text-xs`}
            onChange={(e) => {
              setInputMessaage(e.target.value);
            }}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            // onKeyPress={(e) => {
            //   if(e.en)
            // }}
          />
        </div>
      </ChatLoading>
      <div className="chat_sub">
        <div className="flex">
          <div
            onClick={() => {
              fileInputRef.current?.click();
            }}
            className="rounded-[50%] h-[24px] w-[24px] cursor-pointer flex items-center justify-center bg-muted"
          >
            <Tooltip>
              <span>
                <Icon className="w-2.5 h-2.5 cursor-pointer" src={ATTACHMENTSVG} />
              </span>
              {/* <TooltipTrigger asChild>
                <span
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                >
                  <Icon className="w-2.5 h-2.5 cursor-pointer" src={ATTACHMENTSVG} />
                </span>
              </TooltipTrigger> */}
              {/* <TooltipContent>
                <p>支持图片上传（jpg/png/gif）</p>
              </TooltipContent> */}
            </Tooltip>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />
          </div>

          <Toggle
            pressed={thinking}
            onPressedChange={(value) => {
              setThinking(value);
            }}
            className="rounded-[12px] h-[24px] text-xs font-[400] w-[82px] ml-[10px] cursor-pointer"
          >
            <div className="w-3">
              <Icon className={!thinking ? "w-3 h-3" : "w-0 h-0"} src={AISVG}></Icon>
              <Icon className={!thinking ? "w-0 h-0" : "w-3 h-3"} src={AIWhiteSVG}></Icon>
            </div>
            深入研究
          </Toggle>

          {/* <Toggle className="rounded-[12px] h-[24px] text-xs font-[400] w-[82px] ml-[10px] cursor-pointer">
            模型选择
          </Toggle> */}
        </div>
        <div className="flex items-center">
          <span className="mr-1.5 text-xs whitespace-nowrap cursor-pointer">
            <DropdownMenu>
              <DropdownMenuTrigger
                className={`cursor-pointer ring-0 ${props.knowledge ? "" : "text-[rgba(0,0,0,0.3)]"}`}
              >
                {checkedLibrary}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[160px]">
                <DropdownMenuLabel>
                  <div
                    className="flex cursor-pointer justify-between h-[36px] items-center px-2"
                    onClick={() => {
                      if (checkList.length != libraryData.length) {
                        setCheckList(libraryData.map((item) => item.id));
                      } else {
                        setCheckList([]);
                      }
                    }}
                  >
                    <div className="text-xs text-[rgba(51,51,51,0.8)]">全选</div>{" "}
                    <div>
                      <Icon
                        className="w-4 h-4"
                        src={checkList.length == libraryData.length ? ChooseSvg : UnChooseSvg}
                      ></Icon>{" "}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="px-1.5" />
                {libraryData.map((item, index) => {
                  return (
                    <DropdownMenuItem key={index} className="py-0 h-[28px]">
                      <div
                        className="flex cursor-pointer justify-between flex-1 w-full h-full"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCheckList([item.id]);
                        }}
                      >
                        <div className="text-xs text-[rgba(51,51,51,0.8)] flex">
                          <span className="mr-1.5">
                            <Icon src={LibrarySVG}></Icon>
                          </span>{" "}
                          <div className="flex-1 overflow-hidden text-ellipsis">{item.name}</div>
                        </div>
                        <div>
                          <Icon className="w-4 h-4" src={checkList.includes(item.id) ? ChooseSvg : UnChooseSvg}></Icon>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </span>
          <Switch
            checked={props.knowledge}
            onCheckedChange={(e: any) => {
              props.onSetKnowledge && props.onSetKnowledge(e);
            }}
            id="airplane-mode"
            className="mr-2.5 cursor-pointer"
          />
          <Separator orientation="vertical" className="data-[orientation=vertical]:h-4 mr-2.5"></Separator>
          {isProcessing ? (
            <Button
              className="bg-[#fff] h-[24px] w-[24px] rounded-[50%] p-0 cursor-pointer hover:bg-[#fff]"
              size="icon"
              onClick={() => {
                handleAbort();
                // props.onStop && props.onStop();
              }}
            >
              <Icon className="w-6 h-6 rotate-180" src={StopSvg}></Icon>
            </Button>
          ) : (
            <Button
              className="bg-[#0563B2] h-[24px] w-[24px] rounded-[50%] p-0 cursor-pointer"
              size="icon"
              onClick={() => {
                // Build multimodal content if there are images
                const messageContent =
                  uploadedImages.length > 0
                    ? [
                        ...uploadedImages,
                        ...(inputMessage ? [{ type: "text", text: inputMessage } as ChatCompletionContentPart] : []),
                      ]
                    : inputMessage;
                setUploadedImages([]);

                inputMessage && props.onSubmit(messageContent);
                setTimeout(() => {
                  setInputMessaage("");
                }, 1000);
              }}
            >
              <Icon className="w-4 h-4 rotate-180" src={ARROWSVG}></Icon>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatTextBox;
