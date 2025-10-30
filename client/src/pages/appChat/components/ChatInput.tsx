import React, { useState, useRef } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputMessage, setInputMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!inputMessage.trim() || isLoading) return;
    onSendMessage(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-6">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="w-full bg-slate-700/50 text-white p-4 rounded-2xl border border-slate-600/50 focus:border-blue-500 focus:outline-none resize-none transition-colors duration-200 placeholder-slate-400"
            disabled={isLoading}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!inputMessage.trim() || isLoading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-indigo-600 shadow-lg hover:shadow-xl"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};