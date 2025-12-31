import { forwardRef, useEffect } from 'react';
import { AgentPanelProvider, useAgentPanelContext } from '~/Providers/AgentPanelContext';
import { Panel, isEphemeralAgent } from '~/common';
import VersionPanel from './Version/VersionPanel';
import { useChatContext } from '~/Providers';
import ActionsPanel from './ActionsPanel';
import AgentPanel from './AgentPanel';
import MCPPanel from './MCPPanel';
import { AgentPanelRef } from './AgentPanel';

export default forwardRef<AgentPanelRef, { updatemodel?: (data: any) => void }>(
  ({ updatemodel }, ref) => <AgentPanelSwitchWithContext ref={ref} updatemodel={updatemodel} />,
);
const AgentPanelSwitchWithContext = forwardRef<
  AgentPanelRef,
  { updatemodel?: (data: any) => void }
>(({ updatemodel }, ref) => {
  const { conversation } = useChatContext();
  const { activePanel, setCurrentAgentId } = useAgentPanelContext();

  useEffect(() => {
    const agent_id = conversation?.agent_id ?? '';
    if (!isEphemeralAgent(agent_id)) {
      setCurrentAgentId(agent_id);
    }
  }, [setCurrentAgentId, conversation?.agent_id]);

  if (activePanel === Panel.actions) {
    return <ActionsPanel />;
  }
  if (activePanel === Panel.version) {
    return <VersionPanel />;
  }
  if (activePanel === Panel.mcp) {
    return <MCPPanel />;
  }
  return <AgentPanel ref={ref} updatemodel={updatemodel} />;
});
