import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Calculator, Calendar, CreditCard, Settings, Smile, User } from "lucide-react";
import { motion } from "framer-motion";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import STARSVG from "../assets/image/front-lightupcollect.svg";
import { Button } from "@/components/ui/button";
import ADDSVG from "@/assets/image/front-add.svg";
import MORESVG from "@/assets/image/front-more.svg";
import ADDWHITESVG from "@/assets/image/front-addWhite.svg";
import EDITSVG from "@/assets/image/front-edit.svg";
import TRASHSVG from "@/assets/image/front-trash.svg";
import COLLECTSVG from "@/assets/image/front-collect.svg";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Icon from "@/components/icon";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { generateSnowId } from "@/utils";
import { useUploadData } from "@/contexts/UploadDataContext";
import { toast } from "sonner";
import { useSession } from "@/tars/common/hooks/useSession";
import { useConversationsInfiniteQuery } from "~/data-provider";
import { useAuthContext, useNavScrolling } from "~/hooks";
import { Conversations } from "~/components/Conversations";
import { useRecoilState, useRecoilValue } from "recoil";
import store from '~/store';
import { ConversationListResponse } from "librechat-data-provider/dist/types";
import { InfiniteQueryObserverResult } from "@tanstack/react-query";
import { useMediaQuery } from '@librechat/client';
const formatISODate = (isoString: number) => {
  const date = new Date(isoString);

  // 你也可以改成 date.toLocaleString() 看你需要格式
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 月份从0开始
  const day = String(date.getDate()).padStart(2, "0");

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};


const conversations: FC = () => {
  const [search, setSearch] = useRecoilState(store.searchcon);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();


  const { sessions, deleteSession, updateSessionMetadata, loadSessions } = useSession();
  console.log(sessions, "sessions");
  const [tags, setTags] = useState<string[]>([]);

  const { data, fetchNextPage, isFetchingNextPage, isLoading, isFetching, refetch } =
    useConversationsInfiniteQuery(
      {
        tags: tags.length === 0 ? undefined : tags,
        search: search.debouncedQuery,
      },
      {
        enabled: isAuthenticated,
        staleTime: 30000,
        cacheTime: 300000,
      },
    );

  const conversations = useMemo(() => {
    return data ? data.pages.flatMap((page) => page.conversations) : [];
  }, [data])


  const [isSearchLoading, setIsSearchLoading] = useState(
    !!search.query && (search.isTyping || isLoading || isFetching),
  );
  const computedHasNextPage = useMemo(() => {
    if (data?.pages && data.pages.length > 0) {
      const lastPage: ConversationListResponse = data.pages[data.pages.length - 1];
      return lastPage.nextCursor !== null;
    }
    return false;
  }, [data?.pages]);
  const [showLoading, setShowLoading] = useState(false);
  const { moveToTop } = useNavScrolling<ConversationListResponse>({
    setShowLoading,
    fetchNextPage: async (options?) => {
      if (computedHasNextPage) {
        return fetchNextPage(options);
      }
      return Promise.resolve(
        {} as InfiniteQueryObserverResult<ConversationListResponse, unknown>,
      );
    },
    isFetchingNext: isFetchingNextPage,
  });

  // const toggleNavVisible = useCallback(() => {
  //   setNavVisible((prev: boolean) => {
  //     localStorage.setItem('navVisible', JSON.stringify(!prev));
  //     return !prev;
  //   });
  //   if (newUser) {
  //     setNewUser(false);
  //   }
  // }, [newUser, setNavVisible, setNewUser]);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  // const itemToggleNav = useCallback(() => {
  //   if (isSmallScreen) {
  //     toggleNavVisible();
  //   }
  // }, [isSmallScreen, toggleNavVisible]);

  const listRef = useRef<any>(null);
  const loadMoreConversations = useCallback(() => {
    if (isFetchingNextPage || !computedHasNextPage) {
      return;
    }

    fetchNextPage();
  }, [isFetchingNextPage, computedHasNextPage, fetchNextPage]);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // 清除之前的定时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    // 设置新的定时器（防抖：在用户停止输入后触发）
    timerRef.current = window.setTimeout(() => {
      setSearch(prev => ({
        ...prev,
        debouncedQuery: search.query
      }));
    }, 500);
  }, [
    search.query
  ])

  // 清理定时器（组件卸载时）
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  return (
    <div className="home_container h-full w-full flex justify-center items-center">
      <div className="w-[563px]" style={{ height: "400px" }}>
        <div className="flex justify-between">
          <div className="font-semibold text-2xl text-[#333333] mb-4 ml-6">我的对话</div>
          <div>
            <Button
              onClick={() => {
                navigate("/c/new");
              }}
              className="h-[32px] text-xs cursor-pointer"
            >
              <Icon src={ADDWHITESVG}></Icon>
              <div className="flex items-center h-full">开启新对话</div>
            </Button>
          </div>
        </div>
        <div className="mb-6">
          <CommandInput value={search.query} placeholder="搜索你想知道的" onChange={(value) => {
            setSearch(prev => ({
              ...prev,
              query: value.target.value
            }));
          }} />
        </div>
        <Conversations
          conversations={conversations.map(item => ({ ...item, desc: true }))}
          moveToTop={moveToTop}
          toggleNav={() => { }}
          containerRef={listRef}
          loadMoreConversations={loadMoreConversations}
          isLoading={isFetchingNextPage || showLoading || isLoading}
          isSearchLoading={isSearchLoading}
          desc={true}
        />
      </div>
    </div>
  );
};

export default conversations;
