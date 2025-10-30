import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { type LLMOutputComponent } from "@llm-ui/react";
import { FC } from "react";
import { useMarkdownProcessor } from "@/hooks/use-md";

export interface RenderMardownProps {
  data: string;
  isStreaming: boolean;
}

// const RenderMardown: FC<RenderMardownProps> = (props) => {
//   const markdown = props.data;
//   return <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>;
// };

const RenderMardown: FC<RenderMardownProps> = (props) => {
  const content: any = useMarkdownProcessor(props.data);
  return <div>{content}</div>;
};

export default RenderMardown;
