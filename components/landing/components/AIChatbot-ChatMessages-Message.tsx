import React from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import markdown from 'react-syntax-highlighter/dist/esm/languages/hljs/markdown';

SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('markdown', markdown);

interface MessageProps {
  message: {
    role: string;
    content: string;
    timestamp: Date;
  };
}

const ChatMessage: React.FC<MessageProps> = ({ message }) => {
  const { role, content, timestamp } = message;

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderContent = (content: string) => {
    const codeBlockRegex = /```(\w+)?\s*([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }
      const language = match[1] || 'text';
      const code = match[2].trim();
      parts.push(
        <SyntaxHighlighter
          key={match.index}
          language={language}
          style={docco}
          className="rounded-md my-2"
        >
          {code}
        </SyntaxHighlighter>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return parts;
  };

  return (
    <div className={`mb-4 ${role === 'user' ? 'text-right' : 'text-left'}`}>
      <div
        className={`inline-block p-2 rounded-lg ${
          role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <div className="font-bold mb-1">{role === 'user' ? 'You' : 'AI'}</div>
        <div className="whitespace-pre-wrap">{renderContent(content)}</div>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {formatTimestamp(timestamp)}
      </div>
    </div>
  );
};

export default ChatMessage;