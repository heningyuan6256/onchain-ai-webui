'use client';

import { Folder, Forward, MoreHorizontal, Trash2, type LucideIcon } from 'lucide-react';
import ARROWSVG from '../assets/image/front-arrow.svg';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import ADDSVG from '../assets/image/front-add.svg';
import LIBRARYSVG from '../assets/image/front-library.svg';
import DOCUMENTSVG from '../assets/image/front-document.svg';
import SEARCHSVG from '../assets/image/front-search.svg';
import LOADINGSVG from '../assets/image/front-loading.svg';
import WhiteLoadingSVG from '../assets/image/front-loadingWhite.svg';
import FileSvg from '../assets/image/front-file.svg';
import EditSvg from '../assets/image/front-edit.svg';
import MATCHSVG from '../assets/image/front-match.svg';
import INCORRECTSVG from '../assets/image/incorrect.svg';
import AISVG from '../assets/image/front-ai.svg';
import Icon from './icon';
import { ContextType, FC, Fragment, useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Button } from './ui/button';

import { useUploadData } from '@/contexts/UploadDataContext';
import { toast } from 'sonner';
import { generateSnowId } from '@/utils';
import { concat } from 'lodash';
import ChatLoading from './ChatLoading';
import { useLatest } from 'ahooks';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/Alert';
import request from '~/request/request';
import { SpinnerWrapper } from './Spiner';

export const api_key = location.search?.split('=')[1] || 'ragflow-EwNGQxYmM4NjY5OTExZjBiNTVmNzIzNz';

export const userid = '123456789';

export const waitUserSelectExcelFile = (params: {
  onSelect?: (result: File) => void;
  onCancel?: () => void;
  onError?: (error: any) => void;
  accept?: string;
}) => {
  const { onSelect, onCancel, onError, accept = '' } = params;
  const input = document.createElement('input');
  input.type = 'file';
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
    <div className="library_card h-[120px] w-[160px] max-w-[160px] flex-1 rounded-[10px] border border-[#E0E0E0]">
      <div className="mb-[13px] mt-[21px] flex justify-center">
        <img className="h-5 w-5" src={props.icon} />
      </div>
      <div className="mb-[8px] text-center text-[13px] font-medium text-[#333333]">
        {props.title}
      </div>
      <div className="text-center text-xs text-[rgba(0,0,0,0.3)]">{props.desc}</div>
    </div>
  );
};

const DocData: FC = (props: any) => {
  const { refreshUploadData } = useUploadData();
  console.log(props.name, 'props.name');

  return (
    <div
      key={props.id}
      className="doc_card relative mb-4 mr-4 h-[248px] w-[176px] cursor-pointer rounded-[10px] border border-[#E0E0E0] transition-all hover:border-[#0563B2]"
    >
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <span className="doc_card_close absolute right-[-5px] top-[-5px] z-50 h-[12px] w-[12px] cursor-pointer">
            <Icon src={INCORRECTSVG}></Icon>
          </span>
        </AlertDialogTrigger>
        <AlertDialogContent className="onchain_dialog">
          <AlertDialogHeader className="onchain_dialog_title">
            <AlertDialogTitle>确定要删除知识文档吗?</AlertDialogTitle>
            <AlertDialogDescription>此操作会永久删除知识文档，不可以回退</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="px-4 py-2">
            <AlertDialogCancel className="onchain_btn">取消</AlertDialogCancel>
            <AlertDialogAction
              className="onchain_btn"
              onClick={() => {
                const myHeaders = new Headers();
                myHeaders.append('Content-Type', 'application/json');
                const params = new URLSearchParams({
                  // api_key: api_key, // 假设你有这个变量
                  user_id: localStorage.getItem('id')!,
                });

                request(
                  `/rag/system/ragflow/datasets/${props.selectLibrary?.id}/documents?${params.toString()}`,
                  {
                    method: 'DElETE',
                    headers: myHeaders,
                    // redirect: "follow",
                    body: JSON.stringify([props.id]),
                  },
                ).then(async (struct) => {
                  await props.fetchKnowldegeData();
                  toast.success('删除知识库成功');
                  console.log(struct, 'struct');
                });
              }}
            >
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {!props.progress_msg.includes('done') && (
        <Fragment>
          {props.progress == -1 ? (
            <div>
              <div className="relative z-0 flex w-full overflow-hidden text-ellipsis whitespace-nowrap px-4 pb-2 pt-4 text-[13px] text-[#333333]">
                <Icon className="mr-1.5" src={FileSvg}></Icon>{' '}
                <div title={props.name} className="flex-1 overflow-hidden text-ellipsis">
                  {props.name.split('%')[0]}
                </div>
              </div>
              <div
                className="relative z-0 flex w-full items-center justify-center overflow-hidden text-ellipsis px-4 text-[12px]"
                style={{ color: 'rgba(0,0,0,0.3)', height: '130px', width: '174px' }}
              >
                解析失败
              </div>
              <Icon
                className="absolute bottom-4 right-4 h-[50px]"
                src={`/img/svgs/default.svg`}
              ></Icon>{' '}
            </div>
          ) : (
            <Fragment>
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[8px] bg-black/20">
                <div className="z-40 text-xs text-[#969696]">
                  分析中 {(props.progress * 100).toFixed(2) + '%'} ...
                </div>
              </div>
              {/* <div className="text-[13px] text-[#333333] px-4.5 py-4.5 font-medium flex items-center">
                <div className="mr-1.5">
                  <Icon className="animate-spin" src={LOADINGSVG}></Icon>
                </div>{" "}
                <div>{props.progress == -1 ? "解析失败" : "等待分析"}</div>
              </div> */}
            </Fragment>
          )}
        </Fragment>
      )}
      {props.progress_msg.includes('done') && (
        <div>
          <div className="relative z-0 flex w-full overflow-hidden text-ellipsis whitespace-nowrap px-4 pb-2 pt-4 text-[13px] text-[#333333]">
            <Icon className="mr-1.5" src={FileSvg}></Icon>{' '}
            <div title={props.name} className="flex-1 overflow-hidden text-ellipsis">
              {props.name.split('%')[0]}
            </div>
          </div>
          <div
            className="relative z-0 block w-full overflow-hidden text-ellipsis px-4 text-[12px]"
            style={{ color: 'rgba(0,0,0,0.3)', height: '130px', width: '174px' }}
            title={`${props.progress_msg}`}
          >
            {`${props.progress_msg}`}
          </div>
          <Icon
            className="absolute bottom-4 right-4 h-[50px]"
            src={`/img/svgs/default.svg`}
          ></Icon>{' '}
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
  const [searchVal, setSearchVal] = useState('');
  const [uploadText, setUploadText] = useState('');
  const { refreshUploadData, libraryData, setUploadData } = useUploadData();
  const [newVisible, setNewVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const [loadingData, setLoadingData] = useState<any>({});

  const [selectLibrary, setSelectLibrary] = useState<any>({});

  const latestSelectLibrary = useLatest(selectLibrary);

  const [displayFiles, setDisplayFiles] = useState([]);
  // const displayFiles = useMemo(() => {
  //   return (libraryData || []).find((item) => item.id == selectLibrary.id)?.docs || [];
  // }, [libraryData, selectLibrary]);

  useEffect(() => {
    const ids = displayFiles.map((item: any) => item.id);
    if (ids.includes(loadingData?.id)) {
      setLoadingData({});
    }
  }, [loadingData?.id, displayFiles]);

  const [loading, setLoading] = useState(false); // 添加loading状态

  const loadingLatest = useLatest(loading);

  const fetchKnowldegeData = async (forceUpdate?: boolean) => {
    // 如果当前正在加载，则不发起新的请求
    if (!forceUpdate && loadingLatest.current) return;

    setLoading(true); // 开始加载

    const params = new URLSearchParams({
      user_id: localStorage.getItem('id')!,
      dataset_id: selectLibrary.id!,
    });

    await request(`/rag/system/ragflow/datasets/documents/list_sys_doc?${params.toString()}`, {
      method: 'GET',
      redirect: 'follow',
    })
      .then((result) => {
        const datas = result.rows;
        setDisplayFiles(datas);
      })
      .catch((err) => console.error('Fetch error:', err))
      .finally(() => {
        setLoading(false); // 数据加载完成后停止loading
      });
  };

  useEffect(() => {
    if (!selectLibrary.id) return;
    // 立即执行一次
    fetchKnowldegeData();

    // 每 4 秒刷新一次，只有在没有加载的情况下才会刷新
    const interval = setInterval(() => {
      if (!loadingLatest.current) {
        fetchKnowldegeData();
      }
    }, 15000);

    // 清理定时器
    return () => clearInterval(interval);
  }, [selectLibrary.id]); // 监听loading状态

  useEffect(() => {
    setRunningLoading(false);
  }, [libraryData]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // 阻止默认换行
      uploadBlankText();
    }
  };
  const [uploadBlankTextLoading, setUploadBlankTextLoading] = useState(false);

  const uploadBlankText = () => {
    console.log(selectLibrary, 'selectLibrary');
    if (selectLibrary.permission_own !== 'me') {
      toast.error('您不是该知识库的所有者，无法编辑');
      return;
    }
    if (uploadBlankTextLoading) {
      toast('正在上传中');
      return;
    }
    setUploadBlankTextLoading(true);
    fetch('/空模板.txt')
      .then((res) => res.blob()) // 获取文件内容
      .then((blob) => {
        const file = new File([blob], `${uploadText.substring(0, 6)}.txt`, { type: blob.type }); // 构造 File 对象

        const formdata = new FormData();
        formdata.append('file', file); // 上传文件
        formdata.append('mode', 'simple');
        formdata.append('rag', 'true');
        formdata.append('other_id', localStorage.getItem('id')!);
        formdata.append('dataset_id', selectLibrary.id);

        const requestOptions: RequestInit = {
          method: 'POST',
          body: formdata,
          redirect: 'follow',
        };

        const params = new URLSearchParams({
          other_id: localStorage.getItem('id')!, // 假设你有这个变量
          dataset_id: selectLibrary.id,
          img_ignore: '1',
        });
        const formData = new FormData();
        formData.append('content', uploadText);

        request(
          `/rag/system/ragflow/datasets/documents/upload?${params.toString()}`,
          requestOptions,
        )
          .then(async (result) => {
            await request(
              `/rag/system/ragflow/datasets/${selectLibrary.id}/parse?dataset_id=${selectLibrary.id}`,
              {
                method: 'POST',
                body: JSON.stringify([result.rows[0].id]),
                redirect: 'follow',
                headers: {
                  accept: 'application/json',
                  'Content-Type': 'application/json',
                },
              },
            );
            request(
              `/rag/system/ragflow/datasets/${selectLibrary.id}/documents/${
                result.document_id
              }/chunks?${params.toString()}`,
              {
                method: 'post',
                body: formData,
              },
            ).then((v) => {
              setUploadBlankTextLoading(false);
              toast.success(`上传文本内容成功`);
              setUploadText('');
              // refreshUploadData();
              fetchKnowldegeData(true);
            });
          })
          .catch((error) => console.error(error));
      });
  };

  const [runningLoading, setRunningLoading] = useState(false);
  console.log(libraryData, 'libraryData');

  return (
    <DialogContent className="h-[659px] w-[1050px] rounded-[5px] p-0">
      <DialogHeader>
        <DialogTitle className="flex h-[40px] items-center border-b border-[#E0E0E0] px-4 text-xs text-[#333333]">
          <Icon src={LIBRARYSVG} className="mr-1.5"></Icon> 工业知识库
        </DialogTitle>
        {/* <DialogDescription className="h-full">
    
        </DialogDescription> */}
      </DialogHeader>

      <div className="flex h-[618px] w-full">
        <div className="h-[618px] w-[220px] border-b border-r border-[#E0E0E0] bg-[#F4F4F5]">
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
                className="mx-4 mb-5 mt-6 flex h-[33px] w-[188px] cursor-pointer items-center rounded-[5px] border border-[#E0E0E0] bg-[#fff] px-4 text-xs hover:bg-[#333333] hover:text-[#ffffff]"
                style={{ boxShadow: '2px 2px 4px -1px rgba(68,69,69,0.05)' }}
                onClick={() => {
                  setNewVisible(true);
                }}
              >
                <Icon className="mr-2 h-4 w-4" src={ADDSVG}></Icon> 新建知识库
              </div>
            </DialogTrigger>
            <DialogContent
              className="h-[136px] w-[368px] rounded-[10px] p-0"
              style={{ boxShadow: '2px 2px 7px -3px rgba(68,69,69,0.1)' }}
            >
              <DialogHeader>
                <DialogTitle
                  onClick={async () => {
                    setNewVisible(false);
                  }}
                  className="flex h-[36px] items-center border-[#E0E0E0] px-4 text-xs font-normal text-[#333333]"
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
                      className="mb-[20px] h-[30px] rounded-[10px] border-[#E0E0E0] bg-[#F4F4F5] text-xs"
                    ></Input>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      className="mr-1 h-[30px] w-[64px] cursor-pointer rounded-[20px] border border-[#E0E0E0] bg-[#fff] text-xs font-normal"
                      variant={'secondary'}
                      onClick={() => {
                        setInputValue('');
                        setNewVisible(false);
                      }}
                    >
                      取消
                    </Button>
                    <Button
                      onClick={async () => {
                        const formData = new FormData();
                        formData.append('name', inputValue);
                        formData.append('other_id', localStorage.getItem('id')!);
                        const params = new URLSearchParams({
                          other_id: localStorage.getItem('id')!, // 假设你有这个变量
                          name: inputValue,
                        });
                        const toastId = toast.loading('正在新建');
                        const data = await request(
                          `/rag/system/ragflow/datasets?${params.toString()}`,
                          {
                            method: 'post',
                            body: formData,
                          },
                        );
                        if (data.status == 200) {
                          toast.dismiss(toastId);
                          toast.success(`新建成功`);
                          refreshUploadData();
                          setInputValue('');
                          setNewVisible(false);
                        } else {
                          toast.dismiss(toastId);
                          toast.error('服务器发生错误！');
                        }
                      }}
                      className="h-[30px] w-[64px] cursor-pointer rounded-[20px] text-xs font-normal"
                    >
                      新建
                    </Button>
                  </div>
                </div>
                {/* </DialogDescription> */}
              </DialogHeader>
            </DialogContent>
          </Dialog>

          <div className="mx-4 mb-[12px] mt-0 h-[1px] bg-[#E0E0E0]"></div>
          {libraryData.map((item, index) => {
            return (
              <div
                onClick={() => {
                  console.log(item, 'itemitem');

                  setSelectLibrary(item);
                }}
                key={index}
                className={`library_item relative mx-4 my-1.5 flex cursor-pointer items-center px-1 py-1 transition-all hover:bg-[#E4E4E5] ${
                  item.id == selectLibrary?.id ? 'bg-[#E4E4E5]' : ''
                }`}
              >
                <Icon src={LIBRARYSVG} className="mr-2 text-xs"></Icon>{' '}
                <div className="flex-1 text-xs text-[#333333]">{item.name}</div>
                <div className="flex items-center">
                  <span className="mr-0.5 text-xs text-[#333333]">{item.document_count}</span>{' '}
                  <span>
                    <Icon src={FileSvg}></Icon>
                  </span>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <span className="library_delete doc_card_close absolute right-[-5px] top-[-5px] z-50 h-[12px] w-[12px] cursor-pointer">
                      <Icon src={INCORRECTSVG}></Icon>
                    </span>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="onchain_dialog">
                    <AlertDialogHeader className="onchain_dialog_title">
                      <AlertDialogTitle>确定要删除知识库吗?</AlertDialogTitle>
                      <AlertDialogDescription>
                        此操作会永久删除知识库，不可以回退
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="px-4 py-2">
                      <AlertDialogCancel className="onchain_btn">取消</AlertDialogCancel>
                      <AlertDialogAction
                        className="onchain_btn"
                        onClick={() => {
                          const myHeaders = new Headers();
                          myHeaders.append('Content-Type', 'application/json');
                          const params = new URLSearchParams({
                            // api_key: api_key, // 假设你有这个变量
                            user_id: localStorage.getItem('id')!,
                          });

                          request(`/rag/system/ragflow/datasets?${params.toString()}`, {
                            method: 'DElETE',
                            headers: myHeaders,
                            // redirect: "follow",
                            body: JSON.stringify([item.id]),
                          })
                            .then((res) => {
                              if (res.status == 200) {
                                toast.success('删除成功');
                                refreshUploadData();
                                if (selectLibrary == item.id) {
                                  setSelectLibrary({});
                                }
                              }
                            })
                            .catch((error) => {
                              toast.error(error);
                            });
                        }}
                      >
                        确认
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            );
          })}
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="h-min-[78px] h-[78px] border-b border-[#E0E0E0] px-6 pt-[20px]">
            <div className="text-[18px] font-semibold">
              {selectLibrary.id ? selectLibrary.name : '知识库'}
            </div>
            <div className="text-xs text-[rgba(0,0,0,0.3)]">
              {selectLibrary.id ? selectLibrary.description : 'OnChain PLM工业知识库'}
            </div>
          </div>

          {selectLibrary?.id ? (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex h-[144px] w-full border-b border-[#E0E0E0] px-4 py-3">
                <div className="chat_input relative mr-3 flex-1">
                  <Textarea
                    value={uploadText}
                    placeholder="一些准备上传到知识库的文本内容"
                    className="textarea_bg max-h-[121px] min-h-[121px] resize-none border-[#e0e0e0] text-xs shadow-none placeholder:text-xs placeholder:text-[rgba(0,0,0,0.3)] hover:border-[#0563B2]"
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
                    className="absolute bottom-[6px] right-[16px] h-[24px] w-[24px] cursor-pointer rounded-[50%] bg-[#0563B2] p-0"
                    size="icon"
                    onClick={uploadBlankText}
                  >
                    <Icon
                      className={`h-4 w-4 rotate-180 ${uploadBlankTextLoading ? 'animate-spin' : ''}`}
                      src={uploadBlankTextLoading ? WhiteLoadingSVG : ARROWSVG}
                    ></Icon>
                  </Button>
                </div>
                <div
                  className="file_update_bg h-[120px] w-[160px] max-w-[160px] flex-1 cursor-pointer rounded-[10px] border border-[#E0E0E0] transition-all hover:border-[#0563B2]"
                  onClick={async () => {
                    if (selectLibrary.permission_own !== 'me') {
                      toast.error('您不是该知识库的所有者，无法编辑');
                      return;
                    }
                    if (runningLoading) {
                      toast.error('请等待上传完成');
                      return;
                    }
                    waitUserSelectExcelFile({
                      onSelect: (result) => {
                        const formdata = new FormData();
                        formdata.append('file', result, result.name);
                        formdata.append('mode', 'simple');
                        formdata.append('rag', 'true');
                        // formdata.append("api_key", api_key);
                        formdata.append('other_id', localStorage.getItem('id')!);
                        formdata.append('dataset_id', selectLibrary.id);

                        const requestOptions: any = {
                          method: 'POST',
                          body: formdata,
                          redirect: 'follow',
                        };
                        setLoading(true);
                        setRunningLoading(true);
                        request(
                          `/rag/system/ragflow/datasets/documents/upload?dataset_id=${selectLibrary.id}&img_ignore=1`,
                          requestOptions,
                        )
                          .then(async (result) => {
                            await request(
                              `/rag/system/ragflow/datasets/${selectLibrary.id}/parse?dataset_id=${selectLibrary.id}`,
                              {
                                method: 'POST',
                                body: JSON.stringify([result.rows[0].id]),
                                redirect: 'follow',
                                headers: {
                                  accept: 'application/json',
                                  'Content-Type': 'application/json',
                                },
                              },
                            );
                            setLoading(false);
                            console.log(result);
                            await fetchKnowldegeData(true);
                            setRunningLoading(false);
                          })
                          .catch((error) => {
                            toast.error('服务器错误');
                            setLoading(false);
                            setRunningLoading(false);
                          });
                        console.log(result, 'result');
                      },
                    });
                  }}
                >
                  <div className="mb-[13px] mt-[35px] flex justify-center">
                    <img className="h-5 w-5" src={DOCUMENTSVG} />
                  </div>
                  <div className="mb-[8px] text-center text-[13px] font-medium text-[#333333]">
                    {runningLoading ? '正在上传' : '从文件上传'}{' '}
                  </div>
                </div>
              </div>
              <div className="flex border-b border-b-[#E0E0E0] px-3.5">
                <Icon src={SEARCHSVG} className="w-4"></Icon>
                <Input
                  value={searchVal}
                  className="border-none text-xs shadow-none outline-none placeholder:text-xs placeholder:text-[rgba(0,0,0,0.3)]"
                  placeholder="搜索你的知识库"
                  prefix="1"
                  onChange={(e) => {
                    setSearchVal(e.target.value);
                  }}
                  // prefix={<Icon src={DOCUMENTSVG}></Icon>}
                ></Input>
              </div>
              <SpinnerWrapper
                isLoading={loading}
                children={
                  <div className="flex flex-wrap overflow-y-auto px-4 py-4">
                    {displayFiles
                      .filter(
                        (item: any) =>
                          (item?.name || '').toLowerCase().indexOf(searchVal.toLowerCase()) != -1,
                      )
                      .map((item: any, index: number) => {
                        // if (item.running) {
                        return (
                          <Fragment key={item.id || item.name}>
                            <DocData
                              {...item}
                              selectLibrary={selectLibrary}
                              fetchKnowldegeData={fetchKnowldegeData}
                            ></DocData>
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
                }
              ></SpinnerWrapper>
            </div>
          ) : (
            <div className="mt-[130px] flex flex-1 items-start justify-center overflow-hidden">
              <div className="flex flex-col justify-center">
                <div className="mb-3 text-center text-[18px] font-semibold">
                  欢迎来到你的工业知识库
                </div>
                <div className="mb-8 text-center text-xs text-[rgba(0,0,0,0.3)]">
                  OnChain PLM 工业知识库
                </div>
                <div className="flex gap-6">
                  {[
                    { title: '第一步：上传文件', icon: DOCUMENTSVG, desc: '上传需要分析文件' },
                    { title: '第二步：分析处理', icon: AISVG, desc: '提取知识单元' },
                    { title: '第三步：智能匹配', icon: MATCHSVG, desc: '为对话提供活力' },
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
    onClick?: any;
  }[];
}) {
  const navigate = useNavigate();
  // const { isMobile, open } = useSidebar();
  // const { navVisible, setNavVisible } = useOutletContext<any>();
  const savedNavVisible = localStorage.getItem('navVisible');

  if (savedNavVisible == 'false') {
    return (
      <SidebarGroup>
        <SidebarMenu>
          {projects.map((item) => {
            if (item.key === 'library') {
              return (
                <Dialog key={item.key}>
                  <DialogTrigger>
                    <SidebarMenuItem
                      key={item.name}
                      className="side_item_start cursor-pointer p-0 hover:bg-surface-hover"
                    >
                      <SidebarMenuButton
                        asChild
                        className={`flex items-center justify-center p-0 text-xs`}
                      >
                        <a>{item.icon}</a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </DialogTrigger>
                  <LibraryModel key={'model2'}></LibraryModel>
                </Dialog>
              );
            } else {
              return (
                <SidebarMenuItem key={item.key} className="p-0">
                  <SidebarMenuButton
                    asChild
                    className={`sidebar_collapse_btn flex cursor-pointer items-center justify-center p-0 text-xs hover:bg-surface-hover`}
                  >
                    <a onClick={item.onClick}>{item.icon}</a>
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
            if (item.key === 'library') {
              return (
                <Dialog key={item.key}>
                  <DialogTrigger>
                    <SidebarMenuItem
                      key={item.name}
                      className="side_item_start cursor-pointer hover:bg-surface-hover"
                    >
                      <SidebarMenuButton asChild className="text-xs">
                        <a>
                          {item.icon}
                          <span>{item.name}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </DialogTrigger>
                  <LibraryModel key={'model1'}></LibraryModel>
                </Dialog>
              );
            } else {
              return (
                <SidebarMenuItem
                  key={item.key}
                  className="side_item_start cursor-pointer hover:bg-surface-hover"
                >
                  <SidebarMenuButton asChild className="text-xs">
                    <a onClick={item.onClick}>
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
