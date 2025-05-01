
import React, { FormEvent, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LiveChatMessage, { LiveMessage } from './LiveChatMessage';
import { useCalmMode } from '@/context/CalmModeContext';

interface LiveChatAreaProps {
  messages: LiveMessage[];
  message: string;
  setMessage: (message: string) => void;
  handleQuestionSubmit: (e: FormEvent) => void;
}

const LiveChatArea: React.FC<LiveChatAreaProps> = ({ 
  messages, 
  message, 
  setMessage, 
  handleQuestionSubmit 
}) => {
  const { calmMode } = useCalmMode();
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to the bottom of the chat when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <div className={`w-1/3 border-l ${calmMode ? 'border-calm-border bg-calm-card' : 'border-gray-200 bg-white'} flex flex-col`}>
      <div className={`p-3 border-b ${calmMode ? 'border-calm-border' : 'border-gray-200'}`}>
        <h4 className={`font-medium ${calmMode ? 'text-calm-text' : ''}`}>Live Chat</h4>
      </div>
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {messages.map((msg) => (
            <LiveChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={chatEndRef} />
        </div>
      </ScrollArea>
      <form onSubmit={handleQuestionSubmit} className={`p-3 border-t ${calmMode ? 'border-calm-border' : 'border-gray-200'}`}>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Ask a question..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`flex-1 ${calmMode ? 'bg-calm-muted border-calm-border' : ''}`}
          />
          <Button type="submit" className={calmMode ? 'bg-calm-primary hover:bg-calm-primary/90 text-calm-text' : ''}>Send</Button>
        </div>
      </form>
    </div>
  );
};

export default LiveChatArea;
