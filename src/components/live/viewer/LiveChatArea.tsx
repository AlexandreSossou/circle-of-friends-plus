
import React, { FormEvent, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LiveChatMessage, { LiveMessage } from './LiveChatMessage';
import { useCalmMode } from '@/context/CalmModeContext';
import { AlertCircle } from 'lucide-react';

interface LiveChatAreaProps {
  messages: LiveMessage[];
  currentMessage: string;
  onMessageChange: (message: string) => void;
  onSubmitMessage: (e: FormEvent) => void;
  disabled?: boolean;
}

const LiveChatArea: React.FC<LiveChatAreaProps> = ({ 
  messages, 
  currentMessage, 
  onMessageChange, 
  onSubmitMessage,
  disabled = false
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
        {disabled && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <AlertCircle className={`w-10 h-10 mb-2 ${calmMode ? 'text-calm-primary' : 'text-red-500'}`} />
            <p className={`${calmMode ? 'text-calm-text' : 'text-gray-700'}`}>
              Chat is currently unavailable due to connection issues
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <LiveChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={chatEndRef} />
          </div>
        )}
      </ScrollArea>
      
      <form onSubmit={onSubmitMessage} className={`p-3 border-t ${calmMode ? 'border-calm-border' : 'border-gray-200'}`}>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder={disabled ? "Chat currently unavailable" : "Ask a question..."}
            value={currentMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            className={`flex-1 ${calmMode ? 'bg-calm-muted border-calm-border' : ''}`}
            disabled={disabled}
          />
          <Button 
            type="submit" 
            className={calmMode ? 'bg-calm-primary hover:bg-calm-primary/90 text-calm-text' : ''}
            disabled={disabled || !currentMessage.trim()}
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LiveChatArea;
