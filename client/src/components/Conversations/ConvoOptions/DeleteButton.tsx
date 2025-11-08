import React, { useCallback } from 'react';
import { QueryKeys } from 'librechat-data-provider';
import { useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner, useToastContext } from '@librechat/client';
import type { TMessage } from 'librechat-data-provider';
import { useDeleteConversationMutation } from '~/data-provider';
import { useLocalize, useNewConvo } from '~/hooks';
import { NotificationSeverity } from '~/common';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type DeleteButtonProps = {
  conversationId: string;
  retainView: () => void;
  title: string;
  showDeleteDialog?: boolean;
  setShowDeleteDialog?: (value: boolean) => void;
  triggerRef?: React.RefObject<HTMLButtonElement>;
  setMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>;
};

export function DeleteConversationDialog({
  setShowDeleteDialog,
  conversationId,
  setMenuOpen,
  retainView,
  title,
}: {
  setMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  setShowDeleteDialog: (value: boolean) => void;
  conversationId: string;
  retainView: () => void;
  title: string;
}) {
  const localize = useLocalize();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToastContext();
  const { newConversation } = useNewConvo();
  const { conversationId: currentConvoId } = useParams();

  const deleteMutation = useDeleteConversationMutation({
    onSuccess: () => {
      setShowDeleteDialog(false);
      if (currentConvoId === conversationId || currentConvoId === 'new') {
        newConversation();
        navigate('/c/new', { replace: true });
      }
      setMenuOpen?.(false);
      retainView();
    },
    onError: () => {
      showToast({
        message: localize('com_ui_convo_delete_error'),
        severity: NotificationSeverity.ERROR,
        showIcon: true,
      });
    },
  });

  const confirmDelete = useCallback(() => {
    const messages = queryClient.getQueryData<TMessage[]>([QueryKeys.messages, conversationId]);
    const thread_id = messages?.[messages.length - 1]?.thread_id;
    const endpoint = messages?.[messages.length - 1]?.endpoint;

    deleteMutation.mutate({ conversationId, thread_id, endpoint, source: 'button' });
  }, [conversationId, deleteMutation, queryClient]);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex h-[40px] items-center border-b border-[#E0E0E0] px-4 text-xs text-[#333333]">
          {localize('com_ui_delete_conversation')}
        </DialogTitle>
      </DialogHeader>

      <div className="p-4 text-xs">
        <div className="h-full px-2 py-2 text-text-primary">
          {localize('com_ui_delete_confirm')} <strong>{title}</strong>?
        </div>
      </div>

      <DialogFooter className="flex justify-end gap-4 px-4 pb-4 pt-0">
        <Button aria-label="cancel" variant="outline" onClick={() => setShowDeleteDialog(false)}>
          {localize('com_ui_cancel')}
        </Button>
        <Button variant="destructive" onClick={confirmDelete} disabled={deleteMutation.isLoading}>
          {deleteMutation.isLoading ? <Spinner /> : localize('com_ui_delete')}
        </Button>
      </DialogFooter>
    </>
  );
}

export default function DeleteButton({
  conversationId,
  retainView,
  title,
  setMenuOpen,
  showDeleteDialog,
  setShowDeleteDialog,
  triggerRef,
}: DeleteButtonProps) {
  if (showDeleteDialog === undefined || setShowDeleteDialog === undefined) {
    return null;
  }

  if (!conversationId) {
    return null;
  }

  return (
    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogContent className="w-[600px] rounded-[5px] p-0">
        <DeleteConversationDialog
          setShowDeleteDialog={setShowDeleteDialog}
          conversationId={conversationId}
          setMenuOpen={setMenuOpen}
          retainView={retainView}
          title={title}
        />
      </DialogContent>
    </Dialog>
  );
}
