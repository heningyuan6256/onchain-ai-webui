"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuHorizentol,
  SidebarMenuTitle,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import logoPNG from "../assets/image/logo.png";
import AISVG from "../assets/image/front-ai.svg";
import ADDSVG from "../assets/image/front-add.svg";
import CHATSVG from "../assets/image/front-chat.svg";
import LIBRARYSVG from "../assets/image/front-library.svg";
import SETTINGSVG from "../assets/image/front-setting.svg";
import appsSvg from "../assets/image/front-apps.svg";
import STARSVG from "../assets/image/front-lightupcollect.svg";
import Icon from "./icon";
import { useUploadData } from "@/contexts/UploadDataContext";
import { useSession } from "@/tars/common/hooks/useSession";

// This is sample data.
const data = {
  user: {
    name: "heningyuan",
    email: "hany@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    // {
    //   name: "Acme Inc",
    //   logo: GalleryVerticalEnd,
    //   plan: "Enterprise",
    // },
    // {
    //   name: "Acme Corp.",
    //   logo: AudioWaveform,
    //   plan: "Startup",
    // },
    // {
    //   name: "Evil Corp.",
    //   logo: Command,
    //   plan: "Free",
    // },
  ],
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
    },
  ],
  projects: [
    {
      name: "开启新对话",
      url: "/",
      icon: <Icon src={ADDSVG}></Icon>,
      key: "home",
    },
    {
      name: "我的对话",
      url: "/conversations",
      icon: <Icon src={CHATSVG}></Icon>,
      key: "conversations",
    },
    {
      name: "工业知识库",
      url: "",
      key: "library",
      icon: <Icon src={LIBRARYSVG}></Icon>,
    },
    {
      name: "应用广场",
      url: "application",
      icon: <Icon src={appsSvg}></Icon>,
      key: "app",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { chatData } = useUploadData();
  const { sessions } = useSession();
  // const favData = React.useMemo(() => {
  //   const data = chatData.reverse() || [];
  //   return data.filter((item: any) => item.is_favorite && item.title);
  // }, [chatData]);

  // const recentData = React.useMemo(() => {
  //   const data = chatData.reverse() || [];
  //   return data.filter((item: any) => item.title).slice(0, 10);
  // }, [chatData]);

  const { open } = useSidebar();

  const favData = sessions
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .filter((item) => item.tags && item.tags.find((item) => item === "fav"));

  console.log(favData, "favData");

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {open ? (
          <div className="flex justify-between">
            <div className="flex">
              <img className="top_logo select-none" src={logoPNG} height={16} />
              <SidebarTrigger />
            </div>

            <TeamSwitcher teams={data.teams} />
            <div>
              <SidebarTrigger />
            </div>
          </div>
        ) : (
          <Icon className="w-4.5 h-4.5" src={AISVG}></Icon>
        )}
      </SidebarHeader>
      <SidebarContent>
        {!open ? (
          <div className="px-2.5 py-1.5 overflow-hidden">
            <SidebarMenuHorizentol></SidebarMenuHorizentol>
          </div>
        ) : (
          <></>
        )}
        {/* <NavMain items={data.navMain} /> */}
        <NavProjects projects={data.projects} />
        {open ? (
          <>
            <div className="px-4">
              <SidebarMenuHorizentol></SidebarMenuHorizentol>
            </div>
            <SidebarMenuTitle
              title="收藏对话"
              data={favData.map((item) => {
                return { ...item, icon: <Icon src={STARSVG}></Icon> };
              })}
            ></SidebarMenuTitle>
            <div className="px-4">
              <SidebarMenuHorizentol></SidebarMenuHorizentol>
            </div>
            <SidebarMenuTitle
              title="近期对话"
              data={sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())}
              style={{ overflow: "hidden", flex: 1, display: "flex", flexDirection: "column" }}
            ></SidebarMenuTitle>
          </>
        ) : (
          <></>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
        <SidebarTrigger isFooter />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
