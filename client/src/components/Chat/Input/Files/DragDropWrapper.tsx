import { useDragHelpers } from '~/hooks';
import DragDropOverlay from '~/components/Chat/Input/Files/DragDropOverlay';
import DragDropModal from '~/components/Chat/Input/Files/DragDropModal';
import { DragDropProvider } from '~/Providers';
import { cn } from '~/utils';
import { useUpdateEffect } from 'ahooks';
import {
  EToolResources,
} from 'librechat-data-provider';
import { useMemo } from 'react';

interface DragDropWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function DragDropWrapper({ children, className }: DragDropWrapperProps) {
  const { isOver, canDrop, drop, showModal, setShowModal, draggedFiles, handleOptionSelect } =
    useDragHelpers();

  const isActive = canDrop && isOver;

  /**
   * ✅ 当用户放下文件后（showModal=true）自动执行上传逻辑
   * 不再需要点击弹窗
   */
  useUpdateEffect(() => {
    if (showModal && draggedFiles.length > 0) {
      // 你可以根据文件类型自动选择对应资源类型
      // const allImages = draggedFiles.every(f => f.type.startsWith('image/'));
      // if (allImages) {
      //   // 如果全是图片，就直接走 context 或 undefined（根据系统定义）
      //   handleOptionSelect(undefined);
      // } else {
      //   // 例如默认选择文件搜索功能
      //   handleOptionSelect(EToolResources.file_search);
      // }
      handleOptionSelect(EToolResources.context);

      // 关闭弹窗
      setShowModal(false);
    }
  }, [showModal]);

  return (
    <div ref={drop} className={cn('relative flex h-full w-full', className)}>
      {children}
      {/* 拖拽时的视觉高亮 */}
      <DragDropOverlay isActive={isActive} />
      {/* <DragDropProvider> */}
        {/* <DragDropModal
          files={draggedFiles}
          isVisible={showModal}
          setShowModal={setShowModal}
          onOptionSelect={handleOptionSelect}
        /> */}
      {/* </DragDropProvider> */}
    </div>
  );
}
