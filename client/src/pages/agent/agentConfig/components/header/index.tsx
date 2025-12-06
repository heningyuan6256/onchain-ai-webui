import { useMemo, useRef, useState } from 'react';
import { useMediaQuery } from '@librechat/client';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { getConfigDefaults, PermissionTypes, Permissions } from 'librechat-data-provider';
import type { ContextType } from '~/common';
import { useGetStartupConfig } from '~/data-provider';
import { useHasAccess, useLocalize } from '~/hooks';
import { useRecoilValue } from 'recoil';
import store from '~/store';
import { Image } from 'antd';

const defaultInterface = getConfigDefaults().interface;

export default function Header() {
  const { data: startupConfig } = useGetStartupConfig();
  const { navVisible, setNavVisible } = useOutletContext<ContextType>();

  const interfaceConfig = useMemo(
    () => startupConfig?.interface ?? defaultInterface,
    [startupConfig],
  );
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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

  return (
    <div
      style={{ height: 45 }}
      className="setting_title sticky top-0 z-10 flex h-14 w-full items-center justify-between overflow-hidden p-2 text-text-primary dark:bg-gray-800"
    >
      <div className="hide-scrollbar flex w-full items-center justify-between gap-2 overflow-x-auto">
        <div
          className="mx-1 flex cursor-pointer items-center gap-2"
          onClick={() => {
            const search = new URLSearchParams(searchParams);
            search.delete('agent_id');
            navigate({ pathname: '/agentlist', search: search.toString() });
          }}
        >
          <div
            className={`flex items-center gap-2 ${!isSmallScreen ? 'transition-all duration-200 ease-in-out' : ''} ${!navVisible ? 'translate-x-0 opacity-100' : 'opacity-1 pointer-events-none overflow-hidden'}`}
          >
            <div
              className="ml-2 overflow-hidden text-[18px] text-[#000000]"
              style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '700px' }}
            >
              <div
                style={{
                  fontFamily: 'PingFangSC, PingFang SC',
                  fontWeight: 600,
                  fontSize: 16,
                  lineHeight: '18px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Image
                  style={{ marginTop: 1 }}
                  src="/img/svgs/back.svg"
                  width={29}
                  height={29}
                  preview={false}
                />
                <span style={{ color: '#ababab' }}>智能体广场&nbsp;/&nbsp;</span>
                <span style={{ color: '#333333' }}>创建智能体</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div />
    </div>
  );
}
