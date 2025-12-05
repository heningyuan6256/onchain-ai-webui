import React, { useMemo, useEffect } from 'react';
import keyBy from 'lodash/keyBy';
import { ControlCombobox } from '@librechat/client';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import { useFormContext, useWatch, Controller } from 'react-hook-form';
import { componentMapping } from '~/components/SidePanel/Parameters/components';
import {
  alternateName,
  getSettingsKeys,
  LocalStorageKeys,
  SettingDefinition,
  agentParamSettings,
} from 'librechat-data-provider';
import type * as t from 'librechat-data-provider';
import type { AgentForm, AgentModelPanelProps, StringOption } from '~/common';
import { useGetEndpointsQuery } from '~/data-provider';
import { getEndpointField, cn } from '~/utils';
import { useLocalize } from '~/hooks';
import { Panel } from '~/common';

export default function ModelPanel({
  setActivePanel,
  models,
}: Pick<AgentModelPanelProps, 'models' | 'providers' | 'setActivePanel'>) {
  const localize = useLocalize();

  const { control, setValue } = useFormContext<AgentForm>();
  const model = useWatch({ control, name: 'model' });
  const providerOption = useWatch({ control, name: 'provider' });
  const modelParameters = useWatch({ control, name: 'model_parameters' });

  useEffect(() => {
    const _model = model ?? '';
    if (_model) {
      localStorage.setItem(LocalStorageKeys.LAST_AGENT_MODEL, _model);
    }
  }, [models, setValue, model]);

  const { data: endpointsConfig = {} } = useGetEndpointsQuery();

  const parameters = useMemo((): SettingDefinition[] => {
    return [
      {
        key: 'maxContextTokens',
        label: 'com_endpoint_context_tokens',
        labelCode: true,
        type: 'number',
        component: 'input',
        placeholder: 'com_nav_theme_system',
        placeholderCode: true,
        description: 'com_endpoint_context_info',
        descriptionCode: true,
        optionType: 'model',
      },
      {
        key: 'max_tokens',
        label: 'com_endpoint_max_output_tokens',
        labelCode: true,
        type: 'number',
        component: 'input',
        description: 'com_endpoint_openai_max_tokens',
        descriptionCode: true,
        placeholder: 'com_nav_theme_system',
        placeholderCode: true,
        optionType: 'model',
      },
      {
        key: 'fileTokenLimit',
        label: 'com_ui_file_token_limit',
        labelCode: true,
        description: 'com_ui_file_token_limit_desc',
        descriptionCode: true,
        placeholder: 'com_nav_theme_system',
        placeholderCode: true,
        type: 'number',
        component: 'input',
      },
      {
        key: 'temperature',
        label: 'com_endpoint_temperature',
        labelCode: true,
        description: 'com_endpoint_openai_temp',
        descriptionCode: true,
        type: 'number',
        component: 'slider',
        optionType: 'model',
        columnSpan: 4,
        default: 1,
        range: {
          min: 0,
          max: 2,
          step: 0.01,
        },
      },

      {
        key: 'top_p',
        label: 'com_endpoint_top_p',
        labelCode: true,
        description: 'com_endpoint_anthropic_topp',
        descriptionCode: true,
        type: 'number',
        component: 'slider',
        optionType: 'model',
        columnSpan: 4,
        default: 1,
        range: {
          min: 0,
          max: 1,
          step: 0.01,
        },
      },
      {
        key: 'frequency_penalty',
        label: 'com_endpoint_frequency_penalty',
        labelCode: true,
        description: 'com_endpoint_openai_freq',
        descriptionCode: true,
        type: 'number',
        default: 0,
        range: {
          min: -2,
          max: 2,
          step: 0.01,
        },
        component: 'slider',
        optionType: 'model',
        columnSpan: 4,
      },
      {
        key: 'presence_penalty',
        label: 'com_endpoint_presence_penalty',
        labelCode: true,
        description: 'com_endpoint_openai_pres',
        descriptionCode: true,
        type: 'number',
        default: 0,
        range: {
          min: -2,
          max: 2,
          step: 0.01,
        },
        component: 'slider',
        optionType: 'model',
        columnSpan: 4,
      },
      {
        key: 'resendFiles',
        label: 'com_endpoint_plug_resend_files',
        labelCode: true,
        description: 'com_endpoint_openai_resend_files',
        descriptionCode: true,
        type: 'boolean',
        default: true,
        component: 'switch',
        optionType: 'conversation',
        showDefault: false,
        columnSpan: 2,
      },
      {
        key: 'imageDetail',
        label: 'com_endpoint_plug_image_detail',
        labelCode: true,
        description: 'com_endpoint_openai_detail',
        descriptionCode: true,
        type: 'enum',
        default: 'auto',
        component: 'slider',
        options: ['low', 'auto', 'high'],
        enumMappings: {
          low: 'com_ui_low',
          auto: 'com_ui_auto',
          high: 'com_ui_high',
        },
        optionType: 'conversation',
        columnSpan: 2,
      },
      {
        key: 'reasoning_effort',
        label: 'com_endpoint_reasoning_effort',
        labelCode: true,
        description: 'com_endpoint_openai_reasoning_effort',
        descriptionCode: true,
        type: 'enum',
        default: '',
        component: 'slider',
        options: ['', 'minimal', 'low', 'medium', 'high'],
        enumMappings: {
          '': 'com_ui_none',
          minimal: 'com_ui_minimal',
          low: 'com_ui_low',
          medium: 'com_ui_medium',
          high: 'com_ui_high',
        },
        optionType: 'model',
        columnSpan: 4,
      },
      {
        key: 'reasoning_summary',
        label: 'com_endpoint_reasoning_summary',
        labelCode: true,
        description: 'com_endpoint_openai_reasoning_summary',
        descriptionCode: true,
        type: 'enum',
        default: '',
        component: 'slider',
        options: ['', 'auto', 'concise', 'detailed'],
        enumMappings: {
          '': 'com_ui_none',
          auto: 'com_ui_auto',
          concise: 'com_ui_concise',
          detailed: 'com_ui_detailed',
        },
        optionType: 'model',
        columnSpan: 4,
      },
      {
        key: 'verbosity',
        label: 'com_endpoint_verbosity',
        labelCode: true,
        description: 'com_endpoint_openai_verbosity',
        descriptionCode: true,
        type: 'enum',
        default: '',
        component: 'slider',
        options: ['', 'low', 'medium', 'high'],
        enumMappings: {
          '': 'com_ui_none',
          low: 'com_ui_low',
          medium: 'com_ui_medium',
          high: 'com_ui_high',
        },
        optionType: 'model',
        columnSpan: 4,
      },
      {
        key: 'useResponsesApi',
        label: 'com_endpoint_use_responses_api',
        labelCode: true,
        description: 'com_endpoint_openai_use_responses_api',
        descriptionCode: true,
        type: 'boolean',
        default: false,
        component: 'switch',
        optionType: 'model',
        showDefault: false,
        columnSpan: 2,
      },
      {
        key: 'web_search',
        label: 'com_ui_web_search',
        labelCode: true,
        description: 'com_endpoint_openai_use_web_search',
        descriptionCode: true,
        type: 'boolean',
        default: false,
        component: 'switch',
        optionType: 'model',
        showDefault: false,
        columnSpan: 2,
      },
      {
        key: 'disableStreaming',
        label: 'com_endpoint_disable_streaming_label',
        labelCode: true,
        description: 'com_endpoint_disable_streaming',
        descriptionCode: true,
        type: 'boolean',
        default: false,
        component: 'switch',
        optionType: 'model',
        showDefault: false,
        columnSpan: 2,
      },
    ];
  }, []);

  const setOption = (optionKey: keyof t.AgentModelParameters) => (value: t.AgentParameterValue) => {
    setValue(`model_parameters.${optionKey}`, value);
  };

  const handleResetParameters = () => {
    setValue('model_parameters', {} as t.AgentModelParameters);
  };

  return (
    <div className="mx-1 mb-1 flex h-full min-h-[50vh] w-full flex-col gap-2 text-sm">
      <div className="model-panel relative flex flex-col items-center px-16 py-4 text-center">
        <div className="absolute left-0 top-4">
          <button
            type="button"
            className="btn btn-neutral relative"
            onClick={() => {
              setActivePanel(Panel.builder);
            }}
            aria-label={localize('com_ui_back_to_builder')}
          >
            <div className="model-panel-content flex w-full items-center justify-center gap-2">
              <ChevronLeft />
            </div>
          </button>
        </div>

        <div className="mb-2 mt-2 text-xl font-medium">{localize('com_ui_model_parameters')}</div>
      </div>
      <div className="p-2 pb-0">
        {/* Model */}
        <div className="model-panel-section">
          <label
            id="model-label"
            className={cn(
              'text-token-text-primary model-panel-label mb-2 block !text-[13px] font-medium',
              "font-['PingFangSC_PingFang_SC_sans-serif']",
            )}
            htmlFor="model"
          >
            {localize('com_ui_model')} <span className="text-red-500">*</span>
          </label>
          <Controller
            name="model"
            control={control}
            rules={{ required: true, minLength: 1 }}
            render={({ field, fieldState: { error } }) => {
              return (
                <>
                  <ControlCombobox
                    selectedValue={field.value || ''}
                    selectPlaceholder={localize('com_ui_select_model')}
                    searchPlaceholder={localize('com_ui_select_model')}
                    setValue={field.onChange}
                    items={models.map((model) => ({
                      label: model?.model_name,
                      value: model?.model_name,
                    }))}
                    className={cn('disabled:opacity-50', error ? 'border-2 border-red-500' : '')}
                    ariaLabel={localize('com_ui_model')}
                    isCollapsed={false}
                    showCarat={true}
                  />
                </>
              );
            }}
          />
        </div>
      </div>
      {/* Model Parameters */}
      {parameters && (
        <div className="h-auto max-w-full overflow-x-hidden p-2">
          <div className="grid grid-cols-2 gap-4">
            {/* This is the parent element containing all settings */}
            {/* Below is an example of an applied dynamic setting, each be contained by a div with the column span specified */}
            {parameters.map((setting) => {
              const Component = componentMapping[setting.component];
              if (!Component) {
                return null;
              }
              const { key, default: defaultValue, ...rest } = setting;

              // if (key === 'region' && bedrockRegions.length) {
              //   rest.options = bedrockRegions;
              // }

              return (
                <Component
                  key={key}
                  settingKey={key}
                  defaultValue={defaultValue}
                  {...rest}
                  setOption={setOption as t.TSetOption}
                  conversation={modelParameters as Partial<t.TConversation>}
                />
              );
            })}
          </div>
        </div>
      )}
      {/* Reset Parameters Button */}
      <button
        type="button"
        onClick={handleResetParameters}
        className="btn btn-neutral my-1 flex w-full items-center justify-center gap-2 px-4 py-2 text-sm"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        {localize('com_ui_reset_var', { 0: localize('com_ui_model_parameters') })}
      </button>
    </div>
  );
}
