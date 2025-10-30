import { atom } from "jotai";
import { v4 as uuidv4 } from "uuid";
import { apiService } from "../../services/apiService";
import { sessionsAtom, activeSessionIdAtom } from "../atoms/session";
import { messagesAtom } from "../atoms/message";
import { toolResultsAtom, toolCallResultMap } from "../atoms/tool";
import { isProcessingAtom, activePanelContentAtom, modelInfoAtom, statusLoadingAtom } from "../atoms/ui";
import { processEventAction } from "./eventProcessor";
import { Message } from "../../../common/types";
import { connectionStatusAtom } from "../atoms/ui";
import { replayStateAtom } from "../atoms/replay";
import { ChatCompletionContentPart, AgentEventStream } from "@multimodal/agent-interface";
import { userid } from "@/components/nav-projects";

/**
 * Add a session metadata cache to store model information for each session
 */
const sessionMetadataCache = new Map<
  string,
  {
    modelInfo?: { provider: string; model: string };
    // We can add other metadata here that you want to persist across sessions.
  }
>();

/**
 * Load all available sessions
 */
export const loadSessionsAction = atom(null, async (get, set) => {
  try {
    const loadedSessions = await apiService.getSessions();
    set(
      sessionsAtom,
      loadedSessions
        .map((item: any) => ({ ...(item?.metadata || {}), ...item }))
        .filter((item: any) => {
          return (item?.tags || []).find((v: any) => v == userid);
        })
    );
  } catch (error) {
    console.error("Failed to load sessions:", error);
    throw error;
  }
});

/**
 * Create a new session
 */
export const createSessionAction = atom(null, async (get, set) => {
  try {
    const newSession = await apiService.createSession();

    // Add to sessions list
    set(sessionsAtom, (prev) => [newSession, ...prev]);

    // Initialize session data
    set(messagesAtom, (prev) => ({
      ...prev,
      [newSession.id]: [],
    }));

    set(toolResultsAtom, (prev) => ({
      ...prev,
      [newSession.id]: [],
    }));

    // Clear workspace panel content to show empty state
    set(activePanelContentAtom, null);

    // Set as active session
    set(activeSessionIdAtom, newSession.id);

    return newSession.id;
  } catch (error) {
    console.error("Failed to create session:", error);
    throw error;
  }
});

/**
 * Set the active session
 * 简化加载逻辑，移除恢复会话的复杂性
 */
export const setActiveSessionAction = atom(null, async (get, set, sessionId: string) => {
  try {
    // 检查是否已经是活动会话
    const currentActiveSessionId = get(activeSessionIdAtom);
    if (currentActiveSessionId === sessionId) {
      console.log(`Session ${sessionId} is already active, skipping load`);
      return;
    }

    // 检查回放状态并退出回放模式（除非是同一会话）
    const replayState = get(replayStateAtom);
    if (replayState.isActive) {
      console.log("Exiting replay mode due to session change");
      set(replayStateAtom, {
        isActive: false,
        isPaused: true,
        events: [],
        currentEventIndex: -1,
        startTimestamp: null,
        endTimestamp: null,
        playbackSpeed: 1,
        visibleTimeWindow: null,
        processedEvents: {},
      });
    }

    set(statusLoadingAtom, true);
    // 直接获取会话详情，不需要检查 active 状态
    const sessionDetails = await apiService.getSessionDetails(sessionId);

    // 获取当前会话状态以更新 isProcessing 状态
    try {
      const status = await apiService.getSessionStatus(sessionId);
      console.log("setActive", status.isProcessing);
      set(statusLoadingAtom, false);
      set(isProcessingAtom, status.isProcessing);
    } catch (error) {
      set(statusLoadingAtom, false);
      console.warn("Failed to get session status:", error);
      set(isProcessingAtom, false);
    }

    // 清理工具调用映射缓存
    toolCallResultMap.clear();

    // Check if the session message is loaded
    const messages = get(messagesAtom);
    const hasExistingMessages = messages[sessionId] && messages[sessionId].length > 0;

    if (!hasExistingMessages) {
      console.log(`Loading events for session ${sessionId}`);
      const events = await apiService.getSessionEvents(sessionId);

      // Pre-process streaming events to ensure correct continuity
      const processedEvents = preprocessStreamingEvents(events);

      // Process each event to construct messages and tool results
      for (const event of processedEvents) {
        set(processEventAction, { sessionId, event });
      }

      // Cache key session metadata
      const runStartEvent = events.find((e) => e.type === "agent_run_start");
      if (runStartEvent && ("provider" in runStartEvent || "model" in runStartEvent)) {
        sessionMetadataCache.set(sessionId, {
          modelInfo: {
            provider: runStartEvent.provider || "",
            model: runStartEvent.model || "",
          },
        });
      }
    } else {
      console.log(`Session ${sessionId} already has messages, skipping event loading`);
      const cachedMetadata = sessionMetadataCache.get(sessionId);
      if (cachedMetadata?.modelInfo) {
        console.log(`Restoring model info from cache for session ${sessionId}`);
        set(modelInfoAtom, cachedMetadata.modelInfo);
      } else {
        console.log(`No cached model info for session ${sessionId}, loading events to find model info`);

        // If not in the cache, the load event only looks for model information
        try {
          const events = await apiService.getSessionEvents(sessionId);
          const runStartEvent = events.find((e) => e.type === "agent_run_start");
          if (runStartEvent && ("provider" in runStartEvent || "model" in runStartEvent)) {
            const modelInfo = {
              provider: runStartEvent.provider || "",
              model: runStartEvent.model || "",
            };

            // Update model information status
            set(modelInfoAtom, modelInfo);

            // Cache for future use
            sessionMetadataCache.set(sessionId, { modelInfo });
            console.log(`Found and cached model info for session ${sessionId}:`, modelInfo);
          }
        } catch (error) {
          console.warn(`Failed to load events for model info recovery:`, error);
        }
      }
    }

    // 设置为活动会话
    set(activeSessionIdAtom, sessionId);
  } catch (error) {
    console.error("Failed to set active session:", error);
    set(connectionStatusAtom, (prev) => ({
      ...prev,
      connected: false,
      lastError: error instanceof Error ? error.message : String(error),
    }));
    throw error;
  }
});

/**
 * Update session metadata
 */
export const updateSessionAction = atom(null, async (get, set, params: { sessionId: string; metadata: any }) => {
  const { sessionId, metadata } = params;

  try {
    const updatedSession = await apiService.updateSessionMetadata(sessionId, metadata);

    // Update session in the list
    set(sessionsAtom, (prev) =>
      prev.map((session) => (session.id === sessionId ? { ...session, ...updatedSession } : session))
    );

    return updatedSession;
  } catch (error) {
    console.error("Failed to update session:", error);
    throw error;
  }
});

/**
 * 预处理事件，确保流式事件按正确顺序处理
 */
function preprocessStreamingEvents(events: AgentEventStream.Event[]): AgentEventStream.Event[] {
  // 对流式消息进行整理
  const messageStreams: Record<string, AgentEventStream.Event[]> = {};

  // 收集所有流式事件，按messageId分组
  events.forEach((event) => {
    if (event.type === "final_answer_streaming" && "messageId" in event) {
      const messageId = event.messageId as string;
      if (!messageStreams[messageId]) {
        messageStreams[messageId] = [];
      }
      messageStreams[messageId].push(event);
    }
  });

  // 返回预处理后的事件，确保流式事件以正确顺序处理
  return events;
}

/**
 * Delete a session
 */
export const deleteSessionAction = atom(null, async (get, set, sessionId: string) => {
  try {
    const success = await apiService.deleteSession(sessionId);
    const activeSessionId = get(activeSessionIdAtom);

    if (success) {
      // 从会话元数据缓存中删除
      sessionMetadataCache.delete(sessionId);

      // Remove from sessions list
      set(sessionsAtom, (prev) => prev.filter((session) => session.id !== sessionId));

      // Clear active session if it was deleted
      if (activeSessionId === sessionId) {
        set(activeSessionIdAtom, null);
      }

      // Clear session data
      set(messagesAtom, (prev) => {
        const newMessages = { ...prev };
        delete newMessages[sessionId];
        return newMessages;
      });

      set(toolResultsAtom, (prev) => {
        const newResults = { ...prev };
        delete newResults[sessionId];
        return newResults;
      });
    }

    return success;
  } catch (error) {
    console.error("Failed to delete session:", error);
    throw error;
  }
});

/**
 * Send a message in the current session
 */
export const sendMessageAction = atom(
  null,
  async (get, set, content: string | ChatCompletionContentPart[], thinking?: boolean, userId?: string) => {
    const activeSessionId = get(activeSessionIdAtom);

    if (!activeSessionId) {
      throw new Error("No active session");
    }

    set(isProcessingAtom, true);

    // Note: Do NOT add user message to state here in streaming mode
    // The user_message event will come from the server's event stream
    // This prevents duplicate user messages in the UI

    // Set initial session name from first user query
    // Note: We check message count before sending since user_message will come from stream
    try {
      const messages = get(messagesAtom)[activeSessionId] || [];
      const userMessageCount = messages.filter((m) => m.role === "user").length;

      if (userMessageCount === 0) {
        let summary = "";
        if (typeof content === "string") {
          summary = content.length > 50 ? content.substring(0, 47) + "..." : content;
        } else {
          const textPart = content.find((part) => part.type === "text");
          if (textPart && "text" in textPart) {
            summary = textPart.text.length > 50 ? textPart.text.substring(0, 47) + "..." : textPart.text;
          } else {
            summary = "Image message";
          }
        }

        await apiService.updateSessionMetadata(activeSessionId, { name: summary, tags: [userid] });

        set(sessionsAtom, (prev) =>
          prev.map((session) =>
            session.id === activeSessionId
              ? {
                  ...session,
                  name: summary,
                  // metadata: {
                  //   ...session.metadata,
                  //   name: summary,
                  // },
                }
              : session
          )
        );
      }
    } catch (error) {
      console.log("Failed to update initial summary, continuing anyway:", error);
    }

    try {
      await apiService.sendStreamingQuery(
        activeSessionId,
        content,
        (event) => {
          set(processEventAction, { sessionId: activeSessionId, event });

          // Maintain processing state until explicit end
          if (event.type !== "agent_run_end" && event.type !== "assistant_message") {
            set(isProcessingAtom, true);
          }
        },
        !!thinking,
        userId || ""
      );
    } catch (error) {
      console.error("Error sending message:", error);
      set(isProcessingAtom, false);
      throw error;
    }
  }
);
/**
 * Abort the current running query
 */
export const abortQueryAction = atom(null, async (get, set) => {
  const activeSessionId = get(activeSessionIdAtom);

  if (!activeSessionId) {
    return false;
  }

  try {
    const success = await apiService.abortQuery(activeSessionId);

    if (success) {
      set(isProcessingAtom, false);

      // Add system message about abort
      const abortMessage: Message = {
        id: uuidv4(),
        role: "system",
        content: "The operation was aborted.",
        timestamp: Date.now(),
      };

      set(messagesAtom, (prev) => {
        const sessionMessages = prev[activeSessionId] || [];
        return {
          ...prev,
          [activeSessionId]: [...sessionMessages, abortMessage],
        };
      });
    }

    return success;
  } catch (error) {
    console.error("Error aborting query:", error);
    return false;
  }
});

/**
 * Check the current status of a session
 */
export const checkSessionStatusAction = atom(null, async (get, set, sessionId: string) => {
  if (!sessionId) return;

  try {
    const status = await apiService.getSessionStatus(sessionId);
    set(isProcessingAtom, status.isProcessing);

    return status;
  } catch (error) {
    console.error("Failed to check session status:", error);
    // 错误时不更新处理状态，避免误报
  }
});

/**
 * Handle the end of a conversation
 * 仍然保留此函数，但减少其重要性，避免更新失败带来的影响
 */
async function handleConversationEnd(get: any, set: any, sessionId: string): Promise<void> {
  // 我们不再依赖这个函数来设置会话名称，但仍然保留它作为备份机制
  const allMessages = get(messagesAtom)[sessionId] || [];

  // 只在有足够的消息并且会话没有名称时才尝试生成摘要
  const sessions = get(sessionsAtom);
  const currentSession = sessions.find((s) => s.id === sessionId);

  // 如果会话已经有名称，则不需要再生成
  if (currentSession && currentSession.name) {
    return;
  }

  // 只在有实际对话时才尝试生成摘要
  if (allMessages.length > 1) {
    try {
      // 转换消息为 API 期望的格式
      const apiMessages = allMessages.map((msg: Message) => ({
        role: msg.role,
        content: typeof msg.content === "string" ? msg.content : "multimodal content",
      }));

      // 生成摘要
      const summary = await apiService.generateSummary(sessionId, apiMessages);

      if (summary) {
        // 更新会话名称
        await apiService.updateSessionMetadata(sessionId, { name: summary });

        // 更新 sessions atom
        set(sessionsAtom, (prev: any[]) =>
          prev.map((session) => (session.id === sessionId ? { ...session, name: summary } : session))
        );
      }
    } catch (error) {
      console.error("Failed to generate or update summary, continuing anyway:", error);
      // 错误不影响主流程
    }
  }
}
