import React, { useEffect, useMemo, useState } from 'react';
import type { ModelSelectorProps } from '~/common';
import { ModelSelectorProvider, useModelSelectorContext } from './ModelSelectorContext';
import { ModelSelectorChatProvider, useModelSelectorChatContext } from './ModelSelectorChatContext';
import {
  renderModelSpecs,
  renderEndpoints,
  renderSearchResults,
  renderCustomGroups,
  EndpointModelItem,
} from './components';
import { getSelectedIcon, getDisplayValue } from './utils';
import { CustomMenu as Menu } from './CustomMenu';
import DialogManager from './DialogManager';
import { useLocalize } from '~/hooks';
import OpenAISVG from '@/assets/image/openai.svg';
import Icon from '~/components/icon';
import request from '~/request/request';
import { toast } from 'sonner';
import { useLocation, useParams } from 'react-router-dom';
import { dataService, QueryKeys } from 'librechat-data-provider';
import { useQueryClient } from '@tanstack/react-query';
function ModelSelectorContent({
  setHasTargetModel,
  conversation,
}: {
  setHasTargetModel: (value: any) => void;
  conversation: any;
}) {
  const localize = useLocalize();

  const {
    // LibreChat
    agentsMap,
    modelSpecs,
    mappedEndpoints,
    endpointsConfig,
    // State
    searchValue,
    searchResults,
    selectedValues,

    // Functions
    setSearchValue,
    setSelectedValues,
    // Dialog
    keyDialogOpen,
    onOpenChange,
    keyDialogEndpoint,
  } = useModelSelectorContext();
  const { model } = useModelSelectorChatContext();
  //这里指定固定为智能体专用，然后看看智能体id怎么取的传
  const { handleSelectModel } = useModelSelectorContext();
  const [workflowagentmodel, setWorkflowagentmodel] = useState<any>(undefined);
  const { conversationId } = useParams();
  const queryClient = useQueryClient();
  const [conveOriSetup, setConveOriSetup] = useState<any>(undefined);
  const getConveOriSetup = async () => {
    return await queryClient.fetchQuery([QueryKeys.conversation, conversationId], () =>
      dataService.getConversationById(conversationId as string),
    );
  };
  useEffect(() => {
    if (
      !new URLSearchParams(location.search).get('workflowId') &&
      (!conveOriSetup || conveOriSetup?.conversationId !== conversationId)
    ) {
      getConveOriSetup().then((res) => {
        setConveOriSetup(res);
      });
    }
  }, [conversationId]);
  const getWorkflowByName = async () => {
    return await request(
      `/workflow/system/workflow/list?pageNum=1&pageSize=20&name=${conveOriSetup?.model}`,
      {
        method: 'get',
      },
    );
  };
  const getWorkflow = async () => {
    return await request('/workflow/system/workflow/query', {
      method: 'get',
      params: { workflow_id: new URLSearchParams(location.search).get('workflowId') },
    });
  };
  const getBridgeList = async () => {
    return await request('/v1/openaiworkflowbridge/v1/models', {
      method: 'get',
      ignoreToken: true,
      headers: { Authorization: 'Bearer onchain' },
    });
  };
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (
      !new URLSearchParams(location.search).get('workflowId') &&
      conversationId !== conveOriSetup?.conversationId
    ) {
      return;
    }
    if (!new URLSearchParams(location.search).get('workflowId')) {
      //校验历史记录进入的model是否在后端和桥接处合法
      Promise.all([getWorkflowByName(), getBridgeList()]).then((res) => {
        if (res[0]?.code === 200 && Array.isArray(res[1]?.data)) {
          const workflow = res[0]?.rows?.find(
            (item) =>
              item.name === conveOriSetup?.model &&
              item.tags?.find((tag) => tag.name === 'n8n-openai-bridge'),
          );
          const bridge = res[1]?.data?.find((item) => item.id === conveOriSetup?.model);
          console.log('进入了校验1', workflow, bridge);

          if (workflow && bridge) {
            setWorkflowagentmodel(conveOriSetup?.model);
            setHasTargetModel(true);
          } else if (workflow) {
            setHasTargetModel(null); //代表工作流有，桥接还未同步
          } else {
            setHasTargetModel(false); //代表工作流完全不可用可能被删过
          }
        } else {
          toast.error(
            res[0]?.code === 200
              ? (res[1]?.message ?? '网络错误！')
              : (res[0]?.message ?? '网络错误！'),
          );
        }
      });

      return;
    }
    if (!new URLSearchParams(location.search).get('workflowId')) {
      setHasTargetModel(false);
      return;
    }
    //校验新工作流智能体对话的model是否在后端和桥接处合法
    Promise.all([getWorkflow(), getBridgeList()]).then((res) => {
      if (res[0]?.code === 200 && Array.isArray(res[1]?.data)) {
        const workflowName = res[0]?.data?.data?.name;
        const workflow = res[0]?.data?.data?.tags?.find((tag) => tag.name === 'n8n-openai-bridge');
        console.log('检查2', workflowName, workflow, res);

        const bridge = res[1]?.data?.find((item) => item.id === workflowName);

        if (workflow && bridge) {
          setWorkflowagentmodel(workflowName);
          setHasTargetModel(true);
        } else if (workflow) {
          setHasTargetModel(null); //代表工作流有，桥接还未同步
        } else {
          setHasTargetModel(false); //代表工作流完全不可用可能被删过
        }
      } else {
        toast.error(
          res[0]?.code === 200
            ? (res[1]?.message ?? '网络错误！')
            : (res[0]?.message ?? '网络错误！'),
        );
      }
    });
  }, [pathname, search, conversationId, conveOriSetup]);
  useEffect(() => {
    if (workflowagentmodel && model !== workflowagentmodel) {
      handleSelectModel(
        {
          hasModels: true,
          icon: {},
          label: 'n8n',
          models: [{ isGlobal: false, name: workflowagentmodel }],
          value: 'n8n',
        },
        workflowagentmodel,
      );
    }
  }, [model, mappedEndpoints, workflowagentmodel]);
  const selectedIcon = useMemo(
    () =>
      getSelectedIcon({
        mappedEndpoints: mappedEndpoints ?? [],
        selectedValues,
        modelSpecs,
        endpointsConfig,
      }),
    [mappedEndpoints, selectedValues, modelSpecs, endpointsConfig],
  );
  const selectedDisplayValue = useMemo(
    () =>
      getDisplayValue({
        localize,
        agentsMap,
        modelSpecs,
        selectedValues,
        mappedEndpoints,
      }),
    [localize, agentsMap, modelSpecs, selectedValues, mappedEndpoints],
  );

  const trigger = (
    <button
      className="item-center flex h-[24px] w-full max-w-[70vw] items-center justify-center gap-2 rounded-[12px] bg-surface-secondary text-xs hover:bg-surface-tertiary"
      aria-label={localize('com_ui_select_model')}
    >
      <span className="flex flex-grow items-center truncate text-left">
        <span>
          <Icon className="mr-2 h-3 w-3" src={OpenAISVG}></Icon>
        </span>
        {selectedDisplayValue}
      </span>
    </button>
  );
  console.log('???????????????', mappedEndpoints);

  return (
    <div className="relative flex w-full max-w-md flex-col items-center gap-2">
      <Menu
        values={selectedValues}
        onValuesChange={(values: Record<string, any>) => {
          setSelectedValues({
            endpoint: values.endpoint || '',
            model: values.model || '',
            modelSpec: values.modelSpec || '',
          });
        }}
        // onSearch={(value) => setSearchValue(value)}
        // combobox={<input placeholder={localize('com_endpoint_search_models')} />}
        input={<></>}
        trigger={trigger}
      >
        {/* {searchResults ? (
          renderSearchResults(searchResults, localize, searchValue)
        ) : (
          <> */}
        {/* Render ungrouped modelSpecs (no group field) */}
        {/* {renderModelSpecs(
          (mappedEndpoints[0].models || []).map(item => ({ ...item, ...mappedEndpoints[0], preset: {}, label: item.name })),
          selectedValues.modelSpec || '',
        )} */}
        {/* Render endpoints (will include grouped specs matching endpoint names) */}
        {/* {renderEndpoints((mappedEndpoints || []) ?? [])} */}
        {/* Render custom groups (specs with group field not matching any endpoint) */}
        {/* {renderCustomGroups(modelSpecs || [], mappedEndpoints ?? [])} */}
        {/* </>
        )} */}
        {mappedEndpoints?.flatMap((endpoint, idx) => {
          if (endpoint.value !== 'n8n') {
            return null;
          }
          return (endpoint?.models || []).map((item) => (
            <EndpointModelItem
              key={`${idx}-${item.name}`}
              modelId={item.name}
              endpoint={endpoint}
              isSelected={selectedValues.model === item.name}
            />
          ));
        })}
      </Menu>
      <DialogManager
        keyDialogOpen={keyDialogOpen}
        onOpenChange={onOpenChange}
        endpointsConfig={endpointsConfig || {}}
        keyDialogEndpoint={keyDialogEndpoint || undefined}
      />
    </div>
  );
}

export default function ModelSelector({
  setHasTargetModel,
  startupConfig,
  conversation,
}: ModelSelectorProps) {
  return (
    <ModelSelectorChatProvider>
      <ModelSelectorProvider startupConfig={startupConfig}>
        <ModelSelectorContent setHasTargetModel={setHasTargetModel} conversation={conversation} />
      </ModelSelectorProvider>
    </ModelSelectorChatProvider>
  );
}
