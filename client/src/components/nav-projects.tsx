"use client";

import { Folder, Forward, MoreHorizontal, Trash2, type LucideIcon } from "lucide-react";
import ARROWSVG from "../assets/image/front-arrow.svg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ADDSVG from "../assets/image/front-add.svg";
import LIBRARYSVG from "../assets/image/front-library.svg";
import DOCUMENTSVG from "../assets/image/front-document.svg";
import SEARCHSVG from "../assets/image/front-search.svg";
import LOADINGSVG from "../assets/image/front-loading.svg";
import WhiteLoadingSVG from "../assets/image/front-loadingWhite.svg";
import FileSvg from "../assets/image/front-file.svg";
import EditSvg from "../assets/image/front-edit.svg";
import MATCHSVG from "../assets/image/front-match.svg";
import INCORRECTSVG from "../assets/image/incorrect.svg";
import AISVG from "../assets/image/front-ai.svg";
import Icon from "./icon";
import { ContextType, FC, Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

import { useUploadData } from "@/contexts/UploadDataContext";
import { toast } from "sonner";
import { generateSnowId } from "@/utils";
import { concat } from "lodash";
import ChatLoading from "./ChatLoading";

export const api_key = location.search?.split("=")[1] || "ragflow-EwNGQxYmM4NjY5OTExZjBiNTVmNzIzNz";

export const userid = "101";

export const waitUserSelectExcelFile = (params: {
  onSelect?: (result: File) => void;
  onCancel?: () => void;
  onError?: (error: any) => void;
  accept?: string;
}) => {
  const { onSelect, onCancel, onError, accept = "" } = params;
  const input = document.createElement("input");
  input.type = "file";
  input.accept = accept;
  input.click();
  input.oncancel = () => {
    onCancel?.();
  };
  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;
    onSelect?.(file);
  };
};

const CardData: FC<{ title: string; icon: string; desc: string }> = (props) => {
  return (
    <div className="flex-1 w-[160px] max-w-[160px] h-[120px] border border-[#E0E0E0] rounded-[10px] library_card">
      <div className="flex justify-center mt-[21px] mb-[13px]">
        <img className="h-5 w-5" src={props.icon} />
      </div>
      <div className="text-[#333333] text-[13px] mb-[8px] font-medium text-center">{props.title}</div>
      <div className="text-[rgba(0,0,0,0.3)] text-xs text-center">{props.desc}</div>
    </div>
  );
};

const DocData: FC = (props: any) => {
  const { refreshUploadData } = useUploadData();
  return (
    <div
      key={props.id}
      className="doc_card h-[248px] w-[176px] rounded-[10px] border-[#E0E0E0] border mr-4 mb-4 relative hover:border-[#0563B2] transition-all cursor-pointer"
    >
      <span
        className="w-[12px] h-[12px] absolute right-[-5px] top-[-5px] z-50 cursor-pointer doc_card_close"
        onClick={() => {
          const myHeaders = new Headers();
          myHeaders.append("Content-Type", "application/json");
          const params = new URLSearchParams({
            // api_key: api_key, // 假设你有这个变量
            user_id: userid,
          });

          fetch(`/rag/api/ragflow/user/datasets/${props.selectLibrary?.id}/documents?${params.toString()}`, {
            method: "DElETE",
            headers: myHeaders,
            // redirect: "follow",
            body: JSON.stringify({
              api_key: api_key,
              ids: [props.id],
              dataset_id: props.selectLibrary?.id,
            }),
          }).then((res) => {
            res.json().then((struct) => {
              toast.success("删除知识库成功");
              refreshUploadData();
              console.log(struct, "struct");
            });
          });

          // const raw = JSON.stringify({
          //   dataset_id: "5f947662056e11f0be430242ac170004",
          //   ids: ["29eaae4831f911f0acc90242ac170006"],
          // });

          // const requestOptions = {
          //   method: "DELETE",
          //   headers: myHeaders,
          //   body: raw,
          //   redirect: "follow",
          // };

          // fetch("/rag/api/ragflow/datasets/5f947662056e11f0be430242ac170004/documents", requestOptions)
          //   .then((response) => response.text())
          //   .then((result) => console.log(result))
          //   .catch((error) => console.error(error));
        }}
      >
        <Icon src={INCORRECTSVG}></Icon>
      </span>
      {props.run != "DONE" && (
        <Fragment>
          {props.progress == -1 ? (
            <div>
              <div className="text-[13px] text-[#333333] text-ellipsis whitespace-nowrap px-4 pt-4 pb-2 relative z-0 flex w-full overflow-hidden">
                <Icon className="mr-1.5" src={FileSvg}></Icon>{" "}
                <div title={props.name} className="flex-1 overflow-hidden text-ellipsis">
                  {props.name.split("%")[0]}
                </div>
              </div>
              <div
                className="text-[12px] text-ellipsis px-4 relative z-0 w-full overflow-hidden flex items-center justify-center"
                style={{ color: "rgba(0,0,0,0.3)", height: "130px", width: "174px" }}
              >
                解析失败
              </div>
              <Icon
                className="h-[50px] right-4 bottom-4 absolute"
                src={`/img/svgs/${props.name
                  .split("%")[0]
                  .toLowerCase()
                  .substring(props.name.split("%")[0].lastIndexOf(".") + 1)}.svg`}
              ></Icon>{" "}
            </div>
          ) : (
            <Fragment>
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10 rounded-[8px]">
                <div className="text-xs z-40 text-[#969696]">分析中 ...</div>
              </div>
              <div className="text-[13px] text-[#333333] px-4.5 py-4.5 font-medium flex items-center">
                <div className="mr-1.5">
                  <Icon className="animate-spin" src={LOADINGSVG}></Icon>
                </div>{" "}
                <div>{props.progress == -1 ? "解析失败" : "等待分析"}</div>
              </div>
            </Fragment>
          )}
        </Fragment>
      )}
      {props.run == "DONE" && (
        <div>
          <div className="text-[13px] text-[#333333] text-ellipsis whitespace-nowrap px-4 pt-4 pb-2 relative z-0 flex w-full overflow-hidden">
            <Icon className="mr-1.5" src={FileSvg}></Icon>{" "}
            <div title={props.name} className="flex-1 overflow-hidden text-ellipsis">
              {props.name.split("%")[0]}
            </div>
          </div>
          <div
            className="text-[12px] text-ellipsis px-4 relative z-0 w-full overflow-hidden block"
            style={{ color: "rgba(0,0,0,0.3)", height: "130px", width: "174px" }}
          >
            {props?.random_chunk_info?.content}
          </div>
          <Icon
            className="h-[50px] right-4 bottom-4 absolute"
            src={`/img/svgs/${props.name
              .split("%")[0]
              .toLowerCase()
              .substring(props.name.split("%")[0].lastIndexOf(".") + 1)}.svg`}
          ></Icon>{" "}
        </div>
      )}
    </div>
  );
};

export interface LibraryModelProps {
  // docs: Record<string, any>[];
}

export const LibraryModel: FC<LibraryModelProps> = (props) => {
  // const [docs, setDocs] = useState<any[]>(props.docs);
  const [searchVal, setSearchVal] = useState("");
  const [uploadText, setUploadText] = useState("");
  const { refreshUploadData, libraryData, setUploadData } = useUploadData();
  const [newVisible, setNewVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const [loadingData, setLoadingData] = useState<any>({});

  const [selectLibrary, setSelectLibrary] = useState<any>({});

  const displayFiles = useMemo(() => {
    return (libraryData || []).find((item) => item.id == selectLibrary.id)?.docs || [];
  }, [libraryData, selectLibrary]);


  useEffect(() => {
    const ids = displayFiles.map((item: any) => item.id);
    if (ids.includes(loadingData?.id)) {
      setLoadingData({});
    }
  }, [loadingData?.id, displayFiles]);

  useEffect(() => {
    setRunningLoading(false);
  }, [libraryData]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // 阻止默认换行
      uploadBlankText();
    }
  };
  const [uploadBlankTextLoading, setUploadBlankTextLoading] = useState(false);

  const uploadBlankText = () => {
    console.log(selectLibrary, "selectLibrary");
    if (selectLibrary.permission_own !== "me") {
      toast.error("您不是该知识库的所有者，无法编辑");
      return;
    }
    if (uploadBlankTextLoading) {
      toast("正在上传中");
      return;
    }
    setUploadBlankTextLoading(true);
    fetch("/空模板.txt")
      .then((res) => res.blob()) // 获取文件内容
      .then((blob) => {
        const file = new File([blob], `${uploadText.substring(0, 6)}.txt`, { type: blob.type }); // 构造 File 对象

        const formdata = new FormData();
        formdata.append("file", file); // 上传文件
        formdata.append("mode", "simple");
        formdata.append("rag", "true");
        formdata.append("user_id", userid);
        formdata.append("dataset_name", selectLibrary.name);

        const requestOptions: RequestInit = {
          method: "POST",
          body: formdata,
          redirect: "follow",
        };

        const params = new URLSearchParams({
          user_id: "101", // 假设你有这个变量
        });
        const formData = new FormData();
        formData.append("content", uploadText);

        fetch(`/rag/api/user/jobs?${params.toString()}`, requestOptions)
          .then((response) => response.json())
          .then((result) => {
            fetch(
              `/rag/api/ragflow/user/datasets/${selectLibrary.id}/documents/${result.document_id
              }/chunks?${params.toString()}`,
              {
                method: "post",
                body: formData,
              }
            ).then((v) => {
              setUploadBlankTextLoading(false);
              toast.success(`上传文本内容成功`);
              setUploadText("");
              refreshUploadData();
            });
          })
          .catch((error) => console.error(error));
      });
  };

  const [runningLoading, setRunningLoading] = useState(false);
  console.log(libraryData, 'libraryData');

  return (
    <DialogContent className="h-[659px] w-[1050px] p-0 rounded-[5px]">
      <DialogHeader>
        <DialogTitle className="h-[40px] flex items-center px-4 text-xs text-[#333333] border-b border-[#E0E0E0]">
          <Icon src={LIBRARYSVG} className="mr-1.5"></Icon> 工业知识库
        </DialogTitle>
        {/* <DialogDescription className="h-full">
    
        </DialogDescription> */}
      </DialogHeader>

      <div className="h-[618px] w-full flex">
        <div className="w-[220px] bg-[#F4F4F5] border-r border-b border-[#E0E0E0] h-[618px]">
          {/* <NavProjects
            projects={[
              {
                name: "新建知识库",
                url: "",
                icon: <Icon src={ADDSVG}></Icon>,
              },
            ]}
          /> */}

          <Dialog open={newVisible}>
            <DialogTrigger>
              <div
                className="flex h-[33px] w-[188px] bg-[#fff] border-[#E0E0E0] border rounded-[5px] mt-6 mb-5 mx-4 cursor-pointer text-xs px-4 items-center hover:bg-[#333333] hover:text-[#ffffff]"
                style={{ boxShadow: "2px 2px 4px -1px rgba(68,69,69,0.05)" }}
                onClick={() => {
                  setNewVisible(true);
                }}
              >
                <Icon className="w-4 h-4 mr-2" src={ADDSVG}></Icon> 新建知识库
              </div>
            </DialogTrigger>
            <DialogContent
              className="h-[136px] w-[368px] p-0 rounded-[10px]"
              style={{ boxShadow: "2px 2px 7px -3px rgba(68,69,69,0.1)" }}
            >
              <DialogHeader>
                <DialogTitle
                  onClick={async () => {
                    setNewVisible(false);
                  }}
                  className="h-[36px] flex items-center px-4 text-xs text-[#333333] border-[#E0E0E0] font-normal"
                >
                  <Icon src={EditSvg} className="mr-1.5"></Icon> 新建知识库
                  <DialogClose
                    onClick={() => {
                      setNewVisible(false);
                    }}
                  ></DialogClose>
                </DialogTitle>

                {/* <DialogDescription className="h-full px-[16px]"> */}
                <div className="h-full px-[16px]">
                  <div className="px-[14px]">
                    <Input
                      value={inputValue}
                      onChange={(e: any) => {
                        setInputValue(e.target.value);
                      }}
                      className="bg-[#F4F4F5] rounded-[10px] border-[#E0E0E0] mb-[20px] h-[30px] text-xs"
                    ></Input>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      className="bg-[#fff] rounded-[20px] w-[64px] h-[30px] cursor-pointer border border-[#E0E0E0] mr-1 text-xs font-normal"
                      variant={"secondary"}
                      onClick={() => {
                        setInputValue("");
                        setNewVisible(false);
                      }}
                    >
                      取消
                    </Button>
                    <Button
                      onClick={async () => {
                        const formData = new FormData();
                        formData.append("name", inputValue);
                        formData.append("user_id", userid);
                        const params = new URLSearchParams({
                          user_id: userid, // 假设你有这个变量
                        });
                        await fetch(`/rag/api/ragflow/user/datasets?${params.toString()}`, {
                          method: "post",
                          body: formData,
                        });
                        toast.success(`新建成功`);
                        refreshUploadData();
                        setInputValue("");
                        setNewVisible(false);
                      }}
                      className="rounded-[20px] w-[64px] h-[30px] cursor-pointer text-xs font-normal"
                    >
                      新建
                    </Button>
                  </div>
                </div>
                {/* </DialogDescription> */}
              </DialogHeader>
            </DialogContent>
          </Dialog>

          <div className="h-[1px] mt-0 mb-[12px] bg-[#E0E0E0] mx-4"></div>
          {libraryData.map((item, index) => {
            return (
              <div
                onClick={() => {
                  console.log(item, 'itemitem');

                  setSelectLibrary(item);
                }}
                key={index}
                className={`flex hover:bg-[#E4E4E5] px-1 cursor-pointer transition-all items-center py-1 mx-4 my-1.5 ${item.id == selectLibrary?.id ? "bg-[#E4E4E5]" : ""
                  }`}
              >
                <Icon src={LIBRARYSVG} className="mr-2 text-xs"></Icon>{" "}
                <div className="flex-1 text-[#333333] text-xs">{item.name}</div>
                <div className="flex items-center">
                  <span className="mr-0.5 text-xs text-[#333333]">{(item.docs || []).length}</span>{" "}
                  <span>
                    <Icon src={FileSvg}></Icon>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-[78px] h-min-[78px] border-b border-[#E0E0E0] px-6 pt-[20px]">
            <div className="text-[18px] font-semibold">{selectLibrary.id ? selectLibrary.name : "知识库"}</div>
            <div className="text-[rgba(0,0,0,0.3)] text-xs">
              {selectLibrary.id ? selectLibrary.description : "OnChain PLM工业知识库"}
            </div>
          </div>

          {selectLibrary?.id ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="h-[144px] border-b border-[#E0E0E0] w-full flex py-3 px-4">
                <div className="chat_input flex-1 mr-3 relative">
                  <Textarea
                    value={uploadText}
                    placeholder="一些准备上传到知识库的文本内容"
                    className="placeholder:text-[rgba(0,0,0,0.3)] placeholder:text-xs max-h-[121px] min-h-[121px] border-[#0563B2] shadow-none resize-none textarea_bg text-xs"
                    onChange={(e) => {
                      setUploadText(e.target.value);
                      // setInputMessaage(e.target.value);
                    }}
                    onKeyDown={handleKeyDown}
                  // onKeyDown={handleKeyDown}
                  // onKeyPress={(e) => {
                  //   if(e.en)
                  // }}
                  />
                  <Button
                    className="bg-[#0563B2] h-[24px] w-[24px] rounded-[50%] p-0 cursor-pointer absolute right-[16px] bottom-[6px]"
                    size="icon"
                    onClick={uploadBlankText}
                  >
                    <Icon
                      className={`w-4 h-4 rotate-180 ${uploadBlankTextLoading ? "animate-spin" : ""}`}
                      src={uploadBlankTextLoading ? WhiteLoadingSVG : ARROWSVG}
                    ></Icon>
                  </Button>
                </div>
                <div
                  className="flex-1 w-[160px] max-w-[160px] h-[120px] border border-[#E0E0E0] rounded-[10px] file_update_bg hover:border-[#0563B2] transition-all cursor-pointer"
                  onClick={async () => {
                    if (selectLibrary.permission_own !== "me") {
                      toast.error("您不是该知识库的所有者，无法编辑");
                      return;
                    }
                    if (runningLoading) {
                      toast.error("请等待上传完成");
                      return;
                    }
                    waitUserSelectExcelFile({
                      onSelect: (result) => {
                        const formdata = new FormData();
                        formdata.append("file", result, result.name);
                        formdata.append("mode", "simple");
                        formdata.append("rag", "true");
                        // formdata.append("api_key", api_key);
                        formdata.append("user_id", userid);
                        formdata.append("dataset_name", selectLibrary.name);

                        const requestOptions: any = {
                          method: "POST",
                          body: formdata,
                          redirect: "follow",
                        };
                        setRunningLoading(true);
                        fetch("/rag/api/user/jobs", requestOptions)
                          .then((response) => response.json())
                          .then((result) => {
                            console.log(result, "resultresult");
                            setLoadingData({
                              id: result.document_id,
                              name: result?.name || "",
                              run: "running",
                              isCustom: true,
                            });
                            // setRunningLoading(false);
                            console.log(result);
                            refreshUploadData();
                          })
                          .catch((error) => {
                            // setRunningLoading(false);
                          });
                        console.log(result, "result");
                      },
                    });
                  }}
                >
                  <div className="flex justify-center mt-[35px] mb-[13px]">
                    <img className="h-5 w-5" src={DOCUMENTSVG} />
                  </div>
                  <div className="text-[#333333] text-[13px] mb-[8px] font-medium text-center">从文件上传</div>
                </div>
              </div>
              <div className="border-b border-b-[#E0E0E0] flex px-3.5">
                <Icon src={SEARCHSVG} className="w-4"></Icon>
                <Input
                  value={searchVal}
                  className="border-none text-xs placeholder:text-xs outline-none shadow-none placeholder:text-[rgba(0,0,0,0.3)]"
                  placeholder="搜索你的知识库"
                  prefix="1"
                  onChange={(e) => {
                    setSearchVal(e.target.value);
                  }}
                // prefix={<Icon src={DOCUMENTSVG}></Icon>}
                ></Input>
              </div>
              <div className="px-4 py-4 flex flex-wrap overflow-y-auto">
                {(runningLoading ||
                  (loadingData && loadingData.id && !displayFiles.map((item: any) => item.id).includes(loadingData?.id))
                  ? [loadingData, ...displayFiles]
                  : displayFiles
                )
                  .filter((item: any) => (item?.name || "").toLowerCase().indexOf(searchVal.toLowerCase()) != -1)
                  .map((item: any, index: number) => {
                    // if (item.running) {
                    return (
                      <Fragment key={item.id || item.name}>
                        <DocData {...item} selectLibrary={selectLibrary}></DocData>
                      </Fragment>
                    );
                    // }
                    // return (
                    //   <motion.div
                    //     key={item.id || item.name} // 用唯一标识
                    //     initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    //     animate={{ opacity: 1, y: 0, scale: 1 }}
                    //     exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    //     transition={{ duration: 0.25, delay: index * 0.05 }}
                    //   >
                    //     <DocData {...item} selectLibrary={selectLibrary}></DocData>
                    //   </motion.div>
                    // );
                  })}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden flex justify-center items-start mt-[130px]">
              <div className="flex justify-center flex-col">
                <div className="text-[18px] font-semibold text-center mb-3">欢迎来到你的工业知识库</div>
                <div className="text-[rgba(0,0,0,0.3)] text-xs text-center mb-8">OnChain PLM 工业知识库</div>
                <div className="flex gap-6">
                  {[
                    { title: "第一步：上传文件", icon: DOCUMENTSVG, desc: "上传需要分析文件" },
                    { title: "第二步：分析处理", icon: AISVG, desc: "提取知识单元" },
                    { title: "第三步：智能匹配", icon: MATCHSVG, desc: "为对话提供活力" },
                  ].map((item, index) => {
                    return <CardData key={index} {...item}></CardData>;
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DialogContent>
  );
};

export function NavProjects({
  projects,
}: {
  projects: {
    name: string;
    url: string;
    icon: any;
    key?: string;
    collapseHidden?: boolean;
    onClick?: any
  }[];
}) {
  const navigate = useNavigate();
  // const { isMobile, open } = useSidebar();
  // const { navVisible, setNavVisible } = useOutletContext<any>();
  const savedNavVisible = localStorage.getItem('navVisible');

  
  if (!savedNavVisible || savedNavVisible == "false") {
    return (
      <SidebarGroup>
        <SidebarMenu>
          {projects.map((item) => {
            if (item.key === "library") {
              return (
                <Dialog key={item.key}>
                  <DialogTrigger>
                    <SidebarMenuItem key={item.name} className="side_item_start cursor-pointer hover:bg-surface-hover p-0">
                      <SidebarMenuButton asChild className={`text-xs p-0 flex justify-center items-center`}>
                        <a>{item.icon}</a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </DialogTrigger>
                  <LibraryModel key={"model2"}></LibraryModel>
                </Dialog>
              );
            } else {
              return (
                <SidebarMenuItem key={item.key} className="p-0">
                  <SidebarMenuButton asChild className={`text-xs sidebar_collapse_btn cursor-pointer hover:bg-surface-hover p-0 flex justify-center items-center`}>
                    <a
                      onClick={item.onClick}
                    >
                      {item.icon}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }
          })}
        </SidebarMenu>
      </SidebarGroup>
    );
  }


  return (
    <SidebarGroup>
      <SidebarMenu>
        {projects
          .filter((v) => !v.collapseHidden)
          .map((item) => {
            if (item.key === "library") {
              return (
                <Dialog key={item.key}>
                  <DialogTrigger>
                    <SidebarMenuItem key={item.name} className="side_item_start cursor-pointer hover:bg-surface-hover">
                      <SidebarMenuButton asChild className="text-xs">
                        <a>
                          {item.icon}
                          <span>{item.name}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </DialogTrigger>
                  <LibraryModel key={"model1"}></LibraryModel>
                </Dialog>
              );
            } else {
              return (
                <SidebarMenuItem key={item.key} className="side_item_start cursor-pointer hover:bg-surface-hover">
                  <SidebarMenuButton asChild className="text-xs">
                    <a
                      onClick={item.onClick}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }
          })}
        {/* <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontal className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem> */}
      </SidebarMenu>
    </SidebarGroup>
  );
}
