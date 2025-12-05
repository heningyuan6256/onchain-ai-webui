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
import request from '~/request/request';
import { toast } from 'sonner';
import './AgentRagSelector.css';

const useRagCategories = () => {
  const [categories, setCategories] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const userId = localStorage.getItem('id');
        if (!userId) {
          console.warn('No user ID in localStorage');
          setCategories([]);
          setLoading(false);
          return;
        }

        const res = await request(
          `/rag/system/ragflow/datasets?pageNum=1&pageSize=10000&other_id=${userId}`,
          { method: 'get' },
        );

        if (res?.code === 200 && Array.isArray(res.rows)) {
          const rags = res.rows?.map((row) => {
            return { label: row.name, value: row.id };
          });
          setCategories(rags);
        } else {
          toast.error(res?.message ?? 'Failed to load RAG datasets');
          setCategories([]);
        }
      } catch (error) {
        console.error('Failed to fetch RAG categories:', error);
        toast.error('Failed to load RAG datasets');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading };
};

const AgentRagSelector: React.FC<{ className?: string }> = ({ className }) => {
  const localize = useLocalize();
  const formContext = useFormContext();

  const agent_id = useWatch({
    name: 'id',
    control: formContext.control,
  });

  const { categories, loading } = useRagCategories();

  const getCategoryLabel = (category: { label: string; value: string }) => {
    if (category.label && category.label.startsWith('com_')) {
      return localize(category.label as TranslationKeys);
    }
    return category.label;
  };

  const options = categories.map((cat) => ({
    label: getCategoryLabel(cat),
    value: cat.value,
  }));

  const searchPlaceholder = localize('com_ui_search_agent_category') || 'Search category...';
  const ariaLabel = localize('com_ui_agent_category_selector_aria') || 'Select agent categories';

  return (
    <Controller
      name="rag_conf"
      control={formContext.control}
      defaultValue={[]}
      render={({ field }) => {
        return (
          <div style={{ padding: '0px 4px' }}>
            <Select
              getPopupContainer={(trigger) => trigger.parentElement!}
              mode="multiple"
              showSearch
              placeholder={'选择知识库'}
              suffixIcon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-chevron-down h-4 w-4 text-text-secondary"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              }
              value={field.value || []}
              onChange={(value) => field.onChange(value)}
              className={cn('agent-rag-select', className)}
              aria-label={ariaLabel}
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={options}
            />
          </div>
        );
      }}
    />
  );
};

export default AgentRagSelector;
