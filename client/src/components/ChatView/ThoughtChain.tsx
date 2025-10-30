import { ThoughtChain, ThoughtChainItem } from "@ant-design/x";
import Icon from "@/components/icon";
import React, { FC, useEffect, useMemo, useState } from "react";
import BachendChooseSVG from "@/assets/image/front-blackChoose.svg";
import Loading1SVG from "@/assets/image/front-loading1.svg";
import AISVG from "@/assets/image/front-ai.svg";
import ExpandSvg from "@/assets/image/front-expandGrey.svg";
import { generateSnowId } from "@/utils";
import RenderMardown from "../Markdown";
// import ArrowSvg from "@/assets/image/front-arrow.svg";

function getStatusIcon(status: ThoughtChainItem["status"]) {
  switch (status) {
    case "success":
      return <Icon className="w-4 h-4" src={BachendChooseSVG}></Icon>;
    case "error":
      return <div>2</div>;
    case "pending":
      return <Icon className="w-4 h-4 animate-spin" src={Loading1SVG}></Icon>;
    default:
      return undefined;
  }
}

// const mockServerResponseData: ThoughtChainItem[] = [
//   {
//     title: "过程节点1",
//     // status: "success",
//     description: "",
//     icon: getStatusIcon("success"),
//   },
//   {
//     title: "过程节点2",
//     // status: "success",
//     description: "",
//     icon: getStatusIcon("pending"),
//   },
//   //   {
//   //     title: "Thought Chain Item - 2",
//   //     status: "error",
//   //     description: "status: error",
//   //     icon: getStatusIcon("error"),
//   //   },
// ];

const delay = (ms: number) => {
  return new Promise<void>((resolve) => {
    const timer: NodeJS.Timeout = setTimeout(() => {
      clearTimeout(timer);
      resolve();
    }, ms);
  });
};

// function addChainItem() {
//   mockServerResponseData.push({
//     title: `过程节点${mockServerResponseData.length + 1}`,
//     // status: "pending",
//     icon: getStatusIcon("pending"),
//     description: "",
//   });
// }

// async function updateChainItem(status: ThoughtChainItem["status"]) {
//   await delay(200);
//   //   mockServerResponseData[mockServerResponseData.length - 1].status = status;
//   mockServerResponseData[mockServerResponseData.length - 1].icon = getStatusIcon(status);
//   //   mockServerResponseData[mockServerResponseData.length - 1].description = `status: ${status}`;
// }

export interface OnChainThoughtThinksTypes {
  title: string;
  key: string;
  icon: "success" | "pending";
  data: string;
}

export interface OnChainThoughtChainProps {
  items: OnChainThoughtThinksTypes[];
  isEnd: boolean;
}

export const OnChainThoughtChain: FC<OnChainThoughtChainProps> = (props) => {
  const Items = (props.items || []).map((item) => {
    return {
      title: item.title,
      description: "",
      icon: getStatusIcon(item.icon),
      key: item.key,
      data: item.data,
      status: item.icon,
    };
  });

  // const [items, setItems] = React.useState<ThoughtChainItem[]>(mockServerResponseData);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [hidden, setHidden] = useState(false);
  // const [isEnd, setIsEnd] = useState(false);

  const [time, setTime] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!props.isEnd) {
        setTime((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval); // 清除定时器，防止内存泄漏
  }, [props.isEnd]);

  // const mockStatusChange = async () => {
  //   // await updateChainItem("error");
  //   // setItems([...mockServerResponseData]);
  //   await updateChainItem("pending");
  //   setItems([...mockServerResponseData]);
  //   await updateChainItem("success");
  //   setItems([...mockServerResponseData]);
  // };

  // const onClick = async () => {
  //   setLoading(true);
  //   addChainItem();
  //   setItems([...mockServerResponseData]);
  //   await mockStatusChange();
  //   setLoading(false);
  // };

  const PendingData = Items.find((v) => v.status === "pending");

  const activeContent = PendingData ? PendingData.data : Items[Items.length - 1].data;

  return (
    <div className="rounded-[15px] overflow-hidden border border-[#E0E0E0]">
      <div
        className={`h-[40px] bg-[#F4F4F5] flex items-center pl-5 pr-4 text-xs justify-between ${
          hidden ? "" : "border-b"
        } border-[#E0E0E0]`}
      >
        <div className="flex items-center">
          <Icon src={AISVG} className="w-[18px]"></Icon>
        </div>
        <div
          className="flex items-center cursor-pointer"
          onClick={() => {
            setHidden(!hidden);
          }}
        >
          <span className="mr-2">隐藏思考过程</span>{" "}
          <span>
            <Icon src={ExpandSvg} className={`w-[18px] cursor-pointer rotate-${hidden ? "180" : "90"} w-2.5`}></Icon>
          </span>
        </div>
      </div>
      <div className={`bg-[#fff] flex ${hidden ? "h-[0px]" : "h-[auto]"}`}>
        <div className="w-[160px] thought_bg border-r border-[#E0E0E0] pl-5 pb-4">
          <div className="mt-5 text-xs font-medium text-[#333333]">{`思考中...(${time}s)`}</div>
          <ThoughtChain className="mt-5" size="small" items={Items} />
        </div>
        <div className="flex-1 p-5">
          {Items.map((item, key: number) => {
            return <div key={key} style={{color: 'rgba(51,51,51,0.8)'}} className="text-xs mb-5 pl-2.5 border-[#E0E0E0] border-l">{item.data}</div>;
          })}
        </div>
      </div>
    </div>
    // <div style={{ width: 500 }}>
    //   <button onClick={onClick} style={{ marginBottom: 16 }}>
    //     {loading ? "Running" : "Run Next"}
    //   </button>
    // </div>
  );
};
