
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCalmMode } from '@/context/CalmModeContext';

export interface LiveMessageSender {
  id: string;
  name: string;
  avatar?: string;
  isStaff?: boolean;
}

export interface LiveMessage {
  id: string;
  sender: LiveMessageSender;
  content: string;
  timestamp: Date;
}

interface LiveChatMessageProps {
  message: LiveMessage;
}

const LiveChatMessage: React.FC<LiveChatMessageProps> = ({ message }) => {
  const { calmMode } = useCalmMode();
  
  return (
    <div className="flex items-start gap-2">
      <Avatar className="h-8 w-8">
        {message.sender.avatar ? (
          <AvatarImage src={message.sender.avatar} />
        ) : (
          <AvatarFallback className={message.sender.isStaff ? `${calmMode ? 'bg-calm-primary' : 'bg-social-blue'} text-white` : undefined}>
            {message.sender.name.charAt(0)}
          </AvatarFallback>
        )}
      </Avatar>
      <div>
        <div className="flex items-center gap-1">
          <span className={`font-medium text-sm ${message.sender.isStaff ? (calmMode ? 'text-calm-primary' : 'text-social-blue') : (calmMode ? 'text-calm-text' : '')}`}>
            {message.sender.name}
          </span>
          {message.sender.isStaff && (
            <span className={`${calmMode ? 'bg-calm-primary' : 'bg-social-blue'} text-white text-xs px-1 rounded`}>Staff</span>
          )}
        </div>
        <p className={`text-sm ${calmMode ? 'text-calm-text' : ''}`}>{message.content}</p>
      </div>
    </div>
  );
};

export default LiveChatMessage;
