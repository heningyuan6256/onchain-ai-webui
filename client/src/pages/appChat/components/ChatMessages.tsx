import React, { useRef, useEffect } from 'react';
import { Message } from '../types/chat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { EmptyState } from './EmptyState';
import './message.css';
import { ThinkingAnimation } from '@/tars/standalone/chat/Message/components/ThinkingAnimation';
interface ChatMessagesProps {
	messages: Message[];
	isLoading: boolean;
	app: any;
	onSubmit: (msg: any) => void;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ app, messages, isLoading, onSubmit }) => {
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	return (
		<div className='chat-container'>
			{messages.length === 0 ? (
				<EmptyState onSubmit={onSubmit} app={app} />
			) : (
				messages.map((message) => <MessageBubble key={message.id} message={message} />)
			)}

			{isLoading && (
				<div style={{ marginLeft: '22px' }}>
					<ThinkingAnimation />
				</div>
			)}
			{/* {isLoading && <TypingIndicator />} */}

			<div ref={messagesEndRef} />
		</div>
	);
};
