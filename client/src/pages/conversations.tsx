import React, { FC } from "react";
import { Calculator, Calendar, CreditCard, Settings, Smile, User } from "lucide-react";
import { motion } from "framer-motion";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import STARSVG from "../assets/image/front-lightupcollect.svg";
import { Button } from "@/components/ui/button";
import ADDSVG from "@/assets/image/front-add.svg";
import MORESVG from "@/assets/image/front-more.svg";
import ADDWHITESVG from "@/assets/image/front-addWhite.svg";
import EDITSVG from "@/assets/image/front-edit.svg";
import TRASHSVG from "@/assets/image/front-trash.svg";
import COLLECTSVG from "@/assets/image/front-collect.svg";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Icon from "@/components/icon";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { generateSnowId } from "@/utils";
import { useUploadData } from "@/contexts/UploadDataContext";
import { toast } from "sonner";
import { useSession } from "@/tars/common/hooks/useSession";

const formatISODate = (isoString: number) => {
  const date = new Date(isoString);

  // 你也可以改成 date.toLocaleString() 看你需要格式
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 月份从0开始
  const day = String(date.getDate()).padStart(2, "0");

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const conversations: FC = () => {
  const navigate = useNavigate();

  const { sessions, deleteSession, updateSessionMetadata, loadSessions } = useSession();
  console.log(sessions, "sessions");

  return (
    <div className="home_container h-full w-full flex justify-center items-center">
      <div style={{ height: "400px" }}>
        <div className="flex justify-between">
          <div className="font-semibold text-2xl text-[#333333] mb-4.5 ml-6">我的对话</div>
          <div>
            <Button
              onClick={() => {
                navigate("/");
              }}
              className="h-[32px] text-xs cursor-pointer"
            >
              <Icon src={ADDWHITESVG}></Icon>开启新对话
            </Button>
          </div>
        </div>
        <Command className="rounded-[20px] md:min-w-[563px]">
          <CommandInput placeholder="搜索你想知道的" />
          <CommandList className="mt-6.5">
            <CommandEmpty>没有找到结果</CommandEmpty>
            <CommandGroup>
              {sessions.map((item, index) => {
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.05, // 顺序进入
                    }}
                  >
                    <CommandItem>
                      <div
                        className="flex justify-between w-full conversation_list_item"
                        onClick={() => {
                          navigate(`/conversations/${item.id}`);
                        }}
                      >
                        <div>
                          <div className="mb-1 flex">
                            <div className="w-4.5 h-4.5 flex justify-center items-center">
                              {/* {item.is_favorite ? <Icon src={STARSVG} className="w-3 h-3" /> : null} */}
                            </div>
                            {item.name}
                          </div>
                          <div className="text-xs font-normal text-[rgba(0,0,0,0.3)] ml-4.5">
                            {formatISODate(item.updatedAt)}
                          </div>
                        </div>
                        <div className="flex justify-center items-center pr-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                data-sidebar="trigger"
                                data-slot="sidebar-trigger"
                                variant="ghost"
                                size="icon"
                                className={cn("size-7", "h-6 w-6 cursor-pointer conversation_more")}
                              >
                                <Icon src={MORESVG}></Icon>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[90px] rounded-lg" align="start" sideOffset={4}>
                              {/* <DropdownMenuItem className="gap-2 p-2 cursor-pointer">
                                <div className="text-[rgba(51,51,51,0.8)] text-xs cursor-pointer flex">
                                  <Icon src={EDITSVG} className="mr-[7px]" /> 重命名
                                </div>
                              </DropdownMenuItem> */}
                              <DropdownMenuItem className="gap-2 p-2 cursor-pointer">
                                <div
                                  className="text-[rgba(51,51,51,0.8)] text-xs cursor-pointer flex"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    const tags = (item.tags || [])?.filter((item) => item != "fav");
                                    await updateSessionMetadata({
                                      sessionId: item.id,
                                      metadata: {
                                        tags: [...tags, "fav"],
                                        name: item.name,
                                      },
                                    });
                                    // await chatService.toggleFavorite(item.id, true);
                                    toast.success(`收藏成功`);
                                    loadSessions()
                                  }}
                                >
                                  <Icon src={COLLECTSVG} className="mr-[7px]" /> 收藏
                                </div>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2 p-2 cursor-pointer"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  await deleteSession(item.id);
                                  toast.success(`删除成功`);
                                }}
                              >
                                <div className="text-[rgba(51,51,51,0.8)] text-xs cursor-pointer flex">
                                  <Icon src={TRASHSVG} className="mr-[7px]" /> 删除对话
                                </div>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CommandItem>
                  </motion.div>
                );
              })}
            </CommandGroup>

            {/* <CommandGroup heading="Settings">
              <CommandItem>
                <User />
                <span>Profile</span>
                <CommandShortcut>⌘P</CommandShortcut>
              </CommandItem>
            </CommandGroup> */}
          </CommandList>
        </Command>
      </div>
    </div>
  );
};

export default conversations;
