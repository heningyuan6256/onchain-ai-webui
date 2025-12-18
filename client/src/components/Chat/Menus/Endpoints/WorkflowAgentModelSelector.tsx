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

function ModelSelectorContent({
  setHasTargetModel,
}: {
  setHasTargetModel: (value: boolean) => void;
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
  useEffect(() => {
    if (
      !new URLSearchParams(location.search).get('workflowId') &&
      mappedEndpoints
        .find((item) => item.value === 'n8n')
        ?.models?.find((item) => item.name === model)
    ) {
      setWorkflowagentmodel(model);

      setHasTargetModel(true);
      return;
    }
    if (!new URLSearchParams(location.search).get('workflowId')) {
      setHasTargetModel(false);
      return;
    }

    request('/workflow/system/workflow/query', {
      method: 'get',
      params: { workflow_id: new URLSearchParams(location.search).get('workflowId') },
    }).then((res) => {
      if (res?.code === 200) {
        setWorkflowagentmodel(res?.data?.data?.name);
        setHasTargetModel(res?.data?.data?.name ? true : false);
      } else {
        toast.error(res?.message ?? '网络错误！');
      }
    });
  }, []);
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

export default function ModelSelector({ setHasTargetModel, startupConfig }: ModelSelectorProps) {
  return (
    <ModelSelectorChatProvider>
      <ModelSelectorProvider startupConfig={startupConfig}>
        <ModelSelectorContent setHasTargetModel={setHasTargetModel} />
      </ModelSelectorProvider>
    </ModelSelectorChatProvider>
  );
}
