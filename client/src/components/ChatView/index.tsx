import { generateSnowId } from "@/utils";
import { FC, forwardRef, Fragment, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { useAsyncEffect, useLatest, useUpdateEffect } from "ahooks";
import { OnChainThoughtChain, OnChainThoughtThinksTypes } from "./ThoughtChain";
import COPYSVG from "../../assets/image/front-copy.svg";
import REFRESHSVG from "../../assets/image/front-refresh.svg";
import WIDEARROWSVG from "../../assets/image/front-widearrow.svg";
import AISVG from "../../assets/image/front-ai.svg";
import Icon from "../icon";
import RenderMardown from "../Markdown";
import { MARKDOWN_TEST_MESSAGE } from "@/hooks/use-md";
import EventEmitter from "@/utils/EventEmitter";
import { useUploadData } from "@/contexts/UploadDataContext";
import { useLocation } from "react-router-dom";
import { debounce } from "lodash";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "@/tars/common/hooks/useSession";
import { groupedMessagesAtom, messagesAtom } from "@/tars/common/state/atoms/message";
import { useAtomValue } from "jotai";
import { MessageGroup } from "@/tars/standalone/chat/Message/components/MessageGroup";
import { ChatPanel } from "@/tars/standalone/chat/ChatPanel";
export interface ChatViewProps {
  ref: any;
  inputMessage?: string;
  useKnowledge: boolean;
  step: number;
  chatId?: string;
  onSubmit: () => void;
  onChangeMessage: (msgs: messageItem[]) => void;
}

export const judgeIsFile = (input: string) => {
  return input.startsWith("Files: ");
};

export const judgeIsMcp = (input: string) => {
  const regex =
    /<use_mcp_tool>\s*<server_name>(.*?)<\/server_name>\s*<tool_name>(.*?)<\/tool_name>\s*<arguments>\s*([\s\S]*?)\s*<\/arguments>\s*<\/use_mcp_tool>/g;

  let match;
  while ((match = regex.exec(input)) !== null) {
    const serverName = match[1].trim();
    const toolName = match[2].trim();
    const jsonBody = match[3].trim();

    try {
      const json = JSON.parse(jsonBody);
      return {
        serverName,
        json,
        toolName,
      };
    } catch (err: any) {
      console.error("JSON 解析失败:", err.message);
      return null;
    }
  }
};

export const getDateTime = () => {
  return `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
};

type thinkDataTypes = { type: "think"; content: OnChainThoughtThinksTypes[]; isEnd: boolean };

type contentTypes = { type: "normal"; content: string };

export type chooseTypes = { type: "choose"; content: string[]; name: string };

export type messageDataItem = thinkDataTypes | contentTypes | chooseTypes;

export interface messageItem {
  id: string;
  role: "user" | "assistant";
  time: string;
  data: messageDataItem[];
}

interface singleSseAData {
  id: string;
  role: "user" | "assistant";
  time: string;
  content: string;
  type: "think" | "normal" | "choose";
}

const ChatView: FC<ChatViewProps> = forwardRef((props, ref) => {
  const chatRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { setIsStreaming, isStreaming, checkList, thinking } = useUploadData();

  const [messageList, setMessageList] = useState<messageItem[]>([]);

  const latestUseKnowLedge = useLatest(props.useKnowledge);

  const {
    activeSessionId,
    isProcessing,
    connectionStatus,
    checkServerStatus,
    sendMessage: sendTarMessage,
  } = useSession();

  const groupedMessages = useAtomValue(groupedMessagesAtom);
  const allMessages = useAtomValue(messagesAtom);

  // 使用当前会话的消息
  // const activeMessages = activeSessionId ? groupedMessages[activeSessionId] || [] : [];
  console.log(allMessages["activesession"], groupedMessages, "activeMessages");

  useImperativeHandle(ref, () => {
    return {
      sendMessage: (msg: string) => {
        sendMessage(msg);
      },
      handleStopGeneration: handleStopGeneration,
    };
  });

  const messageListLatset = useLatest(messageList);
  const handleMcpStatus = (data: { message: string; server: string; status: string; type: string }) => {
    // const messageData: singleSseAData = {
    //   content: data.message,
    //   role: "assistant",
    //   id: generateSnowId(),
    //   time: getDateTime(),
    //   type: "think",
    // };
    // updateLastMessage(messageData);
  };

  // Tool execution state
  const [toolInfoState, setToolInfoState] = useState<{
    plain_content: string | undefined;
    server: string | undefined;
    tool: string | undefined;
    arguments: any | undefined;
    messageId: string | undefined;
  }>({
    plain_content: undefined,
    server: undefined,
    tool: undefined,
    arguments: undefined,
    messageId: undefined,
  });

  // Execute a confirmed tool
  const executeToolConfirm = async (server: string, tool: string, args: any) => {
    await streamResponse(
      "/api/tool/confirm",
      JSON.stringify({
        botName: "qwen-turbo",
        server,
        tool,
        args,
      })
    );
  };

  useEffect(() => {
    const executePendingTool = async () => {
      // When streaming ends and we have pending tool info
      if (!isStreaming && toolInfoState.server && toolInfoState.tool && toolInfoState.arguments) {
        const { server, tool, arguments: args } = toolInfoState;

        // Check if this tool needs confirmation
        // if (!needsConfirmation(server, tool)) {
        console.log(`Auto-executing tool: ${tool} on server: ${server}`);

        // Execute the tool
        await executeToolConfirm(server, tool, args);

        // Clear the tool info state
        setToolInfoState({
          plain_content: undefined,
          server: undefined,
          tool: undefined,
          arguments: undefined,
          messageId: undefined,
        });
        // }
      }
    };

    executePendingTool();
  }, [isStreaming, toolInfoState]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current!.scrollTop = chatRef.current!.scrollHeight;
    }
    props.onChangeMessage && props.onChangeMessage(messageList);
  }, [JSON.stringify(messageList), chatRef.current]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current!.scrollTop = chatRef.current!.scrollHeight;
    }
  }, [props.step, chatRef.current]);

  const location = useLocation();
  const chatId = useMemo(() => {
    return location.pathname.split("/conversations/")[1].split("?")[0];
  }, [location.pathname]);

  // useEffect(() => {
  //   if (chatId) {
  //     chatService.fetchMessages(chatId).then((res) => {
  //       const content = res[0]?.content;
  //       if (content) {
  //         const struct = JSON.parse(content);
  //         console.log(struct, "struct");
  //         setMessageList(struct);
  //       }
  //     });
  //   }
  // }, [chatId]);

  const debouncedUpdateMessage = debounce(() => {
    // chatService.updateMessage(chatId, JSON.stringify(messageListLatset.current));
  }, 500); // 5

  const updateLastMessage = (chunkData: singleSseAData) => {
    if (mcpModeRef.current) {
      return;
    }
    const lastMessage = messageListLatset.current[messageListLatset.current.length - 1];
    if (chunkData.type === "think") {
      const lastChildData = lastMessage.data[lastMessage.data.length - 1];
      if (!lastChildData) {
        lastMessage.data = [
          {
            type: "think",
            isEnd: false,
            content: [{ title: "过程节点1", key: generateSnowId(), icon: "pending", data: chunkData.content }],
          },
        ];
      } else {
        //  如果是think,则在think data里面push一条，否则就追加一条新的think
        if (lastChildData.type === "think") {
          lastChildData.content.forEach((v) => {
            v.icon = "success";
          });
          lastChildData.content.push({
            title: `过程节点${lastChildData.content.length + 1}`,
            key: generateSnowId(),
            icon: "pending",
            data: chunkData.content,
          });
        } else {
          lastMessage.data = [
            ...lastMessage.data,
            {
              isEnd: false,
              content: [{ title: "过程节点1", key: generateSnowId(), icon: "pending", data: chunkData.content }],
              type: "think",
            },
          ];
        }
      }
    } else if (chunkData.type === "normal") {
      if (lastMessage?.data) {
        lastMessage.data.forEach((item) => {
          if (item.type === "think") {
            item.isEnd = true;
            item.content.forEach((v) => {
              v.icon = "success";
            });
          }
        });
        const lastChildData = lastMessage.data[lastMessage.data.length - 1];
        if (!lastChildData) {
          lastMessage.data = [{ type: "normal", content: chunkData.content }];
        } else {
          //  如最后一条是think,则追加一段新的normal，否则就合并
          if (lastChildData.type != chunkData.type) {
            lastMessage.data = [...lastMessage.data, { content: chunkData.content, type: "normal" }];
          } else {
            lastChildData.content = `${lastChildData.content || ""}${chunkData.content || ""}`;
          }
        }
      }
    }

    debouncedUpdateMessage();

    setMessageList([...messageListLatset.current]);
  };

  // Store tool results mapped to the assistant message IDs
  const [toolResults, setToolResults] = useState<Record<string, string | object>>({});

  const handleToolResult = async (content: string, server: string) => {
    // Find the target message ID from the last tool info state
    const targetMessageId = toolInfoState.messageId;
    setToolResultState({ content, server, targetMessageId });

    // If we have a target message ID, associate this result with it
    if (targetMessageId) {
      setToolResults((prev) => ({
        ...prev,
        [targetMessageId]: content,
      }));
    }
  };

  // Handle tool information
  const handleToolInfo = async (plainContent: string, server: string, tool: string, args: any) => {
    // Find the latest assistant message ID (this will be associated with tool results)
    let messageId: string | undefined = undefined;
    if (messageListLatset.current.length > 0) {
      const assistantMessages = messageListLatset.current.filter((m) => m.role === "assistant");
      if (assistantMessages.length > 0) {
        const lastAssistantMessage = assistantMessages[assistantMessages.length - 1];
        messageId = lastAssistantMessage.id;
      }
    }

    setToolInfoState({
      plain_content: plainContent,
      server: server,
      tool: tool,
      arguments: args,
      messageId,
    });
  };

  const [toolResultState, setToolResultState] = useState<{
    content: string | undefined;
    server: string | undefined;
    targetMessageId: string | undefined;
  }>({
    content: undefined,
    server: undefined,
    targetMessageId: undefined,
  });

  useEffect(() => {
    const changeMessageEmitter = (e: any) => {
      sendMessage(e.detail.msg);
    };

    EventEmitter.addEventListener("chatMessage", changeMessageEmitter);

    return () => {
      EventEmitter.removeEventListener("chatMessage", changeMessageEmitter);
    };
  }, []);

  useEffect(() => {
    const processPendingToolResult = async () => {
      // When streaming ends and we have pending tool result
      if (!isStreaming && toolResultState.content && toolResultState.server) {
        const { content, server } = toolResultState;

        // Send the message immediately
        console.log(`Sending tool result: ${content}`);
        if (content.startsWith("CHOOSE: ")) {
          const data = content.split("CHOOSE: ")[1];
          const contentData = JSON.parse(data);

          const messages: any = [
            ...messageListLatset.current,
            {
              role: "assistant",
              id: generateSnowId(),
              time: getDateTime(),
              data: [{ type: "normal", content: contentData.title }],
            },
            {
              role: "assistant",
              id: generateSnowId(),
              time: getDateTime(),
              data: [{ type: "choose", content: contentData.data, name: contentData.name }],
            },
          ];

          // chatService.updateMessage(chatId, JSON.stringify(messages));
          setMessageList(messages);
        } else {
          await sendMessage(content, { server });
        }
        // Clear the tool result state
        setToolResultState({
          content: undefined,
          server: undefined,
          targetMessageId: undefined,
        });
      }
    };

    processPendingToolResult();
  }, [isStreaming, toolResultState]);

  const thinkingModeRef = useRef(false);
  const thinkingBufferRef = useRef("");
  const tagDetectionBufferRef = useRef("");

  const mcpModeRef = useRef(false);
  const mcpBufferRef = useRef("");
  const mcpDetectionBufferRef = useRef(""); // 用于拼接标签检测

  const handleDeltaContent = (deltaContent: string) => {
    // 拼接标签检测 buffer
    // mcpDetectionBufferRef.current += deltaContent;

    // console.log(mcpDetectionBufferRef,'mcpDetectionBufferRef');

    // if (!mcpModeRef.current && mcpDetectionBufferRef.current.includes("<use_mcp_tool>")) {
    //   mcpModeRef.current = true;
    //   const idx = mcpDetectionBufferRef.current.indexOf("<use_mcp_tool>") + "<use_mcp_tool>".length;
    //   mcpBufferRef.current = mcpDetectionBufferRef.current.slice(idx); // 从标签后开始缓存
    //   return
    // }

    // // // // 正在 use_mcp_tool 模式
    // if (mcpModeRef.current) {
    //   mcpBufferRef.current += deltaContent;
    //   if (mcpBufferRef.current.includes("</use_mcp_tool>")) {
    //     console.log("end_mcp");
    //     mcpModeRef.current = false;
    //     mcpBufferRef.current = "";
    //     mcpDetectionBufferRef.current = "";
    //     return
    //   }
    // }

    // Step 1: 合并到 tagDetectionBufferRef 以处理被拆分的 <think>
    tagDetectionBufferRef.current += deltaContent;

    // Step 2: 判断是否进入 <think> 模式
    if (!thinkingModeRef.current) {
      const idx = tagDetectionBufferRef.current.indexOf("<think>");
      if (idx !== -1) {
        thinkingModeRef.current = true;
        // 提取 <think> 后内容进思考缓存
        thinkingBufferRef.current = tagDetectionBufferRef.current.slice(idx + "<think>".length);
        tagDetectionBufferRef.current = ""; // 清空检测缓存
        return;
      } else {
        if (!mcpModeRef.current) {
          // 非 thinking 状态下，正常输出
          updateLastMessage({
            content: deltaContent,
            type: "normal",
            id: generateSnowId(),
            role: "assistant",
            time: getDateTime(),
          });
        }
        return;
      }
    }

    // Step 3: 已在 thinking 模式下，继续处理增量内容
    thinkingBufferRef.current += deltaContent;

    // 处理并实时发送每个 \n\n 分段（除了最后不完整段）
    const segments = thinkingBufferRef.current.split("\n\n");

    // 留下最后可能未完的段
    thinkingBufferRef.current = segments.pop()!;

    for (const seg of segments) {
      const trimmed = seg.trim();
      if (trimmed) {
        updateLastMessage({
          content: trimmed,
          type: "think",
          id: generateSnowId(),
          role: "assistant",
          time: getDateTime(),
        });
      }
    }

    // Step 4: 判断是否遇到 </think>
    const endIdx = thinkingBufferRef.current.indexOf("</think>");
    if (endIdx !== -1) {
      // 分隔 <think> 尾部前后的内容
      const beforeEnd = thinkingBufferRef.current.slice(0, endIdx);
      const afterEnd = thinkingBufferRef.current.slice(endIdx + "</think>".length);

      // 发出 <think> 尾部段（按 \n\n 处理）
      const finalSegs = beforeEnd.split("\n\n");
      for (const seg of finalSegs) {
        const trimmed = seg.trim();
        if (trimmed) {
          updateLastMessage({
            content: trimmed,
            type: "think",
            id: generateSnowId(),
            role: "assistant",
            time: getDateTime(),
          });
        }
      }

      // 切换回正常模式
      thinkingModeRef.current = false;
      thinkingBufferRef.current = "";

      const afterTrimmed = afterEnd.trim();
      if (afterTrimmed) {
        updateLastMessage({
          content: afterTrimmed,
          type: "normal",
          id: generateSnowId(),
          role: "assistant",
          time: getDateTime(),
        });
      }
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  const tarStreamResponse = async (query: string) => {
    // setIsStreaming(true);
    sendTarMessage(query, thinking, localStorage.getItem("id")!);

    // Create a new AbortController for this request
    // abortControllerRef.current = new AbortController();
    // const signal = abortControllerRef.current.signal;

    // try {
    //   // Make the API request
    //   const response = await fetch("/tar/api/v1/oneshot/query/stream", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       query: query,
    //       sessionName: "onchain",
    //       sessionTags: ["browser"],
    //     }),
    //     signal,
    //   });

    //   if (!response.ok) {
    //     throw new Error(`Error sending message: ${response.statusText}`);
    //   }

    //   // Check if the response is a stream
    //   if (response.headers.get("Content-Type")?.includes("text/event-stream")) {
    //     const reader = response.body?.getReader();
    //     const decoder = new TextDecoder();

    //     if (!reader) {
    //       throw new Error("Response body is not readable");
    //     }

    //     let buffer = "";

    //     while (true) {
    //       const { done, value } = await reader.read();

    //       if (done) break;

    //       buffer += decoder.decode(value, { stream: true });
    //       const lines = buffer.split("\n\n");

    //       console.log(lines,'lines')

    //       for (let i = 0; i < lines.length - 1; i++) {
    //         const line = lines[i];
    //         if (line.startsWith("data: ")) {
    //           const data = line.slice(6);

    //           if (data === "[DONE]") {
    //             reader.cancel();
    //             break;
    //           }

    //           try {
    //             const parsedData = JSON.parse(data);

    //             if (parsedData.error) {
    //               const errorMessage = `**Error:** ${parsedData.error.message || "Unknown error occurred"}`;
    //               // await updateLastMessage(errorMessage);
    //               reader.cancel();
    //               break;
    //             }

    //             // Handle MCP status messages
    //             if (parsedData.type === "mcp_status") {
    //               handleMcpStatus(parsedData);
    //             }
    //             // Handle content chunks
    //             else if (parsedData.choices?.[0]?.delta?.content) {
    //               const deltaContent = parsedData.choices?.[0]?.delta?.content;
    //               handleDeltaContent(deltaContent);
    //             }

    //             // Set model and provider info
    //             const model = parsedData.model;
    //             const provider = parsedData.provider;
    //             // await updateLastMessage(undefined, undefined, { model, provider });

    //             // Handle tool info
    //             if (parsedData.server && !parsedData.type) {
    //               await handleToolInfo(
    //                 parsedData.plainContent || "",
    //                 parsedData.server,
    //                 parsedData.tool || "",
    //                 parsedData.arguments
    //               );
    //               // await updateLastMessage(parsedData.plainContent, "assistant", {
    //               //   server: parsedData.server,
    //               //   tool: parsedData.tool,
    //               //   arguments: parsedData.arguments,
    //               // });
    //             }
    //             // Handle tool result
    //             if (parsedData.role === "user") {
    //               // updateLastMessage({
    //               //   content: parsedData.content,
    //               //   type: "normal",
    //               //   id: generateSnowId(),
    //               //   role: "assistant",
    //               //   time: getDateTime(),
    //               // });
    //               await handleToolResult(parsedData.content || "", parsedData.server || "");
    //             }
    //           } catch (e) {
    //             console.error("Error parsing SSE data:", e);
    //           }
    //         }
    //       }

    //       buffer = lines[lines.length - 1];
    //     }
    //   } else {
    //     // const updatedChat = await response.json();
    //     // mutate(`/api/chats/${id}`, updatedChat, false);
    //   }
    // } catch (error) {
    //   console.error("Error streaming response:", error);
    // } finally {
    //   setIsStreaming(false);
    // }
  };

  // Stream response from the API
  const streamResponse = async (url: string, body: string) => {
    setIsStreaming(true);

    // Create a new AbortController for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      const accessToken = "";
      // Make the API request
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: body,
        signal,
      });

      if (!response.ok) {
        throw new Error(`Error sending message: ${response.statusText}`);
      }

      // Check if the response is a stream
      if (response.headers.get("Content-Type")?.includes("text/event-stream")) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("Response body is not readable");
        }

        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");

          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i];
            if (line.startsWith("data: ")) {
              const data = line.slice(6);

              if (data === "[DONE]") {
                reader.cancel();
                break;
              }

              try {
                const parsedData = JSON.parse(data);

                if (parsedData.error) {
                  const errorMessage = `**Error:** ${parsedData.error.message || "Unknown error occurred"}`;
                  // await updateLastMessage(errorMessage);
                  reader.cancel();
                  break;
                }

                // Handle MCP status messages
                if (parsedData.type === "mcp_status") {
                  handleMcpStatus(parsedData);
                }
                // Handle content chunks
                else if (parsedData.choices?.[0]?.delta?.content) {
                  const deltaContent = parsedData.choices?.[0]?.delta?.content;
                  handleDeltaContent(deltaContent);
                }

                // Set model and provider info
                const model = parsedData.model;
                const provider = parsedData.provider;
                // await updateLastMessage(undefined, undefined, { model, provider });

                // Handle tool info
                if (parsedData.server && !parsedData.type) {
                  await handleToolInfo(
                    parsedData.plainContent || "",
                    parsedData.server,
                    parsedData.tool || "",
                    parsedData.arguments
                  );
                  // await updateLastMessage(parsedData.plainContent, "assistant", {
                  //   server: parsedData.server,
                  //   tool: parsedData.tool,
                  //   arguments: parsedData.arguments,
                  // });
                }
                // Handle tool result
                if (parsedData.role === "user") {
                  // updateLastMessage({
                  //   content: parsedData.content,
                  //   type: "normal",
                  //   id: generateSnowId(),
                  //   role: "assistant",
                  //   time: getDateTime(),
                  // });
                  await handleToolResult(parsedData.content || "", parsedData.server || "");
                }
              } catch (e) {
                console.error("Error parsing SSE data:", e);
              }
            }
          }

          buffer = lines[lines.length - 1];
        }
      } else {
        const updatedChat = await response.json();
        // mutate(`/api/chats/${id}`, updatedChat, false);
      }
    } catch (error) {
      console.error("Error streaming response:", error);
    } finally {
      setIsStreaming(false);
    }
  };

  const sendMessage = async (message: string, addition?: { server?: string; knowledge?: boolean }) => {
    // if (addition?.server) {
    //   const serverMessages: any = [
    //     ...messageListLatset.current,
    //     { role: "assistant", id: generateSnowId(), time: getDateTime(), data: [] },
    //   ];
    //   chatService.updateMessage(chatId, JSON.stringify(serverMessages));
    //   setMessageList(serverMessages);
    // } else {
    //   const serverMessages: any = [
    //     ...messageListLatset.current,
    //     { role: "user", id: generateSnowId(), time: getDateTime(), data: [{ type: "normal", content: message }] },
    //     { role: "assistant", id: generateSnowId(), time: getDateTime(), data: [] },
    //   ];
    //   chatService.updateMessage(chatId, JSON.stringify(serverMessages));
    //   setMessageList(serverMessages);
    // }

    // const content = addition?.knowledge
    //   ? `使用工业知识库查询并标明出自的文档，TOKEN为${api_key}，API地址为${api_request_url},知识库的名称为${checkList.join(
    //       ","
    //     )}：\n${message}，When responding to my later questions, refer to my industrial knowledge base.\nClearly state the source of any information used in your response.\n,`
    //   : message;

    // const selectedBot = "qwen-turbo";
    // const id = props.chatId;
    // const server = "onchain";

    // props.onSubmit();

    // if (addition?.knowledge) {
    //   await executeToolConfirm(server, "rag_query", { data: message });
    //   // await handleToolInfo(content || "", "onchain", "rag_query", {
    //   //   data: message,
    //   // });
    // } else {
    await tarStreamResponse(message);
    // await streamResponse(
    //   "/api/chat/completions",
    //   JSON.stringify({
    //     content,
    //     botName: selectedBot,
    //     chatId: id,
    //     server: server,
    //   })
    // );
    // }

    // setInterval(() => {
    //   updateLastMessage({ id: generateSnowId(), content: "123", role: "assistant", time: getDateTime() });
    // }, 1000);
  };

  const isFirst = useRef(true);

  useEffect(() => {
    isFirst.current = true;
    setIsStreaming(false);
    abortControllerRef.current?.abort();
  }, [location.pathname]);

  // useEffect(() => {
  //   console.log(props.inputMessage,isFirst.current,'props.inputMessage');

  //   if (isFirst.current) {
  //     if (chatId) {
  //       if (props.inputMessage) {
  //         if (latestUseKnowLedge.current) {
  //           sendMessage(`${props.inputMessage}`, { knowledge: true });
  //         } else {
  //           sendMessage(props.inputMessage);
  //         }
  //       }
  //     }
  //   } else {
  //     if (props.inputMessage) {
  //       if (latestUseKnowLedge.current) {
  //         sendMessage(`${props.inputMessage}`, { knowledge: true });
  //       } else {
  //         sendMessage(props.inputMessage);
  //       }
  //     }
  //   }
  // }, [props.inputMessage, chatId]);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   // if (!message.trim() || !selectedBot || !id) return;

  //   // const messageCopy = message;
  //   // setMessage("");

  //   // await sendUserMessage(messageCopy);
  // };

  const UserContentRender = (content: string, index: string) => {
    return (
      <div className={"justify-end flex bg-[#ffffff] min-h-[40px] max-w-full mb-4 overflow-hidden"} key={index}>
        <div className="text-xs text-[#333333] px-4 py-2.5 border border-[#E0E0E0] rounded-tl-[15px] max-w-full rounded-tr-[15px] rounded-bl-[15px] wrap-break-word">
          {content}
        </div>
      </div>
    );
  };

  const AssistantContentRender = (content: string, index: string) => {
    return (
      <div className={"flex bg-[#ffffff] min-h-[40px] max-w-full overflow-hidden"} key={index}>
        <div className="text-xs text-[#333333] px-4 py-2.5 border border-[#E0E0E0] rounded-[15px] max-w-full wrap-break-word mb-4 w-full">
          <RenderMardown data={content} isStreaming={isStreaming}></RenderMardown>
        </div>
      </div>
    );
  };
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const chatEl = chatRef.current;
    if (!chatEl) return;

    const handleScroll = () => {
      const isAtBottom = chatEl.scrollHeight - chatEl.scrollTop <= chatEl.clientHeight + 20;
      setShowScrollButton(!isAtBottom);
    };

    chatEl.addEventListener("scroll", handleScroll);
    return () => chatEl.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={chatRef} className="h-full w-full overflow-y-auto overflow-x-hidden py-0 px-0 relative flex">
      {/* <RenderMardown data={MARKDOWN_TEST_MESSAGE} isStreaming={false}></RenderMardown> */}
      {
        // messageList.map((item, msgIndex) => {
        //   if (msgIndex + 1 > props.step) {
        //     return <></>;
        //   }
        //   if (item.role === "user") {
        //     return item.data?.map((v, indexV) => {
        //       if (v.type === "normal") {
        //         return UserContentRender(v.content, `user-${indexV}`);
        //       } else {
        //         return <></>;
        //       }
        //     });
        //   } else {
        //     return item.data?.map((v, indexV) => {
        //       if (v.type == "think") {
        //         return (
        //           <div key={indexV}>
        //             <OnChainThoughtChain items={v.content} isEnd={v.isEnd}></OnChainThoughtChain>
        //             <div className="mt-1.5 flex mb-4">
        //               <Icon className="w-3.5 mr-4 cursor-pointer" src={REFRESHSVG}></Icon>
        //               <Icon className="w-3.5 cursor-pointer" src={COPYSVG}></Icon>
        //             </div>
        //           </div>
        //         );
        //       } else if (v.type === "choose") {
        //         return (
        //           <></>
        //           /*<div className={"flex bg-[#ffffff] min-h-[40px] max-w-full"} key={indexV}>
        //             <div className="text-xs text-[#333333] px-4 py-2.5 border border-[#E0E0E0] rounded-[15px] max-w-full break-words mb-4 flex flex-wrap gap-2">
        //               {v.content.map((vi, index) => (
        //                 <div
        //                   key={index}
        //                   className="flex items-center justify-center px-3 py-1 bg-[#f5f5f5] rounded-full cursor-pointer hover:bg-[#e0e0e0]"
        //                   onClick={() => sendMessage(`${v.name}为${vi}`)}
        //                 >
        //                   {vi}
        //                 </div>
        //               ))}
        //             </div>
        //           </div>
        //           */
        //         );
        //       } else {
        //         const mcpData = judgeIsMcp(v.content);
        //         if (mcpData) {
        //           return (
        //             <div className={"flex bg-[#ffffff] min-h-[40px] max-w-full mb-4 w-[100%]"} key={indexV}>
        //               <div className="rounded-[15px] overflow-hidden flex flex-col border border-[#E0E0E0] h-full flex-1">
        //                 <div className="h-[40px] bg-[#F4F4F5] flex items-center text-xs font-[#333333] pl-5 pr-4 justify-between">
        //                   <div>
        //                     <Icon src={AISVG}></Icon>
        //                   </div>
        //                   {/* <Icon className="w-4 cursor-pointer" src={TRASHSVG}></Icon> */}
        //                 </div>
        //                 <div className="flex-1 text-[#F4F4F5] py-5 px-4 font-mono text-sm leading-relaxed overflow-hidden">
        //                   <div className="text-xs text-[#333333] max-w-full break-words flex-wrap gap-2 overflow-auto h-full pl-2.5 border-[#E0E0E0] border-l py-1">
        //                     <div className="mb-2.5 text-[rgba(51,51,51,0.8)] text-xs">服务调用: {mcpData.serverName}</div>
        //                     <div className="text-[rgba(51,51,51,0.8)] text-xs">工具执行命令: {mcpData.toolName}</div>
        //                     {/* {props.message.content.map((vi, index) => (
        //                       <div
        //                         key={index}
        //                         className="flex items-center justify-center px-3 py-1 bg-[#f5f5f5] rounded-[8px] cursor-pointer hover:bg-[#e0e0e0]"
        //                         onClick={() =>
        //                           EventEmitter.dispatchEvent("chatMessage", { msg: `${props.message.name}为${vi}` })
        //                         }
        //                       >
        //                         {vi}
        //                       </div>
        //                     ))} */}
        //                   </div>
        //                 </div>
        //               </div>
        //               {/* <div className="text-xs text-[#333333] px-4 py-2.5 border border-[#E0E0E0] rounded-[15px] max-w-full wrap-break-word mb-4">
        //                 {`经过思考后，确定使用${mcpData.serverName}服务调用${mcpData.toolName}工具执行命令`}
        //               </div> */}
        //             </div>
        //           );
        //         } else if (judgeIsFile(v.content)) {
        //           const content = v.content.split("Files: ")[1];
        //           const contentStruct = JSON.parse(content);
        //           return (
        //             <Fragment>
        //               {contentStruct.map((item: any) => {
        //                 return <div>{item.FileName}</div>;
        //               })}
        //             </Fragment>
        //           );
        //         }
        //         return AssistantContentRender(v.content, `assis-${indexV}`);
        //       }
        //     });
        //   }
        // })
      }

      <ChatPanel />

      {showScrollButton ? (
        <motion.div
          key="scrollToBottomButton"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
          onClick={() => {
            const el = chatRef.current;
            if (!el) return;

            const delta = 10; // 允许误差
            const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;

            // 只有在未到真正底部时才滚动
            if (distanceToBottom > delta) {
              el.scrollTo({
                top: el.scrollHeight,
                behavior: "smooth",
              });
            }
          }}
          className="bottom-3 left-1/2 -translate-x-1/2 z-50 
                 h-8 w-8 flex items-center justify-center 
                 bg-white border border-[#E0E0E0] rounded-full 
                 cursor-pointer shadow-md hover:scale-110 
                 transition-transform sticky"
        >
          <Icon src={WIDEARROWSVG} />
        </motion.div>
      ) : (
        <div></div>
      )}
    </div>
  );
});

export default ChatView;
