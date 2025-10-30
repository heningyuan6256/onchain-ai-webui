import { memo, useMemo } from 'react';
import { ContentTypes } from 'librechat-data-provider';
import { ThinkingContent } from '~/components/Artifacts/Thinking';
import { useMessageContext } from '~/Providers';
import { cn } from '~/utils';
import { OnChainThoughtChain } from '~/components/ChatView/ThoughtChain';

type ReasoningProps = {
  reasoning: string;
  isSubmitting?: boolean
};

const Reasoning = memo(({ reasoning, isSubmitting }: ReasoningProps) => {
  const { isExpanded, nextType } = useMessageContext();
  const reasoningText = useMemo(() => {
    return reasoning
      .replace(/^<think>\s*/, '')
      .replace(/\s*<\/think>$/, '')
      .trim();
  }, [reasoning]);

  if (!reasoningText) {
    return null;
  }

  const result = reasoningText
    .split(/\n+/) // 按段落或换行分割
    .filter(line => line.trim() !== '') // 去掉空行
    .map((line, index) => ({
      title: `过程节点 ${index + 1}`,
      key: `p${index + 1}`,
      data: line.trim(),
      icon: 'success'
    })) as any;

  return (
    <div
      className={cn(
        'grid transition-all duration-300 ease-out',
        nextType !== ContentTypes.THINK && isExpanded && 'mb-8',
      )}
      style={{
        gridTemplateRows: isExpanded ? '1fr' : '0fr',
      }}
    >
      <div className="overflow-hidden thought_table">
        <OnChainThoughtChain items={result} isEnd={!isSubmitting}></OnChainThoughtChain>
        {/* <ThinkingContent isPart={true}>{reasoningText}</ThinkingContent> */}
      </div>
    </div>
  );
});

export default Reasoning;
