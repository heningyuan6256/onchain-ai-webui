import { ChatSession } from "../types/chat";

export class StorageService {
  private static readonly STORAGE_KEY = "chatSessions";

  static saveSessions(sessions: ChatSession[]): void {
    // Note: Using memory storage for demo purposes
    // In production, you might want to use a proper backend
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.warn("Failed to save sessions to storage:", error);
    }
  }

  static loadSessions(): ChatSession[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      return JSON.parse(stored).map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        lastUpdated: new Date(session.lastUpdated),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
    } catch (error) {
      console.warn("Failed to load sessions from storage:", error);
      return [];
    }
  }

  static exportSession(session: ChatSession): void {
    const exportData = {
      sessionTitle: session.title,
      exportDate: new Date().toISOString(),
      messages: session.messages.map((msg) => ({
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-export-${session.title}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
