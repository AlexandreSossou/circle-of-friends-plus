
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { LiveSession } from './LiveSessionCard';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCalmMode } from '@/context/CalmModeContext';
import LiveSessionHeader from './viewer/LiveSessionHeader';
import LiveVideoArea from './viewer/LiveVideoArea';
import LiveChatArea from './viewer/LiveChatArea';
import { LiveMessage } from './viewer/LiveChatMessage';

interface LiveSessionViewerProps {
  session: LiveSession;
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
}

const LiveSessionViewer = ({ session, isOpen, onClose, onBack }: LiveSessionViewerProps) => {
  const [showChat, setShowChat] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [viewerCount, setViewerCount] = useState(session.viewerCount);
  const { user } = useAuth();
  const { toast } = useToast();
  const { calmMode } = useCalmMode();
  
  // Simulate joining a live session
  useEffect(() => {
    if (isOpen) {
      // Welcome message
      const welcomeMessage: LiveMessage = {
        id: `welcome-${Date.now()}`,
        sender: {
          id: 'system',
          name: 'System',
          isStaff: true,
        },
        content: `Welcome to "${session.title}" live session with ${session.hostName}! Ask your questions in the chat.`,
        timestamp: new Date(),
      };
      
      setMessages([welcomeMessage]);
      
      // Simulate other viewers joining
      const timer = setInterval(() => {
        setViewerCount(prev => prev + Math.floor(Math.random() * 2));
      }, 10000);
      
      return () => clearInterval(timer);
    }
  }, [isOpen, session]);
  
  const sendMessage = () => {
    if (!message.trim() || !user) return;
    
    // Add the user's message
    const userMessage: LiveMessage = {
      id: `user-${Date.now()}`,
      sender: {
        id: user.id,
        name: user?.user_metadata?.full_name || 'Anonymous',
        avatar: user?.user_metadata?.avatar_url,
      },
      content: message.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    
    // Simulate staff replying to questions sometimes
    if (Math.random() > 0.6) {
      setTimeout(() => {
        const staffMessage: LiveMessage = {
          id: `staff-${Date.now()}`,
          sender: {
            id: 'staff-1',
            name: session.hostName,
            isStaff: true,
          },
          content: `Thanks for your question! ${message.includes('?') ? 'That\'s a great point. Let me address that in the live stream.' : 'I\'ll cover that in a moment.'}`,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, staffMessage]);
      }, 3000 + Math.random() * 5000);
    }
  };
  
  // Handle showing toast notification when user submits a question
  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
    
    if (message.trim().includes('?')) {
      toast({
        title: "Question submitted",
        description: "The staff will try to answer your question during the live session.",
      });
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className={`w-full max-w-5xl p-0 h-[80vh] max-h-[90vh] overflow-hidden ${calmMode ? 'bg-calm-card border-calm-border' : ''}`}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <LiveSessionHeader 
            session={session}
            viewerCount={viewerCount}
            showChat={showChat}
            setShowChat={setShowChat}
            onClose={onClose}
            onBack={onBack}
          />
          
          {/* Main content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Video area */}
            <div className={`${showChat ? 'w-2/3' : 'w-full'}`}>
              <LiveVideoArea isHost={true} />
            </div>
            
            {/* Chat area */}
            {showChat && (
              <LiveChatArea 
                messages={messages}
                message={message}
                setMessage={setMessage}
                handleQuestionSubmit={handleQuestionSubmit}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LiveSessionViewer;
