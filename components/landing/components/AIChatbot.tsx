import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OpenAI from 'openai';
import { ThemeContext, ABTestProvider, GamificationProvider, trackEvent, loadTranslations } from '@/components/landing/tools';
import { useDictionary } from '@/lib/dictionary-provider';
import ChatMessages from './AIChatbot-ChatMessages';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! How can I help you today?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { t } = useDictionary();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(prevMessages => [...prevMessages, { role: 'user', content: input, timestamp: new Date() }]);
    setIsTyping(true);

    const history = messages.map(({ role, content }) => ({
      role: role as "assistant" | "user",
      content
    }));

    const recentHistory = history.slice(-6);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: 'system', content: "You are an admin of the app IllustratorPro. It's a mini version of Illustrator created in new v0 chat mode, with Next.js, Supabase, Stripe. The app is feature-rich and a showcase of a fast deployable tech stack. You only respond to questions about this app and ignore all other questions with a simple response: 'no clue, let's talk about IllustratorPro'." },
          ...recentHistory,
          { role: 'user', content: input }
        ],
        stream: true,
        max_tokens: 30,
      });

      let aiResponse = '';
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: '', timestamp: new Date() }]);

      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          aiResponse += content;
          setMessages(prevMessages => {
            const updatedMessages = [...prevMessages];
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            lastMessage.content = aiResponse;
            return updatedMessages;
          });
        }
      }

    } catch (error) {
      console.error('Error in AI response:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        { role: 'assistant', content: 'Sorry, there was an error processing your request.', timestamp: new Date() }
      ]);
    } finally {
      setIsTyping(false);
      setInput('');
    }
  };

  return (
    <>
      <Button
        className="fixed bottom-4 right-4 rounded-full p-4 shadow-lg hover:scale-105 transition-transform"
        onClick={() => {
          setIsOpen(!isOpen);
          trackEvent('chatbot_toggled', { isOpen: !isOpen });
        }}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="h-96 flex flex-col">
            <ChatMessages 
              messages={messages} 
              isTyping={isTyping} 
              messagesEndRef={messagesEndRef} 
            />
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('chatbot.type_your_message')}
                className="mb-2"
              />
              <Button type="submit" className="w-full">{t('chatbot.send')}</Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AIChatbot;
