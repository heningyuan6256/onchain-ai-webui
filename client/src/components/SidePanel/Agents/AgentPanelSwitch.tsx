import { forwardRef, useEffect } from 'react';
import { AgentPanelProvider, useAgentPanelContext } from '~/Providers/AgentPanelContext';
import { Panel, isEphemeralAgent } from '~/common';
import VersionPanel from './Version/VersionPanel';
import { useChatContext } from '~/Providers';
import ActionsPanel from './ActionsPanel';
import AgentPanel from './AgentPanel';
import MCPPanel from './MCPPanel';
import { AgentPanelRef } from './AgentPanel';

export default forwardRef<AgentPanelRef, {}>((_, ref) => <AgentPanelSwitchWithContext ref={ref} />);

const AgentPanelSwitchWithContext = forwardRef<AgentPanelRef, {}>((_, ref) => {
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
  return <AgentPanel ref={ref} />;
});
