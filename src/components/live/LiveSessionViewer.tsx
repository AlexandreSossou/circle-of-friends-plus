
import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, MessageSquare, MicOff, Minimize, Users, Video, VideoOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { LiveSession } from './LiveSessionCard';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface LiveSessionViewerProps {
  session: LiveSession;
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
}

interface LiveMessage {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    isStaff?: boolean;
  };
  content: string;
  timestamp: Date;
}

const LiveSessionViewer = ({ session, isOpen, onClose, onBack }: LiveSessionViewerProps) => {
  const [showChat, setShowChat] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [viewerCount, setViewerCount] = useState(session.viewerCount);
  const { user } = useAuth();
  const { toast } = useToast();
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to the bottom of the chat when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
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
      <DialogContent className="w-full max-w-5xl p-0 h-[80vh] max-h-[90vh] overflow-hidden">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              {onBack ? (
                <Button variant="ghost" size="icon" onClick={onBack}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              ) : null}
              <div>
                <h3 className="font-medium">{session.title}</h3>
                <div className="flex items-center gap-2 text-sm text-social-textSecondary">
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {viewerCount} watching
                  </div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="ml-1">LIVE</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setShowChat(!showChat)}>
                <MessageSquare className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Video area */}
            <div className={`${showChat ? 'w-2/3' : 'w-full'} bg-black relative flex items-center justify-center`}>
              {/* Placeholder for video */}
              <div className="text-center text-white">
                <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-medium">Live Session Demo</h3>
                <p className="text-gray-400 mt-2">
                  This is a placeholder for a real video stream.<br />
                  In a real app, this would be connected to a live streaming service.
                </p>
              </div>
              
              {/* Host controls overlay - in a real app, these would only be visible to the host */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-gray-900 bg-opacity-70 px-4 py-2 rounded-full">
                <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800 rounded-full h-10 w-10">
                  <VideoOff className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800 rounded-full h-10 w-10">
                  <MicOff className="h-5 w-5" />
                </Button>
                <Button className="bg-red-500 hover:bg-red-600 rounded-full">
                  End Stream
                </Button>
              </div>
            </div>
            
            {/* Chat area */}
            {showChat && (
              <div className="w-1/3 border-l border-gray-200 flex flex-col bg-white">
                <div className="p-3 border-b border-gray-200">
                  <h4 className="font-medium">Live Chat</h4>
                </div>
                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div key={msg.id} className="flex items-start gap-2">
                        <Avatar className="h-8 w-8">
                          {msg.sender.avatar ? (
                            <AvatarImage src={msg.sender.avatar} />
                          ) : (
                            <AvatarFallback className={msg.sender.isStaff ? "bg-social-blue text-white" : undefined}>
                              {msg.sender.name.charAt(0)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className={`font-medium text-sm ${msg.sender.isStaff ? "text-social-blue" : ""}`}>
                              {msg.sender.name}
                            </span>
                            {msg.sender.isStaff && (
                              <span className="bg-social-blue text-white text-xs px-1 rounded">Staff</span>
                            )}
                          </div>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>
                <form onSubmit={handleQuestionSubmit} className="p-3 border-t border-gray-200">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Ask a question..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit">Send</Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LiveSessionViewer;
