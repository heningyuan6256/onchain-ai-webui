// AgentRagSelector.tsx
import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import {
  useWatch,
  FieldPath,
  Controller,
  FieldValues,
  useFormContext,
  ControllerRenderProps,
} from 'react-hook-form';
import { TranslationKeys, useLocalize } from '~/hooks';
import { cn } from '~/utils';
import './index.css';

type ToolItem = { name: string; id: string };

const AgentRagSelector: React.FC<{ className?: string; groups: any[] }> = ({
  className,
  groups,
}) => {
  const localize = useLocalize();
  const formContext = useFormContext();
  const agent_id = useWatch({ name: 'id', control: formContext.control });

  const options = React.useMemo(() => {
    if (!groups.length) return [];
    return groups.map((g) => ({
      label: g.name, // 组标题
      options: g.tools.map((t) => ({
        label: t.name,
        value: t.name,
      })),
    }));
  }, [groups]);
  return (
    <Controller
      name="tools_conf"
      control={formContext.control}
      defaultValue={[]}
      render={({ field }) => {
        return (
          <div style={{ padding: '0px 4px' }}>
            <Select
              getPopupContainer={(trigger) => trigger.parentElement!}
              mode="multiple"
              showSearch
              placeholder="选择Mcp工具"
              value={field.value || []}
              onChange={(value) => field.onChange(value)}
              className={cn('agent-mcp-select', className)}
              aria-label="Select mcp tools"
              filterOption={(input, option) =>
                ((option?.label as string) ?? '').toLowerCase().includes(input.toLowerCase())
              }
              optionFilterProp="label"
              options={options}
              suffixIcon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-chevron-down h-4 w-4 text-text-secondary"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              }
            ></Select>
          </div>
        );
      }}
    />
  );
};

export default AgentRagSelector;
