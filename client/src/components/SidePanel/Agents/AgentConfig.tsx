import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useToastContext } from '@librechat/client';
import { EModelEndpoint } from 'librechat-data-provider';
import { Controller, useWatch, useFormContext } from 'react-hook-form';
import type { AgentForm, AgentPanelProps, IconComponentTypes } from '~/common';
import {
  removeFocusOutlines,
  processAgentOption,
  getEndpointField,
  defaultTextProps,
  validateEmail,
  getIconKey,
  cn,
} from '~/utils';
import { ToolSelectDialog, MCPToolSelectDialog } from '~/components/Tools';
import useAgentCapabilities from '~/hooks/Agents/useAgentCapabilities';
import { useFileMapContext, useAgentPanelContext } from '~/Providers';
import AgentCategorySelector from './AgentCategorySelector';
import Action from '~/components/SidePanel/Builder/Action';
import { useLocalize, useVisibleTools } from '~/hooks';
import { Panel, isEphemeralAgent } from '~/common';
import { useGetAgentFiles } from '~/data-provider';
import { icons } from '~/hooks/Endpoint/Icons';
import Instructions from './Instructions';
import AgentAvatar from './AgentAvatar';
import FileContext from './FileContext';
import SearchForm from './Search/Form';
import FileSearch from './FileSearch';
import Artifacts from './Artifacts';
import AgentTool from './AgentTool';
import CodeForm from './Code/Form';
import MCPTools from './MCPTools';
import AgentRagSelector from './AgentRagSelector/AgentRagSelector';
import AgentMcpSelector from './AgentMcpSelector';
import { toast } from 'sonner';
import request from '~/request/request';
import './custom.css';
const labelClass =
  "mb-2 text-token-text-primary block font-medium  text-[13px] text-[#333333] font-['PingFangSC','PingFang SC',sans-serif]";
const inputClass = cn(
  defaultTextProps,
  'flex w-full px-3 py-2 border-border-light bg-surface-secondary focus-visible:ring-2 focus-visible:ring-ring-primary',
  removeFocusOutlines,
  'h-[32px]',
);

export default function AgentConfig({ createMutation, groups }) {
  const localize = useLocalize();
  const fileMap = useFileMapContext();
  const { showToast } = useToastContext();
  const methods = useFormContext<AgentForm>();
  const [showToolDialog, setShowToolDialog] = useState(false);
  const [showMCPToolDialog, setShowMCPToolDialog] = useState(false);

  const {
    actions,
    setAction,
    regularTools,
    agentsConfig,
    startupConfig,
    mcpServersMap,
    setActivePanel,
    endpointsConfig,
  } = useAgentPanelContext();

  const {
    control,
    formState: { errors },
  } = methods;
  const provider = useWatch({ control, name: 'provider' });
  const model = useWatch({ control, name: 'model' });
  const agent = useWatch({ control, name: 'agent' });
  const tools = useWatch({ control, name: 'tools' });
  const agent_id = useWatch({ control, name: 'id' });

  const { data: agentFiles = [] } = useGetAgentFiles(agent_id);

  const {
    codeEnabled,
    toolsEnabled,
    contextEnabled,
    actionsEnabled,
    artifactsEnabled,
    webSearchEnabled,
    fileSearchEnabled,
  } = useAgentCapabilities(agentsConfig?.capabilities);

  const handleAddActions = useCallback(() => {
    if (isEphemeralAgent(agent_id)) {
      showToast({
        message: localize('com_assistants_actions_disabled'),
        status: 'warning',
      });
      return;
    }
    setActivePanel(Panel.actions);
  }, [agent_id, setActivePanel, showToast, localize]);

  const providerValue = typeof provider === 'string' ? provider : provider?.value;
  let Icon: IconComponentTypes | null | undefined;
  let endpointType: EModelEndpoint | undefined;
  let endpointIconURL: string | undefined;
  let iconKey: string | undefined;

  if (providerValue !== undefined) {
    endpointType = getEndpointField(endpointsConfig, providerValue as string, 'type');
    endpointIconURL = getEndpointField(endpointsConfig, providerValue as string, 'iconURL');
    iconKey = getIconKey({
      endpoint: providerValue as string,
      endpointsConfig,
      endpointType,
      endpointIconURL,
    });
    Icon = icons[iconKey];
  }

  const { toolIds, mcpServerNames } = useVisibleTools(tools, regularTools, mcpServersMap);

  return (
    <div>
      <div className="h-auto px-4 pt-3 dark:bg-transparent">
        {/* Avatar & Name */}
        <div className="mb-4">
          {/* 头像先不管，后面接了miniio再处理 */}
          <AgentAvatar
            agent_id={agent_id}
            createMutation={createMutation}
            avatar={agent?.['avatar'] ?? null}
          />
          <label className={'my-label'} htmlFor="name">
            {localize('com_ui_name')}
            <span className="text-red-500">*</span>
          </label>
          <Controller
            name="name"
            rules={{ required: localize('com_ui_agent_name_is_required') }}
            control={control}
            render={({ field }) => (
              <>
                <input
                  style={{ borderRadius: 5, backgroundColor: 'white' }}
                  {...field}
                  value={field.value ?? ''}
                  maxLength={256}
                  className={inputClass}
                  id="name"
                  type="text"
                  placeholder={localize('com_agents_name_placeholder')}
                  aria-label="Agent name"
                />
                <div
                  className={cn(
                    'mt-1 w-56 text-sm text-red-500',
                    errors.name ? 'visible h-auto' : 'invisible h-0',
                  )}
                >
                  {errors.name ? errors.name.message : ' '}
                </div>
              </>
            )}
          />
          <Controller
            name="id"
            control={control}
            render={({ field }) => (
              <p className="h-3 text-xs italic text-text-secondary" aria-live="polite">
                {field.value}
              </p>
            )}
          />
        </div>
        {/* Description */}
        <div className="mb-4">
          <label className={'my-label'} htmlFor="description">
            {localize('com_ui_description')}
          </label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <input
                style={{ borderRadius: 5, backgroundColor: 'white' }}
                {...field}
                value={field.value ?? ''}
                maxLength={512}
                className={inputClass}
                id="description"
                type="text"
                placeholder={localize('com_agents_description_placeholder')}
                aria-label="Agent description"
              />
            )}
          />
        </div>
        {/* Category */}
        <div className="mb-4">
          <label className={'my-label'} htmlFor="category-selector">
            {localize('com_ui_category')} <span className="text-red-500">*</span>
          </label>
          <AgentCategorySelector className="w-full" />
        </div>
        <div className="mb-4">
          <label className={'my-label'} htmlFor="category-selector">
            知识库
          </label>
          <AgentRagSelector className="w-full" />
        </div>
        <div className="mb-4">
          <label className={'my-label'} htmlFor="category-selector">
            Mcp工具
          </label>
          <AgentMcpSelector groups={groups || []} className="w-full" />
        </div>
        {/* Instructions */}
        <Instructions />
        {/* Model and Provider */}
        <div className="mb-4">
          <label className={'my-label'} htmlFor="provider">
            {localize('com_ui_model')} <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            style={{ borderRadius: 5 }}
            onClick={() => setActivePanel(Panel.model)}
            className="btn btn-neutral border-token-border-light relative h-10 w-full !bg-white font-medium"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <div className="flex w-full items-center gap-2">
              <span>{model != null && model ? model : localize('com_ui_select_model')}</span>
            </div>
          </button>
        </div>
        {/* MCP Section */}
        {/* {startupConfig?.mcpServers != null && (
          <MCPTools
            agentId={agent_id}
            mcpServerNames={mcpServerNames}
            setShowMCPToolDialog={setShowMCPToolDialog}
          />
        )} */}
        {/* Agent Tools & Actions */}

        {/* Support Contact (Optional) */}
      </div>
      <ToolSelectDialog
        isOpen={showToolDialog}
        setIsOpen={setShowToolDialog}
        endpoint={EModelEndpoint.agents}
      />
      {startupConfig?.mcpServers != null && (
        <MCPToolSelectDialog
          agentId={agent_id}
          isOpen={showMCPToolDialog}
          mcpServerNames={mcpServerNames}
          setIsOpen={setShowMCPToolDialog}
          endpoint={EModelEndpoint.agents}
        />
      )}
    </div>
  );
}
