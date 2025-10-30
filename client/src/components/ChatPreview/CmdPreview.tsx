import { FC, useEffect, useState } from "react";
import Icon from "../icon";
import TRASHSVG from "@/assets/image/front-trash.svg";

export interface CmdPreviewProps {
  message: Array<{ type: "cmd" | "output"; content: string }>;
}

const TYPING_SPEED = 30; // 每个字符的延迟毫秒
const LINE_DELAY = 300; // 一行结束后延迟

const CmdPreview: FC<CmdPreviewProps> = ({ message }) => {
  const [displayLines, setDisplayLines] = useState<Array<string>>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  useEffect(() => {
    if (currentLine >= message.length) return;

    const lineContent = message[currentLine].type === "cmd" ? `$ heningyuan@onchaionplm.com ~ % ${message[currentLine].content}` : `  ${message[currentLine].content}`;
    const currentDisplayed = displayLines[currentLine] || "";

    if (currentCharIndex < lineContent.length) {
      const timeout = setTimeout(() => {
        const updatedLines = [...displayLines];
        updatedLines[currentLine] = (updatedLines[currentLine] || "") + lineContent[currentCharIndex];
        setDisplayLines(updatedLines);
        setCurrentCharIndex(currentCharIndex + 1);
      }, TYPING_SPEED);
      return () => clearTimeout(timeout);
    } else {
      // 当前行打完，准备下一行
      const timeout = setTimeout(() => {
        setCurrentLine(currentLine + 1);
        setCurrentCharIndex(0);
      }, LINE_DELAY);
      return () => clearTimeout(timeout);
    }
  }, [currentCharIndex, currentLine, displayLines, message]);

  return (
    <div className="cmd_wrapper rounded-[15px] overflow-hidden flex-1 flex flex-col border border-[#E0E0E0] h-full">
      <div className="h-[40px] bg-[#F4F4F5] flex items-center text-xs text-[#333333] pl-5 pr-4 justify-between">
        <div>终端</div>
        <Icon className="w-4 cursor-pointer" src={TRASHSVG} />
      </div>

      <div
        className="cmd bg-black flex-1 text-[] py-3 px-2 font-mono text-sm leading-relaxed overflow-y-auto"
        style={{ fontFamily: "MapleMono, monospace" }}
      >
        {displayLines.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap text-xs text-[#F4F4F5] mb-1">
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CmdPreview;
