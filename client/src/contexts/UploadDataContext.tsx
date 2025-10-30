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
      user_id: userid,
    });
    // const { rows: ListDataSets } = await fetch(`/rag/system/kb/user/list_sys_kb?${params.toString()}`, {
    //   method: "GET",
    //   // headers: { Authorization: `Bearer ${ragflowAPI}` },
    // }).then((response) => response.json());
    const ListDataSets = [
      {
        avatar: "",
        chunk_count: 2,
        chunk_method: "naive",
        create_date: "Fri, 22 Aug 2025 14:29:39 GMT",
        create_time: 1755844179524,
        created_by: "c3e636206dd111f097189ad6bc6a72cc",
        description: "示例数据集",
        document_count: 1,
        embedding_model: "BAAI/bge-large-zh-v1.5@BAAI",
        id: "6183e4447f2111f09c3fb2f8f377b76a",
        language: "English",
        name: "工业知识库",
        pagerank: 0,
        parser_config: {
          auto_keywords: 0,
          auto_questions: 0,
          chunk_token_num: 128,
          delimiter: "\\n",
          graphrag: {
            use_graphrag: false,
          },
          html4excel: false,
          layout_recognize: "DeepDOC",
          raptor: {
            use_raptor: false,
          },
        },
        permission: "team",
        similarity_threshold: 0.2,
        status: "1",
        tenant_id: "c3e636206dd111f097189ad6bc6a72cc",
        token_num: 819,
        update_date: "Fri, 05 Sep 2025 16:08:32 GMT",
        update_time: 1757059712098,
        vector_similarity_weight: 0.3,
        permission_own: "me",
      },
    ];
    // const requestOptions: RequestInit = {
    //   method: "GET",
    //   redirect: "follow",
    // };
    // fetch("/rag/api/jobs", requestOptions)
    //   .then((response) => response.json())
    //   .then((result) => setUploadData(result))
    //   .catch((error) => console.error("Fetch Upload Data Error:", error));

    // let chunksCount = 0;
    // datas.forEach((item: any) => {
    //   chunksCount = chunksCount + item.chunk_count;
    // });
    // setChunksLength(chunksCount);
    // setFilesData(datas);

    const PromiseData: Promise<any>[] = [];

    (ListDataSets || []).forEach((item: any) => {
      PromiseData.push(
        new Promise((resolve) => {
          const params = new URLSearchParams({
            // api_key: api_key, // 假设你有这个变量
            user_id: userid,
            dataset_id: item.id,
          });

          // resolve({
          //   ...item,
          //   docs: [
          //     {
          //       chunk_count: 2,
          //       chunk_method: "naive",
          //       create_date: "Tue, 02 Sep 2025 09:15:28 GMT",
          //       create_time: 1756775728417,
          //       created_by: "c3e636206dd111f097189ad6bc6a72cc",
          //       dataset_id: "6183e4447f2111f09c3fb2f8f377b76a",
          //       id: "4fed55fe879a11f0be4146f741c0c386",
          //       location: "轮毂设计精度.txt%e774a11d-5f31-4f27-9d9b-82b82faf31c9.md",
          //       meta_fields: {},
          //       name: "轮毂设计精度.txt%e774a11d-5f31-4f27-9d9b-82b82faf31c9.md",
          //       parser_config: {
          //         chunk_token_num: 128,
          //         delimiter: "\\n",
          //         html4excel: false,
          //         layout_recognize: "DeepDOC",
          //         raptor: {
          //           use_raptor: false,
          //         },
          //       },
          //       process_begin_at: "Tue, 02 Sep 2025 09:15:33 GMT",
          //       process_duation: 12.1429,
          //       progress: 1,
          //       progress_msg:
          //         "\n09:15:36 Task has been received.\n09:15:42 Page(1~100000001): Start to parse.\n09:15:42 Page(1~100000001): Finish parsing.\n09:15:43 Page(1~100000001): Generate 1 chunks\n09:15:44 Page(1~100000001): Embedding chunks (0.82s)\n09:15:44 Page(1~100000001): Indexing done (0.48s). Task done (7.92s)",
          //       run: "DONE",
          //       size: 9,
          //       source_type: "local",
          //       status: "1",
          //       thumbnail: "",
          //       token_count: 819,
          //       type: "doc",
          //       update_date: "Tue, 02 Sep 2025 09:15:45 GMT",
          //       update_time: 1756775745143,
          //       random_chunk_info: {
          //         available: true,
          //         content:
          //           "轮毂设计精度要求\r\n一、尺寸精度\r\n\r\n安装孔（螺栓孔/中心孔）\r\n\r\n中心孔直径公差：±0.05 mm\r\n\r\n螺栓孔位置度：≤0.05 mm\r\n\r\n螺栓孔直径公差：H11 级\r\n\r\n螺纹孔（如有）\r\n\r\n螺纹精度：6H/6g\r\n\r\n孔距对称度：≤0.1 mm\r\n\r\n外径/宽度\r\n\r\n外缘直径：±0.15 mm\r\n\r\n轮辋宽度：±0.1 mm\r\n\r\n二、形位公差\r\n\r\n同轴度：轮辋轴线与中心孔轴线 ≤0.15 mm\r\n\r\n端面跳动：轮毂安装基准面相对中心孔轴线的跳动 ≤0.1 mm\r\n\r\n径向跳动：轮辋工作面相对中心孔轴线的径向跳动 ≤0.15 mm\r\n\r\n平行度：轮辋两侧平行度 ≤0.05 mm\r\n\r\n三、表面质量\r\n\r\n铸造/锻造表面缺陷\r\n\r\n不允许有裂纹、气孔、夹渣、缩孔等影响结构强度的缺陷。\r\n\r\n局部划痕、压痕深度不得大于 0.1 mm，且不影响密封与装配。\r\n\r\n涂层/喷漆\r\n\r\n涂层厚度：70–120 μm\r\n\r\n附着力：百格测试 0 级\r\n\r\n耐盐雾 ≥ 480 h（不出现起泡、锈蚀）\r\n\r\n四、力学性能\r\n\r\n静负荷试验：轮毂在额定载荷下无裂纹、永久变形 ≤ 1 mm。\r\n\r\n径向疲劳试验：转动 500,000 次以上无裂纹。\r\n\r\n弯曲疲劳试验：转动 100,000 次以上无裂纹。\r\n\r\n冲击试验：模拟跌落或路缘冲击，无裂纹、脱落。\r\n\r\n五、检测与控制要求\r\n\r\n尺寸检测：三坐标测量仪（CMM）、投影仪。\r\n\r\n形位公差检测：跳动仪、专用工装。\r\n\r\n表面检测：目视+无损检测（X 射线探伤或超声波）。\r\n\r\n涂层检测：膜厚仪、百格试验、盐雾试验。\r\n\r\n力学性能检测：专用疲劳试验机、冲击试验装置。",
          //         dataset_id: "6183e4447f2111f09c3fb2f8f377b76a",
          //         docnm_kwd: "轮毂设计精度.txt%e774a11d-5f31-4f27-9d9b-82b82faf31c9.md",
          //         document_id: "4fed55fe879a11f0be4146f741c0c386",
          //         id: "5c2894a63ad13b7d",
          //         image_id: "",
          //         important_keywords: [],
          //         positions: [],
          //         questions: [],
          //       },
          //     },
          //   ],
          // });
          fetch(`/rag/system/kb/list_sys_doc?${params.toString()}`, {
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
