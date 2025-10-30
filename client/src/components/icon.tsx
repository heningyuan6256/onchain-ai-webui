import { cn } from "@/lib/utils";
import { FC } from "react";
export interface IconProps {
  src: string;
  className?: string;
}
const Icon: FC<IconProps> = ({ src, className }) => {
  return <img src={src} className={cn([className, "select-none"])} style={{ userSelect: "none" }} />;
};

export default Icon;
