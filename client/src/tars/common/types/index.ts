/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AgentEventStream,
  ChatCompletionContentPart,
  ChatCompletionMessageToolCall,
} from '@multimodal/agent-interface';

export { AgentEventStream };

export type { ChatCompletionContentPart, ChatCompletionMessageToolCall };

/**
 * Session metadata information
 */
export interface SessionMetadata {
  id: string;
  createdAt: number;
  updatedAt: number;
  name?: string;
  workingDirectory: string;
  tags?: string[];
}

/**
 * Tool result type with categorization
 */
export interface ToolResult {
  id: string;
  toolCallId: string;
  name: string;
  content: any;
  timestamp: number;
  error?: string;
  type: 'search' | 'browser' | 'command' | 'image' | 'file' | 'browser_vision_control' | 'other';
  arguments?: any;
  _extra?: { currentScreenshot: string };
}

/**
 * Conversation message with expanded capabilities
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool' | 'environment' | 'final_answer';
  content: string | ChatCompletionContentPart[];
  timestamp: number;
  toolCalls?: ChatCompletionMessageToolCall[];
  thinking?: string;
  toolResults?: ToolResult[];
  isStreaming?: boolean;
  finishReason?: string;
  messageId?: string;
  description?: string; // Added for environment inputs
  isDeepResearch?: boolean; // Added for final answer events
  title?: string; // Added for research report title
}

/**
 * A group of related messages in a conversation
 * Groups are logical units of conversation, typically starting with a user message
 * and including all related assistant responses and tool interactions
 */
export interface MessageGroup {
  messages: Message[];
  isThinking?: boolean;
}

/**
 * Server connection status
 */
export interface ConnectionStatus {
  connected: boolean;
  lastConnected: number | null;
  lastError: string | null;
  reconnecting: boolean;
}

/**
 * Content to be displayed in the workspace panel
 */
export interface PanelContent {
  type:
    | 'search'
    | 'browser'
    | 'command'
    | 'image'
    | 'file'
    | 'plan'
    | 'other'
    | 'browser_vision_control'
    | 'research_report'
    | 'deliverable';
  source: string | ChatCompletionContentPart[];
  title: string;
  timestamp: number;
  toolCallId?: string;
  error?: string;
  arguments?: any; // 添加 arguments 字段
  environmentId?: string;
  originalContent?: string | ChatCompletionContentPart[];
  _extra?: { currentScreenshot: string };
}

/**
 * Replay event marker for visual timeline display
 */
export interface ReplayEventMarker {
  id: string;
  type: AgentEventStream.EventType;
  timestamp: number;
  position: number; // 0-1 normalized position on timeline
  content?: string | any;
}
