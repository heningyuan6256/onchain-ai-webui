import { useState, useEffect } from 'react';
import { ChatSession, Message } from '../types/chat';
import { StorageService } from '../services/storageService';

export const useChatSessions = () => {
	const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
	const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);

	useEffect(() => {
		// Load saved sessions on component mount
		const savedSessions = StorageService.loadSessions();
		setChatSessions(savedSessions);

		// if (savedSessions.length === 0) {
		createNewSession();
		// } else {
		//   setCurrentSessionId(savedSessions[0].id);
		//   setMessages(savedSessions[0].messages);
		// }
	}, []);

	const createNewSession = (): string => {
		const newSession: ChatSession = {
			id: Date.now().toString(),
			title: `Chat ${chatSessions.length + 1}`,
			messages: [],
			createdAt: new Date(),
			lastUpdated: new Date(),
		};

		setChatSessions((prev) => {
			const updated = [newSession, ...prev];
			StorageService.saveSessions(updated);
			return updated;
		});
		setCurrentSessionId(newSession.id);
		setMessages([]);

		return newSession.id;
	};

	const switchSession = (sessionId: string): void => {
		if (currentSessionId) {
			saveCurrentSession();
		}

		const session = chatSessions.find((s) => s.id === sessionId);
		if (session) {
			setCurrentSessionId(sessionId);
			setMessages(session.messages);
		}
	};

	const deleteSession = (sessionId: string): void => {
		setChatSessions((prev) => {
			const filtered = prev.filter((s) => s.id !== sessionId);
			StorageService.saveSessions(filtered);
			return filtered;
		});

		if (currentSessionId === sessionId) {
			const remainingSessions = chatSessions.filter((s) => s.id !== sessionId);
			if (remainingSessions.length > 0) {
				switchSession(remainingSessions[0].id);
			} else {
				createNewSession();
			}
		}
	};

	const saveCurrentSession = (): void => {
		if (!currentSessionId) return;

		setChatSessions((prev) => {
			const updated = prev.map((session) =>
				session.id === currentSessionId
					? {
							...session,
							messages,
							lastUpdated: new Date(),
							title: messages.length > 0 ? messages[0].content.slice(0, 30) + '...' : session.title,
					  }
					: session
			);
			StorageService.saveSessions(updated);
			return updated;
		});
	};

	const updateMessages = (newMessages: Message[]): void => {
		setMessages(newMessages);
		if (currentSessionId) {
			setChatSessions((prev) =>
				prev.map((session) =>
					session.id === currentSessionId
						? {
								...session,
								messages: newMessages,
								lastUpdated: new Date(),
								title: newMessages.length > 0 ? newMessages[0].content.slice(0, 30) + '...' : session.title,
						  }
						: session
				)
			);
		}
	};

	return {
		chatSessions,
		currentSessionId,
		messages,
		createNewSession,
		switchSession,
		deleteSession,
		updateMessages,
		saveCurrentSession,
	};
};
