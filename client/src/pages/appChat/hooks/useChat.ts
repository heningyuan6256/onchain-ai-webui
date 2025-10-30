// hooks/useChat.ts
import { useState } from 'react';
import { Message } from '../types/chat';
import { N8NService } from '../services/n8nService';

export const useChat = (
	messages: Message[],
	updateMessages: (messages: Message[]) => void,
	currentSessionId: string | null,
	n8nService: N8NService
) => {
	const [isLoading, setIsLoading] = useState(false);

	const sendMessage = async (content: string, files: File[] = []): Promise<void> => {
		if (!content.trim() && files.length === 0) return;
		if (isLoading) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			content,
			sender: 'user',
			timestamp: new Date(),
			files,
		};
		const updatedMessages = [...messages, userMessage];
		updateMessages(updatedMessages);
		setIsLoading(true);

		try {
			let data: N8NWebhookResponse;

			if (files.length === 0) {
				/* 无文件 → JSON */
				const payload: N8NWebhookPayload = {
					action: 'sendMessage',
					sessionId: currentSessionId,
					chatInput: content,
					onchain_userId: '101',
					timestamp: new Date().toISOString(),
				};
				data = await n8nService.sendMessage(payload);
			} else {
				/* 有文件 → FormData */
				const fd = new FormData();
				fd.append('action', 'sendMessage');
				fd.append('sessionId', currentSessionId ?? '');
				fd.append('chatInput', content);
				fd.append('onchain_userId', '101');
				files.forEach((f) => fd.append('files', f));
				data = await n8nService.sendForm(fd);
			}

			const botMessage: Message = {
				id: (Date.now() + 1).toString(),
				content: data.output || data.data || data.response || data.message || 'Sorry, an error occurred during processing',
				sender: 'bot',
				timestamp: new Date(),
			};
			updateMessages([...updatedMessages, botMessage]);
		} catch (error) {
			console.error('Error sending message to n8n:', error);

			let errorContent = 'Sorry, unable to connect to AI system at the moment. Please check your n8n webhook URL configuration.';

			if (error instanceof Error) {
				if (error.message.includes('timeout')) {
					errorContent = 'Request timeout - n8n is taking too long to respond. Please try again.';
				} else if (error.message.includes('HTTP error')) {
					errorContent = `Connection error: ${error.message}. Please check your n8n webhook URL.`;
				} else if (error.message.includes('Failed to fetch')) {
					errorContent = 'Network error - unable to reach n8n webhook. Please check your URL and network connection.';
				}
			}

			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				content: errorContent,
				sender: 'bot',
				timestamp: new Date(),
			};

			const finalMessages = [...updatedMessages, errorMessage];
			updateMessages(finalMessages);
		} finally {
			setIsLoading(false);
		}
	};

	return { sendMessage, isLoading };
};
