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
import { Constants } from 'librechat-data-provider';
import startSvg from '@/assets/image/front-lightupcollect.svg';
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
import {
  useLocalize,
  useHasAccess,
  useAuthContext,
  useLocalStorage,
  useNavScrolling,
  useNavigateToConvo,
} from '~/hooks';
import Icon from "./icon";
import type { InfiniteQueryObserverResult } from '@tanstack/react-query';
import { useUploadData } from "@/contexts/UploadDataContext";
import { useSession } from "@/tars/common/hooks/useSession";
import { useCallback, useEffect, useState, useMemo, memo, lazy, Suspense, useRef } from 'react';
import { NewChat, SearchBar } from "./Nav";
import store from '~/store';
import { useParams } from "react-router-dom";
import { TooltipAnchor, useMediaQuery, MobileSidebar } from '@librechat/client';
import { ConversationListParams, ConversationListResponse, Permissions, PermissionTypes } from 'librechat-data-provider';
import { useConversationsInfiniteQuery } from "~/data-provider";
import { useRecoilValue } from "recoil";
import { Button } from "./ui/button";
import Restract from "./Icons/restract";
import AccountSettings from "./Nav/AccountSettings";
import { Conversations } from "./Conversations";
const NavMask = memo(
  ({ navVisible, toggleNavVisible }: { navVisible: boolean; toggleNavVisible: () => void }) => (
    <div
      id="mobile-nav-mask-toggle"
      role="button"
      tabIndex={0}
      className={`nav-mask transition-opacity duration-200 ease-in-out ${navVisible ? 'active opacity-100' : 'opacity-0'}`}
      onClick={toggleNavVisible}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          toggleNavVisible();
        }
      }}
      aria-label="Toggle navigation"
    />
  ),
);

const NAV_WIDTH_DESKTOP = '254px';
const NAV_WIDTH_MOBILE = '320px';

const MemoNewChat = memo(NewChat);



export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const open = !!props.navVisible
  const navVisible = !!props.navVisible
  const setNavVisible = props.setNavVisible

  console.log(navVisible, 'navVisible');



  const localize = useLocalize();
  const { isAuthenticated } = useAuthContext();

  const DEFAULT_PARAMS: ConversationListParams = {
    isArchived: true,
    sortBy: 'createdAt',
    sortDirection: 'desc',
    search: '',
  };

  const { data: dataFav } =
    useConversationsInfiniteQuery(DEFAULT_PARAMS, {
      staleTime: 0,
      cacheTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    });

  const favData = dataFav?.pages?.[0]?.conversations || []

  const [navWidth, setNavWidth] = useState(NAV_WIDTH_DESKTOP);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const [newUser, setNewUser] = useLocalStorage('newUser', true);
  const [showLoading, setShowLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  const hasAccessToBookmarks = useHasAccess({
    permissionType: PermissionTypes.BOOKMARKS,
    permission: Permissions.USE,
  });

  const search = useRecoilValue(store.search);

  const { data, fetchNextPage, isFetchingNextPage, isLoading, isFetching, refetch } =
    useConversationsInfiniteQuery(
      {
        tags: tags.length === 0 ? undefined : tags,
        search: search.debouncedQuery || undefined,
      },
      {
        enabled: isAuthenticated,
        staleTime: 30000,
        cacheTime: 300000,
      },
    );

  const computedHasNextPage = useMemo(() => {
    if (data?.pages && data.pages.length > 0) {
      const lastPage: ConversationListResponse = data.pages[data.pages.length - 1];
      return lastPage.nextCursor !== null;
    }
    return false;
  }, [data?.pages]);

  const outerContainerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<any>(null);

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

  const conversations = useMemo(() => {
    return data ? data.pages.flatMap((page) => page.conversations) : [];
  }, [data]);

  const toggleNavVisible = useCallback(() => {
    setNavVisible((prev: boolean) => {
      localStorage.setItem('navVisible', JSON.stringify(!prev));
      return !prev;
    });
    if (newUser) {
      setNewUser(false);
    }
  }, [newUser, setNavVisible, setNewUser]);

  const itemToggleNav = useCallback(() => {
    if (isSmallScreen) {
      toggleNavVisible();
    }
  }, [isSmallScreen, toggleNavVisible]);

  useEffect(() => {
    if (isSmallScreen) {
      const savedNavVisible = localStorage.getItem('navVisible');
      if (savedNavVisible === null) {
        toggleNavVisible();
      }
      setNavWidth(NAV_WIDTH_MOBILE);
    } else {
      setNavWidth(NAV_WIDTH_DESKTOP);
    }
  }, [isSmallScreen, toggleNavVisible]);

  useEffect(() => {
    refetch();
  }, [tags, refetch]);

  const loadMoreConversations = useCallback(() => {
    if (isFetchingNextPage || !computedHasNextPage) {
      return;
    }

    fetchNextPage();
  }, [isFetchingNextPage, computedHasNextPage, fetchNextPage]);

  const subHeaders = useMemo(
    () => search.enabled === true && <SearchBar isSmallScreen={isSmallScreen} />,
    [search.enabled, isSmallScreen],
  );

  const headerButtons = useMemo(
    () => (
      <>
        <Suspense fallback={null}>
          {/* <AgentMarketplaceButton isSmallScreen={isSmallScreen} toggleNav={toggleNavVisible} /> */}
        </Suspense>
        {hasAccessToBookmarks && (
          <>
            <div className="mt-1.5" />
            <Suspense fallback={null}>
              {/* <BookmarkNav tags={tags} setTags={setTags} isSmallScreen={isSmallScreen} /> */}
            </Suspense>
          </>
        )}
      </>
    ),
    [hasAccessToBookmarks, tags, isSmallScreen, toggleNavVisible],
  );

  const [isSearchLoading, setIsSearchLoading] = useState(
    !!search.query && (search.isTyping || isLoading || isFetching),
  );

  useEffect(() => {
    if (search.isTyping) {
      setIsSearchLoading(true);
    } else if (!isLoading && !isFetching) {
      setIsSearchLoading(false);
    } else if (!!search.query && (isLoading || isFetching)) {
      setIsSearchLoading(true);
    }
  }, [search.query, search.isTyping, isLoading, isFetching]);

  const params = useParams()
  const currentConvoId = useMemo(() => params.conversationId, [params.conversationId]);

  const { navigateToConvo } = useNavigateToConvo();
  return (
    <Sidebar collapsible="icon" className={`bg-nav-bar ${open ? "w-[240px]" : "w-[48px]"}`} {...props}>
      <SidebarHeader navVisible={navVisible}>
        {open ? (
          <div className="flex justify-between">
            <div className="flex items-center">
              <img className="top_logo select-none" src={logoPNG} height={16} />
              {/* <SidebarTrigger /> */}
            </div>

            {/* <TeamSwitcher teams={data.teams} /> */}
            <div>
              <SidebarTrigger  {...props} />
            </div>
          </div>
        ) : (
          <Icon className="w-4.5 h-4.5 max-w-4.5" src={AISVG}></Icon>
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
        <nav
          id="chat-history-nav"
          aria-label={localize('com_ui_chat_history')}
          className={`flex h-full flex-col ${open ? "px-2 pb-3.5 pt-1 md:px-3" : 'p-0'}`}
        >
          <div className="flex flex-1 flex-col" ref={outerContainerRef}>
            {/* <div className="py-4 px-1 flex justify-between items-center">
              <img className="top_logo select-none" src={"/assets/logo.png"} height={16} />
              <div className='flex items-center'>
                <TooltipAnchor
                  description={localize('com_nav_close_sidebar')}
                  render={
                    <Button
                      size="icon"
                      variant="outline"
                      data-testid="close-sidebar-button"
                      aria-label={localize('com_nav_close_sidebar')}
                      className="rotate-[180deg] rounded-full border-none bg-transparent hover:bg-surface-hover md:rounded-xl h-[24px] w-[24px]"
                      onClick={toggleNavVisible}
                    >
                      <Restract className="max-md:hidden" />
                      <MobileSidebar className="m-1 inline-flex size-10 items-center justify-center md:hidden" />
                    </Button>
                  }
                />
              </div>
            </div> */}

            <MemoNewChat
              // subHeaders={subHeaders}
              toggleNav={toggleNavVisible}
              headerButtons={headerButtons}
              isSmallScreen={isSmallScreen}
            />

            {
              navVisible && <div className="px-1 mb-2 mt-2">
                <SidebarMenuHorizentol></SidebarMenuHorizentol>
              </div>
            }

            {
              navVisible && <>
                <SidebarMenuTitle
                  title="收藏对话"
                  data={favData.map((item) => {
                    return {
                      ...item, icon: <Icon src={startSvg}></Icon>, name: item.title, onClick: (ctrlOrMetaKey: boolean) => {
                        // if (ctrlOrMetaKey) {
                        //   itemToggleNav();
                        //   const baseUrl = window.location.origin;
                        //   const path = `/c/${item.conversationId}`;
                        //   window.open(baseUrl + path, '_blank');
                        //   return;
                        // }

                        if (currentConvoId === item.conversationId) {
                          return;
                        }

                        itemToggleNav();

                        if (typeof item.title === 'string' && item.title.length > 0) {
                          document.title = item.title;
                        }

                        navigateToConvo(item, {
                          currentConvoId,
                          resetLatestMessage: !(item.conversationId ?? '') || item.conversationId === Constants.NEW_CONVO,
                        });
                      }
                    };
                  }) as any}
                ></SidebarMenuTitle>
                <div className="px-1 mb-2 mt-2">
                  <SidebarMenuHorizentol></SidebarMenuHorizentol>
                </div>
                <SidebarMenuTitle
                  title="近期对话"
                  data={[]}
                ></SidebarMenuTitle>
                <Conversations
                  conversations={conversations}
                  moveToTop={moveToTop}
                  toggleNav={itemToggleNav}
                  containerRef={listRef}
                  loadMoreConversations={loadMoreConversations}
                  isLoading={isFetchingNextPage || showLoading || isLoading}
                  isSearchLoading={isSearchLoading}
                />
              </>
            }

          </div>
          {
            navVisible && <Suspense fallback={null}>
              <AccountSettings />
            </Suspense>
          }

        </nav>
      </SidebarContent>
      {
        !navVisible && <SidebarFooter>
          <SidebarTrigger {...props} isFooter />
        </SidebarFooter>
      }
      <SidebarRail />
    </Sidebar>
  );
}
