import React from "react";
import { motion } from "framer-motion";
import { FiSearch, FiInfo } from "react-icons/fi";

interface OnChainTabDataRenderProps {
  part: {
    data?: { text?: string }[];
    query?: string;
  };
}

export const TabDataRender: React.FC<OnChainTabDataRenderProps> = ({ part }) => {
  const rawText = part?.data?.[0]?.text || "";
  let parsedData: any[] = [];

  try {
    parsedData = JSON.parse(rawText);
  } catch (e) {
    console.error("Failed to parse PLM data", e);
  }

  const query = part?.query || "";

  if (!Array.isArray(parsedData) || parsedData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 text-center border border-gray-200/70 dark:border-gray-700/50">
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
          <FiInfo className="text-gray-400" size={24} />
        </div>
        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">未找到相关数据</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          请确认数据格式是否正确，或更换查询条件。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {query && (
        <div className="mb-5">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700/50 flex items-center justify-center mr-4 text-gray-600 dark:text-gray-400">
              <FiSearch size={20} />
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">PLM 数据查询结果</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">共返回 {parsedData.length} 条数据</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-gray-200 border border-gray-200/70 dark:border-gray-700/50">
            <div className="flex items-center">
              <FiSearch className="text-gray-500 dark:text-gray-400 mr-2" size={14} />
              <span>{query}</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {parsedData.map((item, index) => (
          <motion.div
            key={item?.ID?.value || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ y: -2 }}
            className="group"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/70 dark:border-gray-700/50 p-4 transition-all duration-200 hover:border-gray-300/70 dark:hover:border-gray-600/50">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                {Object.keys(item)
                  .filter((key) => item[key].name != "ID" && item[key].name != "PackId")
                  .map((key) => {
                    return (
                      <div key={key} className="flex justify-between items-center">
                        <span>{item[key].name}：</span>
                        <div className="text-[#898989] flex justify-end text-right">{item[key].value === "~#~" ? "无权限" : item[key].value ?? "-"}</div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
