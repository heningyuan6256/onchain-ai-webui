import React from "react";
import { ToolResultContentPart } from "../types";
import { motion } from "framer-motion";
import { FiSearch, FiInfo } from "react-icons/fi";

interface OnchainRagQueryRendererProps {
  part: ToolResultContentPart;
}

export const RagQueryRenderer: React.FC<OnchainRagQueryRendererProps> = ({ part }) => {
  const rawText = part?.data?.[0]?.text || "";
  let parsedData: any = null;

  try {
    parsedData = JSON.parse(rawText);
  } catch (e) {
    console.error("Failed to parse RAG query response", e);
  }

  const chunks = parsedData || [];
  const query = part?.query || "";

  if (!parsedData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 text-center border border-gray-200/70 dark:border-gray-700/50">
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
          <FiInfo className="text-gray-400" size={24} />
        </div>
        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">未找到相关知识</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          请尝试换一个问题或检查知识库是否包含相关信息。
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
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">知识库查询结果</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">共返回 {chunks.length} 条知识内容</p>
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

      {chunks.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 text-center border border-gray-200/70 dark:border-gray-700/50">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
            <FiInfo className="text-gray-400" size={24} />
          </div>
          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">未找到相关知识</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            请尝试换一个问题或检查知识库是否包含相关信息。
          </p>
        </div>
      )}

      <div className="space-y-4">
        {chunks.map((chunk: any, index: number) => (
          <motion.div
            key={chunk.id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ y: -2 }}
            className="group"
          >
            {!chunk.document_id ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/70 dark:border-gray-700/50 p-4 transition-all duration-200 hover:border-gray-300/70 dark:hover:border-gray-600/50">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {Object.keys(chunk)
                    .filter((key) => chunk[key].name != "ID" && chunk[key].name != "PackId")
                    .map((key) => {
                      return (
                        <div key={key} className="flex justify-between items-center">
                          <div>{chunk[key].name}：</div>
                          <div className="text-[#898989] flex justify-end text-right">{chunk[key].value === "~#~" ? "无权限" : chunk[key].value ?? "-"}</div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/70 dark:border-gray-700/50 p-4 transition-all duration-200 hover:border-gray-300/70 dark:hover:border-gray-600/50">
                {/* Highlight content */}
                <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                  {chunk.highlight ? (
                    <div className="prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: chunk.highlight }} />
                  ) : (
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                      {chunk.content || chunk.content_ltks}
                    </pre>
                  )}
                </div>

                {/* Metadata */}
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  {chunk.document_keyword && (
                    <div>
                      <strong>来源文档：</strong>
                      {chunk.document_keyword.split("%")[0]}
                    </div>
                  )}
                  {chunk.document_id && (
                    <div>
                      <strong>文档ID：</strong>
                      {chunk.document_id}
                    </div>
                  )}
                  {chunk.dataset_id && (
                    <div>
                      <strong>数据集ID：</strong>
                      {chunk.dataset_id}
                    </div>
                  )}
                  {chunk.doc_type_kwd && (
                    <div>
                      <strong>文档类型：</strong>
                      {chunk.doc_type_kwd}
                    </div>
                  )}

                  <div>
                    <strong>相似度：</strong>
                    {[
                      `总: ${chunk.similarity?.toFixed(3) ?? "N/A"}`,
                      `词义: ${chunk.term_similarity?.toFixed(3) ?? "N/A"}`,
                      `向量: ${chunk.vector_similarity?.toFixed(3) ?? "N/A"}`,
                    ].join(" / ")}
                  </div>

                  {Array.isArray(chunk.positions) && chunk.positions.length > 0 && (
                    <div>
                      <strong>匹配位置：</strong> [{chunk.positions.flat().join(", ")}]
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
