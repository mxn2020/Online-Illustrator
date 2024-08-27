import React, { useEffect, useRef } from 'react';
import ChatMessage from './AIChatbot-ChatMessages-Message';

interface ChatMessagesProps {
  messages: { role: string; content: string; timestamp: Date }[];
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isTyping, messagesEndRef }) => {
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.map((message, index) => (
        <ChatMessage key={index} message={message} />
      ))}
      {isTyping && (
        <div className="text-left">
          <span className="inline-block p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
            <span className="typing-indicator"></span>
          </span>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
