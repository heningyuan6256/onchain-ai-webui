// chatService.ts

import request from '~/request/request';

const API_URL = '/api/store'; // 替换为你真实部署地址

export interface ChatMessage {
  id: string;
  content: any;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreMessageParams {
  id: string;
  content: any;
  user: string;
}

export const chatService = {
  // ✅ 添加一条消息（POST /api/chat）
  async storeMessage(data: StoreMessageParams): Promise<string> {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to store message');
    return await res.text();
  },

  // ✅ 获取聊天列表（GET /api/chat?chatId=xxx）
  async fetchMessages(chatId: any, api_key: string): Promise<ChatMessage[]> {
    const res = await fetch(
      `${API_URL}?chatId=${!chatId ? '' : encodeURIComponent(chatId)}&user=${api_key}`,
    );
    if (!res.ok) throw new Error('Failed to fetch messages');
    return await res.json();
  },

  // ✅ 更新消息（PUT /api/chat）
  async updateMessage(id: string, newContent: any): Promise<string> {
    const res = await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, content: newContent }),
    });
    if (!res.ok) throw new Error('Failed to update message');
    return await res.text();
  },

  // ✅ 删除消息（DELETE /api/chat?id=xxx）
  async deleteMessage(id: string): Promise<string> {
    const res = await fetch(`${API_URL}?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete message');
    return await res.text();
  },

  // ✅ 修改收藏状态（PATCH /api/chat）
  async toggleFavorite(id: string, isFavorite: boolean): Promise<string> {
    const res = await fetch(API_URL, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_favorite: isFavorite }),
    });
    if (!res.ok) throw new Error('Failed to update favorite');
    return await res.text();
  },
  // 获取应用交互次数
  async getAppTimes(workflowid: string) {
    return await request(`/workflow/system/workflow/app_usenum?workflowid=${workflowid}`, {
      method: 'get',
      headers: { 'Content-Type': 'application/json' },
    });
  },
  // 获取应用的工作流判断是否可以上传文件
  async getIsupload(workflowid: string) {
    return await request(`/workflow/system/workflow/query?workflow_id=${workflowid}`, {
      method: 'get',
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
