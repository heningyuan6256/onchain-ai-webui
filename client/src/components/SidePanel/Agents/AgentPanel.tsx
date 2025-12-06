import { Plus } from 'lucide-react';
import React, {
  useMemo,
  useCallback,
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Button, useToastContext } from '@librechat/client';
import { useWatch, useForm, FormProvider } from 'react-hook-form';
import { useGetModelsQuery } from 'librechat-data-provider/react-query';
import {
  Tools,
  SystemRoles,
  ResourceType,
  EModelEndpoint,
  PermissionBits,
  isAssistantsEndpoint,
} from 'librechat-data-provider';
import type { AgentForm, StringOption } from '~/common';
import {
  useCreateAgentMutation,
  useUpdateAgentMutation,
  useGetAgentByIdQuery,
  useGetExpandedAgentByIdQuery,
} from '~/data-provider';
import { createProviderOption, getDefaultAgentFormValues } from '~/utils';
import { useResourcePermissions } from '~/hooks/useResourcePermissions';
import { useSelectAgent, useLocalize, useAuthContext } from '~/hooks';
import { useAgentPanelContext } from '~/Providers/AgentPanelContext';
import AgentPanelSkeleton from './AgentPanelSkeleton';
import AdvancedPanel from './Advanced/AdvancedPanel';
import { Panel, isEphemeralAgent } from '~/common';
import AgentConfig from './AgentConfig';
import AgentSelect from './AgentSelect';
import AgentFooter from './AgentFooter';
import ModelPanel from './ModelPanel';
import request from '~/request/request';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
export type AgentPanelRef = {
  submitForm: () => void;
  newquerymodel: () => any;
  setValue: (name: string, vals: Partial<FormData>) => void;
};
const AgentPanel = forwardRef<AgentPanelRef, { updatemodel }>(({ updatemodel }, ref) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const localize = useLocalize();
  const { user } = useAuthContext();
  const { showToast } = useToastContext();
  const {
    activePanel,
    agentsConfig,
    setActivePanel,
    endpointsConfig,
    setCurrentAgentId,
    agent_id: current_agent_id,
  } = useAgentPanelContext();
  const methods = useForm<AgentForm>({
    defaultValues: getDefaultAgentFormValues(),
    mode: 'onChange',
  });
  const { control, handleSubmit, reset, setValue } = methods;
  const { onSelect: onSelectAgent } = useSelectAgent();

  const [models, setModels] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setModelsLoading(true);
        const res = await request('/model/system/model/list_model?pageNum=1&pageSize=10000', {
          method: 'GET',
        });
        if (res?.code === 200) {
          setModels(res.rows || []);
        } else {
          toast.error(res?.message ?? '获取模型列表失败');
          setModels([]);
        }
      } catch (error) {
        console.error('Failed to fetch models:', error);
        toast.error('网络错误或服务不可用');
        setModels([]);
      } finally {
        setModelsLoading(false);
      }
    };

    fetchModels();
  }, []);
  const basicAgentQuery = useGetAgentByIdQuery(current_agent_id);
  const { hasPermission, isLoading: permissionsLoading } = useResourcePermissions(
    ResourceType.AGENT,
    basicAgentQuery.data?._id || '',
  );

  const canEdit = hasPermission(PermissionBits.EDIT);

  const expandedAgentQuery = useGetExpandedAgentByIdQuery(current_agent_id ?? '', {
    enabled: !isEphemeralAgent(current_agent_id) && canEdit && !permissionsLoading,
  });

  const agentQuery = canEdit && expandedAgentQuery.data ? expandedAgentQuery : basicAgentQuery;

  // const models = useMemo(() => modelsQuery.data ?? {}, [modelsQuery.data]);

  const [oriData, setOriData] = useState<any>(undefined);
  const urlParams = new URLSearchParams(window.location.search);
  const [groups, setGroups] = useState<any[]>([]);
  useEffect(() => {
    updatemodel();
  }, [oriData]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const userId = localStorage.getItem('id');

        const res = await request(
          `/v1/mcp/system/mcp/list_mcp?pageNum=1&pageSize=10000&other_id=${userId}`,
          { method: 'get' },
        );

        if (res?.code === 200 && Array.isArray(res.rows)) {
          setGroups(res.rows);
        } else {
          toast.error(res?.message ?? '请求知识库数据失败');
          setGroups([]);
        }
      } catch (error) {
        console.error(error);
        setGroups([]);
      }
    };
    fetchCategories();
  }, []);

  // const agent_id = useWatch({ control, name: 'id' });
  const [agent_id, setAgent_id] = useState(undefined);
  const provider = useWatch({ control, name: 'provider' });
  const model = useWatch({ control, name: 'model' });
  const queryAgent = async (agent_id) => {
    const res = await request('/v1/agent/system/agent/query_agent', {
      method: 'get',
      params: {
        agent_id: agent_id,
      },
    });
    if (res.code !== 200) {
      showToast({
        message: res.message,
        status: 'error',
      });
    }
    setOriData({
      name: res.rows.agent_name,
      id: res.rows.agent_id,
      description: res.rows.description,
      instructions: res.rows.prompt,
      category: res.rows.tag1,
      provider: res.rows.model_conf?.provider,
      model_parameters: res.rows.model_conf?.model_parameters,
      status: res.rows.status,
      tools_conf: res.rows.tools_conf,
      rag_conf: res.rows.rag_conf,
      agent_img: res.rows.agent_img,
    });
    const fromdata = {
      name: res.rows.agent_name,
      id: res.rows.agent_id,
      description: res.rows.description,
      instructions: res.rows.prompt,
      category: res.rows.tag1,
      provider: res.rows.model_conf?.provider,
      model_parameters: res.rows.model_conf?.model_parameters,
      model: res.rows.model_conf?.model_name,
      rag_conf: res.rows.rag_conf,
      tools_conf: res.rows.tools_conf.map((item) => item.name),
    };
    reset(fromdata);
    console.log('回显的数据', fromdata);
  };
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paramsagent_id = urlParams.get('agent_id');
    if (!paramsagent_id) {
      return;
    }
    setAgent_id(paramsagent_id);
    queryAgent(paramsagent_id);
  }, [window.location]);
  const previousVersionRef = useRef<number | undefined>();

  const allowedProviders = useMemo(
    () => new Set(agentsConfig?.allowedProviders),
    [agentsConfig?.allowedProviders],
  );

  const providers = useMemo(
    () =>
      Object.keys(endpointsConfig ?? {})
        .filter(
          (key) =>
            !isAssistantsEndpoint(key) &&
            (allowedProviders.size > 0 ? allowedProviders.has(key) : true) &&
            key !== EModelEndpoint.agents &&
            key !== EModelEndpoint.chatGPTBrowser &&
            key !== EModelEndpoint.gptPlugins,
        )
        .map((provider) => createProviderOption(provider)),
    [endpointsConfig, allowedProviders],
  );

  /* Mutations */
  const update = useUpdateAgentMutation({
    onMutate: () => {
      // Store the current version before mutation
      previousVersionRef.current = agentQuery.data?.version;
    },
    onSuccess: (data) => {
      // Check if agent version is the same (no changes were made)
      if (previousVersionRef.current !== undefined && data.version === previousVersionRef.current) {
        showToast({
          message: localize('com_ui_no_changes'),
          status: 'info',
        });
      } else {
        showToast({
          message: `${localize('com_assistants_update_success')} ${
            data.name ?? localize('com_ui_agent')
          }`,
        });
      }
      // Clear the ref after use
      previousVersionRef.current = undefined;
    },
    onError: (err) => {
      const error = err as Error;
      showToast({
        message: `${localize('com_agents_update_error')}${
          error.message ? ` ${localize('com_ui_error')}: ${error.message}` : ''
        }`,
        status: 'error',
      });
    },
  });

  const create = useCreateAgentMutation({
    onSuccess: (data) => {
      setCurrentAgentId(data.id);
      showToast({
        message: `${localize('com_assistants_create_success')} ${
          data.name ?? localize('com_ui_agent')
        }`,
      });
    },
    onError: (err) => {
      const error = err as Error;
      showToast({
        message: `${localize('com_agents_create_error')}${
          error.message ? ` ${localize('com_ui_error')}: ${error.message}` : ''
        }`,
        status: 'error',
      });
    },
  });

  const onSubmit = useCallback(
    async (data) => {
      const tools = data.tools ?? [];
      console.log('看看data', data);

      if (data.execute_code === true) {
        tools.push(Tools.execute_code);
      }
      if (data.file_search === true) {
        tools.push(Tools.file_search);
      }
      if (data.web_search === true) {
        tools.push(Tools.web_search);
      }

      const {
        name,
        artifacts,
        description,
        instructions,
        model: _model,
        model_parameters,
        provider: _provider,
        agent_ids,
        end_after_tools,
        hide_sequential_outputs,
        recursion_limit,
        category,
        support_contact,
        tools_conf,
        rag_conf,
      } = data;

      const model = _model ?? '';
      const modelobject = models.find((item) => item.model_name === model);
      const alltools = groups.flatMap((item) => item.tools);
      const globalObjectTools_conf = alltools.filter((item) => {
        return tools_conf.find((o) => {
          return o === item.name;
        });
      });
      if (agent_id) {
        const res = await request('/v1/agent/system/agent/edit_agent', {
          method: 'post',
          params: {
            agent_id: agent_id,
          },

          data: {
            ...oriData,
            agent_name: name,
            description: description,
            tools_conf: globalObjectTools_conf,
            rag_conf: rag_conf,
            prompt: instructions,
            status: '1',
            agent_img: '',
            tag1: category,
            model_conf: {
              model_parameters: model_parameters,
              model_name: modelobject?.model_name,
              base_url: modelobject?.url,
              api_key: modelobject?.apikey,
            },
            user_id: localStorage.getItem('id')!,
          },
        });
        if (res.code && res.code === 200) {
          queryAgent(agent_id);
          showToast({
            message: res.message,
            status: 'success',
          });
        } else {
          showToast({
            message: res.message,
            status: 'error',
          });
        }
        return;
      }

      if (!model) {
        return showToast({
          message: localize('com_agents_missing_provider_model'),
          status: 'error',
        });
      }
      if (!name) {
        return showToast({
          message: localize('com_agents_missing_name'),
          status: 'error',
        });
      }

      // create.mutate({
      //   name,
      //   artifacts,
      //   description,
      //   instructions,
      //   model,
      //   tools,
      //   provider,
      //   model_parameters,
      //   agent_ids,
      //   end_after_tools,
      //   hide_sequential_outputs,
      //   recursion_limit,
      //   category,
      //   support_contact,
      // });
      console.log('=============', {
        //控制创建
        name,
        artifacts,
        description,
        instructions,
        model,
        tools,
        provider,
        model_parameters,
        agent_ids,
        end_after_tools,
        hide_sequential_outputs,
        recursion_limit,
        category,
        support_contact,
      });

      const res = await request('/v1/agent/system/agent/add_agent', {
        method: 'post',
        data: {
          agent_name: name,
          description: description,
          tools_conf: globalObjectTools_conf,
          rag_conf: rag_conf,
          prompt: instructions,
          status: '1',
          agent_img: '',
          tag1: category,
          model_conf: {
            model_parameters: model_parameters,
            model_name: modelobject?.model_name,
            base_url: modelobject?.url,
            api_key: modelobject?.apikey,
          },

          user_id: localStorage.getItem('id')!,
        },
      });
      if (res.code === 200) {
        setAgent_id(res.data.agent_id);
        queryAgent(res.data.agent_id);
        setSearchParams({ agent_id: res.data.agent_id }, { replace: true });
        showToast({
          message: res.message,
          status: 'success',
        });
      } else {
        showToast({
          message: res.message,
          status: 'error',
        });
      }
    },
    [agent_id, create, update, showToast, localize],
  );

  const handleSelectAgent = useCallback(() => {
    if (agent_id) {
      onSelectAgent(agent_id);
    }
  }, [agent_id, onSelectAgent]);

  const canEditAgent = useMemo(() => {
    if (!agentQuery.data?.id) {
      return true;
    }

    if (user?.role === SystemRoles.ADMIN) {
      return true;
    }

    return canEdit;
  }, [agentQuery.data?.id, user?.role, canEdit]);
  const newquerymodel = useMemo(() => {
    return oriData;
  }, [oriData]);

  useImperativeHandle(
    ref,
    () => ({
      submitForm: handleSubmit(onSubmit),
      newquerymodel,
      setValue: (name, vals) => setValue(name, vals),
    }),
    [handleSubmit, onSubmit, setValue, newquerymodel],
  );
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ height: 'auto' }}
        className="scrollbar-gutter-stable h-auto w-full flex-shrink-0 overflow-x-hidden"
        aria-label="Agent configuration form"
      >
        {agentQuery.isInitialLoading && <AgentPanelSkeleton />}
        {!canEditAgent && !agentQuery.isInitialLoading && (
          <div className="flex h-[30vh] w-full items-center justify-center">
            <div className="text-center">
              <h2 className="text-token-text-primary m-2 text-xl font-semibold">
                {localize('com_agents_not_available')}
              </h2>
              <p className="text-token-text-secondary">{localize('com_agents_no_access')}</p>
            </div>
          </div>
        )}

        {canEditAgent && !agentQuery.isInitialLoading && activePanel === Panel.model && (
          <ModelPanel models={models} providers={providers} setActivePanel={setActivePanel} />
        )}
        {/*智能体主表单  */}
        {canEditAgent && !agentQuery.isInitialLoading && activePanel === Panel.builder && (
          <AgentConfig groups={groups} createMutation={create} />
        )}

        {/* {canEditAgent && !agentQuery.isInitialLoading && (
          <AgentFooter
            createMutation={create}
            updateMutation={update}
            activePanel={activePanel}
            setActivePanel={setActivePanel}
            setCurrentAgentId={setCurrentAgentId}
          />
        )} */}
      </form>
    </FormProvider>
  );
});
export default AgentPanel;
