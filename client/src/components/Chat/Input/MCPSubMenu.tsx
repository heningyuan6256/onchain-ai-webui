import React from 'react';
import * as Ariakit from '@ariakit/react';
import { ChevronRight } from 'lucide-react';
import { PinIcon, MCPIcon } from '@librechat/client';
import MCPServerStatusIcon from '~/components/MCP/MCPServerStatusIcon';
import MCPConfigDialog from '~/components/MCP/MCPConfigDialog';
import { useBadgeRowContext } from '~/Providers';
import { cn } from '~/utils';

interface MCPSubMenuProps {
  placeholder?: string;
}

const MCPSubMenu = React.forwardRef<HTMLDivElement, MCPSubMenuProps>(
  ({ placeholder, ...props }, ref) => {
    const { mcpServerManager } = useBadgeRowContext();
    const {
      isPinned,
      mcpValues,
      setIsPinned,
      isInitializing,
      placeholderText,
      configuredServers,
      getConfigDialogProps,
      toggleServerSelection,
      getServerStatusIconProps,
    } = mcpServerManager;

    const menuStore = Ariakit.useMenuStore({
      focusLoop: true,
      showTimeout: 100,
      placement: 'right',
    });

    // Don't render if no MCP servers are configured
    if (!configuredServers || configuredServers.length === 0) {
      return null;
    }

    const configDialogProps = getConfigDialogProps();

    return (
      <div ref={ref}>
        {configuredServers.map((serverName) => {
              const statusIconProps = getServerStatusIconProps(serverName);
              const isSelected = mcpValues?.includes(serverName) ?? false;
              const isServerInitializing = isInitializing(serverName);

              const statusIcon = statusIconProps && <MCPServerStatusIcon {...statusIconProps} />;

              return (
                <Ariakit.MenuItem
                  key={serverName}
                  onClick={(event) => {
                    event.preventDefault();
                    toggleServerSelection(serverName);
                  }}
                  disabled={isServerInitializing}
                  className={cn(
                    'flex items-center gap-2 rounded-lg text-text-primary hover:cursor-pointer',
                    'scroll-m-1 outline-none transition-colors',
                    'hover:bg-black/[0.075] dark:hover:bg-white/10',
                    'data-[active-item]:bg-black/[0.075] dark:data-[active-item]:bg-white/10',
                    'w-full min-w-0 justify-between text-sm',
                    isServerInitializing &&
                    'opacity-50 hover:bg-transparent dark:hover:bg-transparent',
                    // "border border-[#E0E0E0]",
                  )}
                >
                  <div className="flex flex-grow items-center gap-2">
                    <Ariakit.MenuItemCheck checked={isSelected} />
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.75rem',
                        color: '#212121',
                        fontWeight: 'normal',
                        fontStyle: 'normal',
                      }}
                    >
                      {serverName}
                    </span>
                  </div>
                  {statusIcon && <div className="ml-2 flex items-center">{statusIcon}</div>}
                </Ariakit.MenuItem>
              );
            })}
        {configDialogProps && <MCPConfigDialog {...configDialogProps} />}
      </div>
    );
  },
);

MCPSubMenu.displayName = 'MCPSubMenu';

export default React.memo(MCPSubMenu);
