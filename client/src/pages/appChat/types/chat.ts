export interface Message {
	id: string;
	content: string;
	sender: 'user' | 'bot';
	timestamp: Date;
	files?: File[];
}

export interface ChatSession {
	id: string;
	title: string;
	messages: Message[];
	createdAt: Date;
	lastUpdated: Date;
}

export interface N8NWebhookPayload {
	chatInput: string;
	sessionId: string | null;
	timestamp: string;
	onchain_userId: string;
}

export interface N8NWebhookResponse {
	response?: string;
	message?: string;
}
