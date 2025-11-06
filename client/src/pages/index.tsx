import { FC, useEffect, useMemo, useRef, useState } from "react";
import "./index.css";
import ADDSVG from "../assets/image/front-add.svg";

import ARROWBLACKSVG from "../assets/image/front-arrowBlack.svg";

import { AutoScroll } from "@splidejs/splide-extension-auto-scroll";

import UPLOADLIGHTGREYSVG from "../assets/image/front-uploadLightGrey.svg";
import KNOWLEDGEUNITSVG from "../assets/image/front-knowledgeunitlightgrey.svg";

import LIBRARYLIGHTSVG from "../assets/image/front-libraryGrey.svg";
import ArrowLightGrey from "../assets/image/front-arrowLightGrey.svg";
import { Toggle } from "@/components/ui/toggle";
import Icon from "@/components/icon";
import { motion, AnimatePresence } from "framer-motion";
// Default theme
//@ts-ignore
import "@splidejs/splide/css";
import Typed from "typed.js";

import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { api_key, LibraryModel, userid } from "@/components/nav-projects";
//@ts-ignore
import { CountUp } from "countup.js";
import ChatTextBox from "@/components/ChatTextBox";
import { generateSnowId } from "@/utils";
import { useNavigate } from "react-router-dom";
import { useAsyncEffect, useMount } from "ahooks";
import { useUploadData } from "@/contexts/UploadDataContext";
import { getDateTime } from "@/components/ChatView";
import { useSession } from "@/tars/common/hooks/useSession";

const CardData: FC<{ title: string; icon: string; count: number; index: number }> = (props) => {
  const dataRef = useRef(null);
  useEffect(() => {
    const countUp = new CountUp(dataRef.current!, Number(props.count), {
      duration: 1.0,
    });
    countUp.start();
    // return () => {
    //   countUp.d
    // }
  }, [props.count]);
  return (
    <div className="flex-1 card_data cursor-pointer">
      <motion.div
        key={props.index} // 用唯一标识
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.3,
          delay: (props.index + 1) * 0.2, // 顺序进入
        }}
      >
        <div className="text-[#333333] text-xs mb-2">{props.title}</div>
        <div className="flex justify-between">
          <div>
            <img src={props.icon} className="h-[64px]" />
          </div>
          <div className="items-end flex text-[#333333] text-4xl" ref={dataRef}>
            {/* {props.count} */}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const libraryContentData = [
  {
    title: "工业知识库",
    count: 1,
    icon: LIBRARYLIGHTSVG,
  },
  {
    title: "已上传文件",
    count: 3,
    icon: UPLOADLIGHTGREYSVG,
  },
  {
    title: "知识单元",
    count: 28,
    icon: KNOWLEDGEUNITSVG,
  },
];

function getRandomEight(arr: any[]) {
  if (arr.length <= 8) return arr; // 如果少于8个，就返回原数组
  const shuffled = arr.slice().sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 8);
}

function extractToolDescriptions(markdown: string) {
  const lines = markdown.split("\n");
  const toolLines = lines.filter((line) => line.trim().startsWith("- "));
  const toolDescriptions = toolLines
    .map((line) => {
      // 匹配格式：- tool_name: 描述文字
      const match = line.match(/^- ([^:]+):\s*(.+)$/);
      if (match) {
        const [, toolName, description] = match;
        const shortDesc = description.split(/[，。,、；;:：]/)[0].trim();
        return {
          tool: toolName.trim(),
          shortDescription: shortDesc,
        };
      }
      return null;
    })
    .filter(Boolean);
  return toolDescriptions;
}

const options = {
  type: "loop",
  gap: "10px",
  pauseOnHover: false,
  resetProgress: false,
  pagination: false,
  perPage: 4,
  arrows: false,
  drag: "free",
  autoWidth: true,
  height: 30,
  rewind: true,
  autoScroll: {
    speed: 0.6,
  },
};

const Home: FC = () => {
  const el = useRef(null);
  const [mention2, setMention2] = useState<any>([]);
  const [useKnowledge, setUseKnowledge] = useState(false);
  const { createSession, sendMessage, loadSessions } = useSession();
  const { chunksLength, filesLength, libraryData, refreshChatData, thinking } = useUploadData();
  useMount(async () => {
    // const data = await fetch("/api/mcp_tools", {
    //   method: "GET",
    //   redirect: "follow",
    // });
    // const struct = await data.json();
    // const datas = extractToolDescriptions(struct);
    setMention2([
      { shortDescription: "生成中港铝板项目任务持续时间和项目费用图表" },
      { shortDescription: "金利锋轮毂是否满足轮毂设计精度要求" },
      { shortDescription: "帮我写一份周报" },
    ]);
  });

  useEffect(() => {
    const typed = el.current
      ? new Typed(el.current, {
        strings: ["今天有什么可以帮到你？"],
        typeSpeed: 100,
        showCursor: false,
      })
      : null;

    return () => {
      typed?.destroy();
    };
  }, [location.pathname]);
  const navigate = useNavigate();
  // const [uploadData, setUploadData] = useState([]);

  // useEffect(() => {
  //   const requestOptions: any = {
  //     method: "GET",
  //     redirect: "follow",
  //   };
  //   fetch("/rag/api/jobs", requestOptions)
  //     .then((response) => response.json())
  //     .then((result) => setUploadData(result))
  //     .catch((error) => console.error(error));
  // }, []);

  const CreateAndSend = async (msg: string) => {
    try {
      // Check if there are existing sessions
      // if (sessions && sessions.length > 0) {
      //   // Find the latest session and navigate
      //   const latestSession = sessions[0]; // Assuming sessions are sorted by time in descending order
      //   navigate(`/${latestSession.id}`);
      // } else {
      // If no existing sessions, create a new session
      setCreateSessionLoading(true);
      const sessionId = await createSession().catch(() => {
        setCreateSessionLoading(false);
      });
      setCreateSessionLoading(false);
      navigate(`/conversations/${sessionId}`);
      setTimeout(() => {
        sendMessage(msg, thinking, localStorage.getItem("id")!)
          .then(() => {
            loadSessions();
          })
          .catch((error) => {
            console.error("Failed to send initial message:", error);
          });
      }, 500);
      // }
    } catch (error) {
      console.error("Failed to navigate to chat:", error);
    } finally {
      // setIsDirectChatLoading(false);
    }
  };

  const selectJump = async (msg: string) => {
    await CreateAndSend(msg);
  };

  const SplideDom = useMemo(() => {
    return (
      <div className="flex justify-center flex-col h-[96px] overflow-hidden relative w-[570px]">
        {/* <Splide
          key="1"
          extensions={{ AutoScroll }}
          options={options}
          className="mb-[10px]"
          aria-labelledby="autoplay-example-heading"
          hasTrack={false}
        > */}
        <div style={{ position: "relative", display: "flex", gap: "12px", marginBottom: "10px" }}>
          {/* <SplideTrack> */}
          {mention2.slice(0, 1).map((slide: any, index: number) => (
            // <SplideSlide key={index}>
            <div
              key={index}
              onClick={async () => {
                selectJump(slide.shortDescription);
              }}
              className="border-[#E0E0E0] flex items-center bg-[#f4f4f5] rounded-[20px] h-[30px] text-xs text-[#737374] border font-[400] cursor-pointer px-4 hover:border hover:border-[#0563B2] transition-all"
            >
              {slide.shortDescription}
              <Icon className="w-4 h-4 rotate-270" src={ArrowLightGrey}></Icon>
            </div>
          ))}
          {/* </SplideTrack> */}
        </div>

        <div style={{ position: "relative", display: "flex", gap: "12px" }}>
          {/* <SplideTrack> */}
          {mention2.slice(1).map((slide: any, index: number) => (
            // <SplideSlide key={index}>
            <div
              key={index}
              onClick={async () => {
                selectJump(slide.shortDescription);
              }}
              className="border-[#E0E0E0] flex items-center bg-[#f4f4f5] rounded-[20px] h-[30px] text-xs text-[#737374] border font-[400] cursor-pointer px-4 hover:border hover:border-[#0563B2] transition-all"
            >
              {slide.shortDescription}
              <Icon className="w-4 h-4 rotate-270" src={ArrowLightGrey}></Icon>
            </div>
          ))}
          {/* </SplideTrack> */}
        </div>
        {/* </Splide> */}

        {/* <Splide
          key="2"
          extensions={{ AutoScroll }}
          options={options}
          aria-labelledby="autoplay-example-heading"
          hasTrack={false}
        >
          <div style={{ position: "relative" }}>
            <SplideTrack>
              {mention2.slice(mention2.length / 2, mention2.length).map((slide: any, index: number) => (
                <SplideSlide key={index}>
                  <div
                    onClick={async () => {
                      selectJump(slide.shortDescription);
                    }}
                    className="border-[#E0E0E0] flex items-center bg-[#f4f4f5] rounded-[20px] h-[30px] text-xs text-[#737374] border font-[400] ml-[10px] cursor-pointer px-4 hover:border hover:border-[#0563B2] transition-all"
                  >
                    {slide.shortDescription}
                    <Icon className="w-4 h-4 rotate-270" src={ArrowLightGrey}></Icon>
                  </div>
                </SplideSlide>
              ))}
            </SplideTrack>
          </div>
        </Splide> */}
      </div>
    );
  }, [options, mention2]);

  const [createSessionLoading, setCreateSessionLoading] = useState(false);

  return (
    <div className="home_container h-full w-full">
      <div className="flex justify-center items-center h-full w-full">
        <div className="home_chat_box justify-center flex flex-col items-center">
          <div ref={el} className="font-semibold text-[#333333] text-4xl mb-7.5 text-center h-[40px]"></div>

          {/* <ChatLoading loading={createSessionLoading}> */}
          <ChatTextBox
            knowledge={useKnowledge}
            disabled={createSessionLoading}
            onSubmit={async (msg) => {
              // if (isDirectChatLoading) return;

              // setIsDirectChatLoading(true);

              await CreateAndSend(msg);

              // const id = generateSnowId();
              // await chatService.storeMessage({
              //   id,
              //   content: JSON.stringify([
              //     {
              //       role: "user",
              //       id: generateSnowId(),
              //       time: getDateTime(),
              //       data: [{ type: "normal", content: msg }],
              //     },
              //     { role: "assistant", id: generateSnowId(), time: getDateTime(), data: [] },
              //   ]),
              //   user: api_key,
              // });
              // refreshChatData();
              // navigate(`/conversations/${id}`, {
              //   state: {
              //     inputMessage: msg,
              //     useKnowledge: useKnowledge,
              //   },
              // });
            }}
            onSetKnowledge={(checked) => {
              setUseKnowledge(checked);
            }}
          ></ChatTextBox>
          {/* </ChatLoading> */}

          <div className="chat_box h-[180px]">
            <div className="flex gap-2.5 mb-2">
              {libraryContentData.map((item, index) => {
                if (item.title === "已上传文件") {
                  item.count = filesLength;
                } else if (item.title === "知识单元") {
                  item.count = chunksLength;
                } else if (item.title === "工业知识库") {
                  item.count = libraryData.length;
                }
                return <CardData key={index} {...item} index={index}></CardData>;
              })}
            </div>
            <Dialog>
              <DialogTrigger>
                <div className="flex justify-between items-center enter_library h-8 px-4 cursor-pointer w-[548px] border border-[#E0E0E0] hover:border-[#0563B2] transition-all hover:border">
                  <div className="flex">
                    <Icon className="w-4 h-4 rotate-180 mr-1.5" src={ADDSVG}></Icon>
                    <div className="text-xs text-[#333333]">构建知识库</div>
                  </div>
                  <div>
                    <img className="h-4 w-4" style={{ transform: 'rotate(270deg)' }} src={ARROWBLACKSVG} />
                  </div>
                </div>
              </DialogTrigger>
              <LibraryModel></LibraryModel>
            </Dialog>
          </div>
          {SplideDom}
        </div>
      </div>
    </div>
  );
};
export default Home;
