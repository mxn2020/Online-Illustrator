import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';

interface ChatMessagesProps {
  message: { role: string; content: string; timestamp: Date };
}

const ChatMessage: React.FC<ChatMessagesProps> = ({ message }) => {
  return (
    <div className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
      <div className={`inline-block p-2 rounded-lg ${
        message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
      }`}>
        <ReactMarkdown
          components={{
            code({node, className, children, ...props}) {
              const match = /language-(\w+)/.exec(className || '')
              return match ? (
                <SyntaxHighlighter
                  {...props}
                  children={String(children).replace(/\n$/, '')}
                  style={tomorrow}
                  language={match[1]}
                  PreTag="div"
                  ref={React.createRef()}
                />
              ) : (
                <code {...props} className={className}>
                  {children}
                </code>
              )
            }
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {message.timestamp.toLocaleTimeString()}
      </div>
    </div>
  );
};

export default ChatMessage;