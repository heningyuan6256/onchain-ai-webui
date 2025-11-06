// import { dataSet, ragflowAPI } from "@/components/nav-projects";
import { api_key, userid } from "@/components/nav-projects";
import React, { createContext, useState, useEffect, useContext } from "react";

// 上下文类型定义
interface UploadDataContextType {
  libraryData: any[];
  uploadData: any[];
  chatData: any[];
  filesData: any[];
  checkList: any[];
  chunksLength: number;
  filesLength: number;
  isStreaming: boolean;
  setCheckList: any;
  thinking: boolean;
  setThinking: (thinking: boolean) => void;
  setIsStreaming: (flag: boolean) => void;
  setUploadData: React.Dispatch<React.SetStateAction<any>>;
  refreshUploadData: () => void;
  refreshChatData: () => void;
}

// 创建上下文
const UploadDataContext = createContext<UploadDataContextType | undefined>(undefined);

// Provider 组件
export const UploadDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uploadData, setUploadData] = useState<any>([]);
  const [chunksLength, setChunksLength] = useState<any>([]);
  const [filesLength, setFilesLength] = useState<any>([]);
  const [filesData, setFilesData] = useState<any>([]);

  const [thinking, setThinking] = useState<boolean>(false);

  const [libraryData, setLibraryData] = useState<any>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const [checkList, setCheckList] = useState<string[]>([]);

  const [chatData, setChatData] = useState<any[]>([]);

  const refreshChatData = () => {
    // chatService.fetchMessages(null, api_key).then((res: any = []) => {
    //   res?.forEach((item: any) => {
    //     const lists = item.content ? JSON.parse(item.content) : [];
    //     item.title = lists[0]?.data[0]?.content.slice(0, 10);
    //   });
    //   //@ts-ignore
    //   res.sort((a: any, b: any) => new Date(b.created_at) - new Date(a.created_at));
    //   setChatData([...res]);
    // });
  };

  React.useEffect(() => {
    refreshChatData();
  }, []);

  // 抽取请求逻辑
  const fetchUploadData = async () => {
    const params = new URLSearchParams({
      // api_key: api_key, // 假设你有这个变量
      other_id: localStorage.getItem("id")!,
      pageNum:"1",
      pageSize: "100"
    });
    const { rows: ListDataSets } = await fetch(`/rag/system/ragflow/datasets?${params.toString()}`, {
      method: "GET",
      // headers: { Authorization: `Bearer ${ragflowAPI}` },
    }).then((response) => response.json());
    const PromiseData: Promise<any>[] = [];

    (ListDataSets || []).forEach((item: any) => {
      PromiseData.push(
        new Promise((resolve) => {
          const params = new URLSearchParams({
            // api_key: api_key, // 假设你有这个变量
            user_id: localStorage.getItem("id")!,
            dataset_id: item.id,
          });

          fetch(`/rag/system/ragflow/datasets/documents/list_sys_doc?${params.toString()}`, {
            method: "GET",
            // headers: { Authorization: `Bearer ${ragflowAPI}` },
            redirect: "follow",
          })
            .then((response) => response.json())
            .then((result) => {
              const datas = result.rows;
              resolve({ ...item, docs: datas });
            });
        })
      );
    });

    const datas = await Promise.all(PromiseData);

    setLibraryData(datas);

    let chunksCount = 0;
    let FilesCount = 0;
    datas.forEach((item) => {
      FilesCount = FilesCount + (item.docs || []).length;
      (item.docs || []).forEach((v: any) => {
        chunksCount = chunksCount + v.chunk_count;
      });
    });
    setFilesLength(FilesCount);
    setChunksLength(chunksCount);
  };

  // 初始化请求 + 每5秒刷新一次
  useEffect(() => {
    fetchUploadData(); // 初始加载

    // 轮询
    // const interval = setInterval(() => {
      fetchUploadData();
    // }, 10000); // 每5秒刷新

    return () => {
      // clearInterval(interval); // 组件卸载时清理
    };
  }, []);

  return (
    <UploadDataContext.Provider
      value={{
        uploadData,
        chatData,
        checkList,
        setCheckList,
        filesData,
        chunksLength,
        filesLength,
        libraryData,
        refreshChatData,
        setUploadData,
        isStreaming,
        setIsStreaming,
        thinking,
        setThinking,
        refreshUploadData: fetchUploadData,
      }}
    >
      {children}
    </UploadDataContext.Provider>
  );
};

// 自定义 Hook
export const useUploadData = (): UploadDataContextType => {
  const context = useContext(UploadDataContext);
  if (!context) {
    throw new Error("useUploadData must be used within an UploadDataProvider");
  }
  return context;
};
