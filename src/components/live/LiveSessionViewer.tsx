
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
import { useLanguage } from '@/context/LanguageContext';

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
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState(session.language || 'en');
  const { user } = useAuth();
  const { toast } = useToast();
  const { calmMode } = useCalmMode();
  const { t } = useLanguage();
  
  // Available languages for this session (in a real app, this would come from the API)
  // For demo, we'll simulate multiple language streams for the same session
  const availableLanguages = ['en', 'es', 'fr', 'de', session.language].filter((v, i, a) => a.indexOf(v) === i);
  
  // Handle stream connection and simulate loading/errors
  useEffect(() => {
    if (isOpen) {
      // Simulate connection loading
      setIsLoading(true);
      setHasError(false);
      
      const loadingTimer = setTimeout(() => {
        setIsLoading(false);
        
        // Simulate random errors (1 in 10 chance for demo purposes)
        if (Math.random() < 0.1) {
          setHasError(true);
          setErrorMessage('Could not connect to the stream. Please try again later.');
          
          toast({
            title: "Connection failed",
            description: "Unable to connect to the live stream. Please try again.",
            variant: "destructive",
          });
        } else {
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
        }
      }, 2000); // Simulate 2 seconds loading time
      
      // Simulate other viewers joining
      const viewerTimer = setInterval(() => {
        if (!hasError) {
          setViewerCount(prev => prev + Math.floor(Math.random() * 2));
        }
      }, 10000);
      
      return () => {
        clearTimeout(loadingTimer);
        clearInterval(viewerTimer);
      };
    }
  }, [isOpen, session, toast, hasError]);
  
  // Handle language change
  const handleLanguageChange = (lang: string) => {
    if (lang === currentLanguage) return;
    
    setIsLoading(true);
    
    // Simulate language stream switching
    setTimeout(() => {
      setIsLoading(false);
      setCurrentLanguage(lang);
      
      toast({
        title: "Language changed",
        description: `Streaming now in ${lang.toUpperCase()}`,
      });
      
      // Add system message about language change
      const langChangeMessage: LiveMessage = {
        id: `lang-change-${Date.now()}`,
        sender: {
          id: 'system',
          name: 'System',
          isStaff: true,
        },
        content: `Stream language changed to ${lang.toUpperCase()}`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, langChangeMessage]);
    }, 1500);
  };
  
  // Handle retry connection
  const handleRetryConnection = () => {
    setIsLoading(true);
    setHasError(false);
    
    // Simulate connection retry
    setTimeout(() => {
      setIsLoading(false);
      
      // 70% chance of successful reconnect for demo purposes
      if (Math.random() < 0.7) {
        toast({
          title: "Connection restored",
          description: "Successfully reconnected to the live stream.",
        });
        
        // Welcome message after reconnect
        const reconnectMessage: LiveMessage = {
          id: `reconnect-${Date.now()}`,
          sender: {
            id: 'system',
            name: 'System',
            isStaff: true,
          },
          content: `Connection restored. Welcome back to "${session.title}"!`,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, reconnectMessage]);
      } else {
        setHasError(true);
        setErrorMessage('Still unable to connect. The stream may be unavailable.');
        
        toast({
          title: "Reconnection failed",
          description: "Still unable to connect to the stream. Please try again later.",
          variant: "destructive",
        });
      }
    }, 2000);
  };
  
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
              <LiveVideoArea 
                isHost={true} 
                onEndStream={onClose}
                isLoading={isLoading}
                hasError={hasError}
                errorMessage={errorMessage}
                onRetryConnection={handleRetryConnection}
                availableLanguages={availableLanguages}
                onLanguageChange={handleLanguageChange}
                currentLanguage={currentLanguage}
              />
            </div>
            
            {/* Chat area - only show if not in error state or if explicitly toggled */}
            {showChat && !isLoading && (
              <LiveChatArea 
                messages={messages}
                message={message}
                setMessage={setMessage}
                handleQuestionSubmit={handleQuestionSubmit}
                disabled={hasError}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LiveSessionViewer;
