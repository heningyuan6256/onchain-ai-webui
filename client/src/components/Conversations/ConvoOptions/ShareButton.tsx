import React, { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, CopyCheck } from 'lucide-react';
import { useGetSharedLinkQuery } from 'librechat-data-provider/react-query';
import { OGDialogTemplate, Spinner, OGDialog } from '@librechat/client';
import { useLocalize, useCopyToClipboard } from '~/hooks';
import SharedLinkButton from './SharedLinkButton';
import { Button } from "@/components/ui/button"
import { cn } from '~/utils';
import store from '~/store';
import LIBRARYSVG from "@/assets/image/front-library.svg";
import {
  // Button,
  TooltipAnchor,
} from '@librechat/client';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ShareSvg from "@/assets/image/front-share.svg";
import StarSVG from "@/assets/image/front-lightupcollect.svg";
import Icon from "@/components/icon";
export default function ShareButton({
  conversationId,
  open,
  onOpenChange,
  triggerRef,
  children,
}: {
  conversationId: string;
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  triggerRef?: React.RefObject<HTMLButtonElement>;
  children?: React.ReactNode;
}) {
  const localize = useLocalize();
  const [showQR, setShowQR] = useState(false);
  const [sharedLink, setSharedLink] = useState('');
  const [isCopying, setIsCopying] = useState(false);
  const copyLink = useCopyToClipboard({ text: sharedLink });
  const latestMessage = useRecoilValue(store.latestMessageFamily(0));
  const { data: share, isLoading } = useGetSharedLinkQuery(conversationId);

  useEffect(() => {
    if (share?.shareId !== undefined) {
      const link = `${window.location.protocol}//${window.location.host}/share/${share.shareId}`;
      setSharedLink(link);
    }
  }, [share]);

  const button =
    isLoading === true ? null : (
      <SharedLinkButton
        share={share}
        conversationId={conversationId}
        targetMessageId={latestMessage?.messageId}
        setShareDialogOpen={onOpenChange}
        showQR={showQR}
        setShowQR={setShowQR}
        setSharedLink={setSharedLink}
      />
    );

  const shareId = share?.shareId ?? '';

  return (

    <Dialog>
      <DialogTrigger>
        <TooltipAnchor
          description={"分享聊天"}
          render={(props) => (
            // <Button
            //   {...props}
            //   variant="outline"
            // >
              <Icon className={"w-5 mr-5 cursor-pointer"} src={ShareSvg}></Icon>
            // </Button>/
          )}
        />

      </DialogTrigger>

      <DialogContent className="w-[600px] p-0 rounded-[5px]">
        <DialogHeader>
          <DialogTitle className="h-[40px] flex items-center px-4 text-xs text-[#333333] border-b border-[#E0E0E0]">
            分享聊天
          </DialogTitle>

        </DialogHeader>

        <div className='p-2 text-xs'>
          <div className="h-full py-2 text-text-primary px-2">
            {(() => {
              if (isLoading === true) {
                return <Spinner className="m-auto h-14 animate-spin" />;
              }

              return share?.success === true
                ? localize('com_ui_share_update_message')
                : localize('com_ui_share_create_message');
            })()}
          </div>
          <div className="relative items-center rounded-lg p-2">
            {showQR && (
              <div className="mb-4 flex flex-col items-center">
                <QRCodeSVG
                  value={sharedLink}
                  size={200}
                  marginSize={2}
                  className="rounded-2xl"
                  title={localize('com_ui_share_qr_code_description')}
                />
              </div>
            )}

            {shareId && (
              <div className="flex items-center gap-2 rounded-md bg-surface-secondary p-2">
                <div className="flex-1 break-all text-sm text-text-secondary">{sharedLink}</div>
                <Button
                  size="sm"
                  variant="outline"
                  aria-label={localize('com_ui_copy_link')}
                  onClick={() => {
                    if (isCopying) {
                      return;
                    }
                    copyLink(setIsCopying);
                  }}
                  className={cn('shrink-0', isCopying ? 'cursor-default' : '')}
                >
                  {isCopying ? <CopyCheck className="size-4" /> : <Copy className="size-4" />}
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className='px-4 pt-0 pb-4'>
          {button}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
