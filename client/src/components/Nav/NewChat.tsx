import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys, Constants } from 'librechat-data-provider';
import { TooltipAnchor, NewChatIcon, MobileSidebar, Sidebar, Button } from '@librechat/client';
import type { TMessage } from 'librechat-data-provider';
import { useLocalize, useNewConvo } from '~/hooks';
import { clearMessagesCache } from '~/utils';
import store from '~/store';
import { NavProjects } from '../nav-projects';
import ADDSVG from "@/assets/image/front-add.svg";
import CHATSVG from "@/assets/image/front-chat.svg";
import appsSvg from "@/assets/image/front-apps.svg";
import LIBRARYSVG from "@/assets/image/front-library.svg";
import Icon from '../icon';

export default function NewChat({
  index = 0,
  toggleNav,
  subHeaders,
  isSmallScreen,
  headerButtons,
}: {
  index?: number;
  toggleNav: () => void;
  isSmallScreen?: boolean;
  subHeaders?: React.ReactNode;
  headerButtons?: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  /** Note: this component needs an explicit index passed if using more than one */
  const { newConversation: newConvo } = useNewConvo(index);
  const navigate = useNavigate();
  const localize = useLocalize();
  const { conversation } = store.useCreateConversationAtom(index);

  const clickHandler: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      if (e.button === 0 && (e.ctrlKey || e.metaKey)) {
        window.open('/c/new', '_blank');
        return;
      }
      clearMessagesCache(queryClient, conversation?.conversationId);
      queryClient.invalidateQueries([QueryKeys.messages]);
      newConvo();
      navigate('/c/new', { state: { focusChat: true } });
      if (isSmallScreen) {
        toggleNav();
      }
    },
    [queryClient, conversation, newConvo, navigate, toggleNav, isSmallScreen],
  );




  return (
    <>
      <div className="flex items-center justify-between py-[16px]">
        {/* <TooltipAnchor
          description={localize('com_nav_close_sidebar')}
          render={
            <Button
              size="icon"
              variant="outline"
              data-testid="close-sidebar-button"
              aria-label={localize('com_nav_close_sidebar')}
              className="rounded-full border-none bg-transparent p-2 hover:bg-surface-hover md:rounded-xl"
              onClick={toggleNav}
            >
              <Sidebar className="max-md:hidden" />
              <MobileSidebar className="m-1 inline-flex size-10 items-center justify-center md:hidden" />
            </Button>
          }
        /> */}
        <div className="flex gap-0.5 flex-col w-full">
          {headerButtons}

          <NavProjects projects={[
            {
              name: "开启新对话",
              url: "/",
              icon: <Icon src={ADDSVG}></Icon>,
              key: "home",
              onClick: clickHandler
            },
            {
              name: "我的对话",
              url: "/conversations",
              icon: <Icon src={CHATSVG}></Icon>,
              key: "conversations",
              onClick: () => {
                navigate("/conversations")
              }
            },
            {
              name: "工业知识库",
              url: "",
              key: "library",
              icon: <Icon src={LIBRARYSVG}></Icon>,
              onClick: () => {}
            },
            {
              name: "应用广场",
              url: "application",
              icon: <Icon src={appsSvg}></Icon>,
              key: "app",
              onClick: () => {
                navigate("/application")
              }
            },
          ]} />

          {/* <TooltipAnchor
            description={localize('com_ui_new_chat')}
            render={
              <Button
                size="icon"
                variant="outline"
                data-testid="nav-new-chat-button"
                aria-label={localize('com_ui_new_chat')}
                className="rounded-full border-none bg-transparent p-2 hover:bg-surface-hover md:rounded-xl"
                onClick={clickHandler}
              >
                <NewChatIcon className="icon-lg text-text-primary" />
              </Button>
            }
          /> */}
        </div>
      </div>
      {subHeaders != null ? subHeaders : null}
    </>
  );
}
