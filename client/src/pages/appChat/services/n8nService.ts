import { N8NWebhookPayload, N8NWebhookResponse } from '../types/chat';

export class N8NService {
	private webhookUrl: string;

	constructor(webhookUrl: string) {
		this.webhookUrl = webhookUrl;
	}

	async sendMessage(payload: N8NWebhookPayload): Promise<N8NWebhookResponse> {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 seconds timeout

		try {
			const response = await fetch(this.webhookUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const responseText = await response.text();

			// Handle empty response
			if (!responseText.trim()) {
				return { response: 'Response received but empty' };
			}

			try {
				return JSON.parse(responseText);
			} catch (parseError) {
				// If response is not JSON, treat it as plain text response
				return { response: responseText };
			}
		} catch (error) {
			clearTimeout(timeoutId);
			if (error instanceof Error && error.name === 'AbortError') {
				throw new Error('Request timeout - n8n took too long to respond');
			}
			throw error;
		}
	}

	async sendForm(form: FormData): Promise<N8NWebhookResponse> {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 120_000);

		try {
			const response = await fetch(this.webhookUrl, {
				method: 'POST',
				body: form, // 浏览器自动补 Content-Type: multipart/form-data; boundary=...
				signal: controller.signal,
			});

			clearTimeout(timeoutId);
			if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

			const responseText = await response.text();
			if (!responseText.trim()) return { response: 'Response received but empty' };

			try {
				return JSON.parse(responseText);
			} catch {
				return { response: responseText };
			}
		} catch (error) {
			clearTimeout(timeoutId);
			if (error instanceof Error && error.name === 'AbortError') {
				throw new Error('Request timeout - n8n took too long to respond');
			}
			throw error;
		}
	}

	updateWebhookUrl(url: string): void {
		this.webhookUrl = url;
	}
}
