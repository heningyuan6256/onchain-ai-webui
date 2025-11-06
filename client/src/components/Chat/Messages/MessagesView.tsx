import { useEffect, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import { useRecoilValue } from 'recoil';
import { CSSTransition } from 'react-transition-group';
import type { TMessage } from 'librechat-data-provider';
import { useScreenshot, useMessageScrolling, useLocalize } from '~/hooks';
import ScrollToBottom from '~/components/Messages/ScrollToBottom';
import { MessagesViewProvider } from '~/Providers';
import { fontSizeAtom } from '~/store/fontSize';
import MultiMessage from './MultiMessage';
import { cn } from '~/utils';
import store from '~/store';
import { useReactive } from 'ahooks';
import { Tooltip } from 'antd';

function MessagesViewContent({
  messagesTree: _messagesTree,
}: {
  messagesTree?: TMessage[] | null;
}) {
  const localize = useLocalize();
  const fontSize = useAtomValue(fontSizeAtom);
  const { screenshotTargetRef } = useScreenshot();
  const scrollButtonPreference = useRecoilValue(store.showScrollButton);
  const [currentEditId, setCurrentEditId] = useState<number | string | null>(-1);
  const quequetotal = useReactive({
    inline: 0,
    inque: 0,
  });
  const wrapRef = useRef(null);
  useEffect(() => {
    const getqueue = async () => {
      const requestOptions: RequestInit = {
        method: 'get',
        redirect: 'follow',
      };

      fetch(`/model/system/model/list_model_queue?model_ids=qwen3-32b`, requestOptions).then(
        (res) => {
          res.json().then(({ data }) => {
            const safeParse = (str) => Number(str?.split('} ')?.pop()?.trim());
            quequetotal.inline = safeParse(data[0]) + safeParse(data[1]);
            quequetotal.inque = safeParse(data[1]);
            console.log('排队结果', quequetotal);
          });
        },
      );
    };
    getqueue();
    const id = setInterval(() => {
      getqueue();
    }, 10000);
    return () => clearInterval(id);
  }, []);

  const {
    conversation,
    scrollableRef,
    messagesEndRef,
    showScrollButton,
    handleSmoothToRef,
    debouncedHandleScroll,
  } = useMessageScrolling(_messagesTree);

  const { conversationId } = conversation ?? {};

  return (
    <>
      <div ref={wrapRef} className="relative flex flex-1 overflow-hidden overflow-y-auto">
        <div className="relative h-full flex-1">
          <Tooltip title="排队人数" color="#fff" getPopupContainer={() => wrapRef.current}>
            <div className="absolute right-8 top-0 z-10 mr-3 mt-3 flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-xs font-medium text-red-600">{quequetotal.inque}</span>
            </div>
          </Tooltip>

          <Tooltip title="在线人数" color="#fff" getPopupContainer={() => wrapRef.current}>
            <div className="absolute right-8 top-4 z-10 mr-3 mt-3 flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-green-600">{quequetotal.inline}</span>
            </div>
          </Tooltip>

          <div
            className="scrollbar-gutter-stable h-full overflow-y-auto"
            onScroll={debouncedHandleScroll}
            ref={scrollableRef}
            style={{ paddingTop: 10 }}
          >
            <div className="flex flex-col pb-9 dark:bg-transparent">
              {(_messagesTree && _messagesTree.length === 0) || _messagesTree === null ? (
                <div
                  className={cn(
                    'flex w-full items-center justify-center p-3 text-text-secondary',
                    fontSize,
                  )}
                >
                  {localize('com_ui_nothing_found')}
                </div>
              ) : (
                <div ref={screenshotTargetRef}>
                  <MultiMessage
                    key={conversationId}
                    messagesTree={_messagesTree}
                    messageId={conversationId ?? null}
                    setCurrentEditId={setCurrentEditId}
                    currentEditId={currentEditId ?? null}
                  />
                </div>
              )}
              <div
                id="messages-end"
                className="group h-0 w-full flex-shrink-0"
                ref={messagesEndRef}
              />
            </div>
          </div>
          <CSSTransition
            in={showScrollButton && scrollButtonPreference}
            timeout={{ enter: 550, exit: 700 }}
            classNames="scroll-animation"
            unmountOnExit
            appear
          >
            <ScrollToBottom scrollHandler={handleSmoothToRef} />
          </CSSTransition>
        </div>
      </div>
    </>
  );
}

export default function MessagesView({ messagesTree }: { messagesTree?: TMessage[] | null }) {
  return (
    <MessagesViewProvider>
      <MessagesViewContent messagesTree={messagesTree} />
    </MessagesViewProvider>
  );
}
