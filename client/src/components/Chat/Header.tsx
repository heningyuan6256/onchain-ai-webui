import { useMemo, useRef, useState } from 'react';
import { useMediaQuery } from '@librechat/client';
import { useOutletContext } from 'react-router-dom';
import { getConfigDefaults, PermissionTypes, Permissions } from 'librechat-data-provider';
import type { ContextType } from '~/common';
import ModelSelector from './Menus/Endpoints/ModelSelector';
import { PresetsMenu, HeaderNewChat, OpenSidebar } from './Menus';
import { useGetStartupConfig } from '~/data-provider';
import ExportAndShareMenu from './ExportAndShareMenu';
import BookmarkMenu from './Menus/BookmarkMenu';
import { TemporaryChat } from './TemporaryChat';
import AddMultiConvo from './AddMultiConvo';
import { useHasAccess, useLocalize } from '~/hooks';
import { useRecoilValue } from 'recoil';
import store from '~/store';
import { ShareButton } from '~/components/Conversations/ConvoOptions';
import { Upload, Share2 } from 'lucide-react';
import ShareSvg from "@/assets/image/front-share.svg";
import StarSVG from "@/assets/image/front-lightupcollect.svg";
import Icon from "@/components/icon";

const defaultInterface = getConfigDefaults().interface;

export default function Header() {
  const { data: startupConfig } = useGetStartupConfig();
  const { navVisible, setNavVisible } = useOutletContext<ContextType>();

  const interfaceConfig = useMemo(
    () => startupConfig?.interface ?? defaultInterface,
    [startupConfig],
  );

  const hasAccessToBookmarks = useHasAccess({
    permissionType: PermissionTypes.BOOKMARKS,
    permission: Permissions.USE,
  });

  const hasAccessToMultiConvo = useHasAccess({
    permissionType: PermissionTypes.MULTI_CONVO,
    permission: Permissions.USE,
  });

  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const exportButtonRef = useRef<HTMLButtonElement>(null);
  const localize = useLocalize();
  const conversation = useRecoilValue(store.conversationByIndex(0))!;
  const [showShareDialog, setShowShareDialog] = useState(false);

  const headerButton = () => {
    return <div className='flex'>
      <ExportAndShareMenu
              isSharedButtonEnabled={startupConfig?.sharedLinksEnabled ?? false}
            />
    </div>
  }

  return (
    <div className="setting_title sticky top-0 z-10 flex h-14 w-full items-center justify-between p-2 font-semibold text-text-primary dark:bg-gray-800">
      <div className="hide-scrollbar flex w-full items-center justify-between gap-2 overflow-x-auto">
        <div className="mx-1 flex items-center gap-2">
          <div
            className={`flex items-center gap-2 ${!isSmallScreen ? 'transition-all duration-200 ease-in-out' : ''
              } ${!navVisible
                ? 'translate-x-0 opacity-100'
                : 'pointer-events-none translate-x-[-100px] opacity-0'
              }`}
          >
            <OpenSidebar setNavVisible={setNavVisible} className="max-md:hidden" />
            {/* <HeaderNewChat /> */}
          </div>
          <div
            className={`flex items-center gap-2 ${!isSmallScreen ? 'transition-all duration-200 ease-in-out' : ''
              } ${!navVisible ? 'translate-x-0' : 'translate-x-[-100px]'}`}
          >
            {/* <ModelSelector startupConfig={startupConfig} /> */}
            {/* {interfaceConfig.presets === true && interfaceConfig.modelSelect && <PresetsMenu />} */}
            {/* {hasAccessToBookmarks === true && <BookmarkMenu />} */}
            {/* {hasAccessToMultiConvo === true && <AddMultiConvo />} */}
            {/* {isSmallScreen && (
              <>
                <ExportAndShareMenu
                  isSharedButtonEnabled={startupConfig?.sharedLinksEnabled ?? false}
                />
              </>
            )} */}
            {/* <ExportModal
              open={showExports}
              onOpenChange={setShowExports}
              conversation={conversation}
              triggerRef={exportButtonRef}
              aria-label={localize('com_ui_export_convo_modal')}
            /> */}
            {/* <Share2 className="icon-md mr-2 text-text-secondary" /> */}
            {/* <ShareButton
              triggerRef={shareButtonRef}
              conversationId={conversation?.conversationId ?? ''}
              open={showShareDialog}
              onOpenChange={setShowShareDialog}
            /> */}
            {/* {headerBnutton()} */}
          </div>
        </div>
        {/* {!isSmallScreen && (
          <div className="flex items-center gap-2">
            <ExportAndShareMenu
              isSharedButtonEnabled={startupConfig?.sharedLinksEnabled ?? false}
            />
          </div>
        )} */}
        {/* <ExportModal
          open={showExports}
          onOpenChange={setShowExports}
          conversation={conversation}
          triggerRef={exportButtonRef}
          aria-label={localize('com_ui_export_convo_modal')}
        /> */}
        {headerButton()}
        {/* <Share2 className="icon-md mr-2 text-text-secondary" />
        <ShareButton
          triggerRef={shareButtonRef}
          conversationId={conversation.conversationId ?? ''}
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
        /> */}
      </div>
      {/* Empty div for spacing */}
      <div />
    </div>
  );
}
