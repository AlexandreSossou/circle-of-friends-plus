
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
import { useRealtimeSession } from '@/hooks/useRealtimeSession';

interface LiveSessionViewerProps {
  session: LiveSession;
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
}

const LiveSessionViewer = ({ session, isOpen, onClose, onBack }: LiveSessionViewerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { calmMode } = useCalmMode();
  const { t } = useLanguage();
  
  const [showChat, setShowChat] = useState(true);
  const [currentMessage, setCurrentMessage] = useState('');
  const [viewerCount, setViewerCount] = useState(session.viewerCount);
  const [currentLanguage, setCurrentLanguage] = useState(session.language || 'en');
  const [isHost] = useState(user?.id === 'host-id'); // In real app, check if user is the session host
  const [availableLanguages] = useState(['en', 'es', 'fr', 'de', 'it']);
  
  const {
    isConnected,
    isRecording,
    isSpeaking,
    messages,
    error,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    sendTextMessage
  } = useRealtimeSession();
  
  // Connect to realtime session when dialog opens
  useEffect(() => {
    if (isOpen && !isConnected) {
      connect();
    } else if (!isOpen && isConnected) {
      disconnect();
    }
  }, [isOpen, isConnected, connect, disconnect]);
  
  // Clean up when closing
  useEffect(() => {
    if (!isOpen) {
      setCurrentMessage('');
      setViewerCount(session.viewerCount);
    }
  }, [isOpen, session.viewerCount]);
  
  // Start recording on connect for hosts
  useEffect(() => {
    if (isConnected && isHost && !isRecording) {
      startRecording();
    }
  }, [isConnected, isHost, isRecording, startRecording]);
  
  // Simulate viewer count updates
  useEffect(() => {
    if (isConnected) {
      const timer = setInterval(() => {
        setViewerCount(prev => prev + Math.floor(Math.random() * 2));
      }, 10000);
      return () => clearInterval(timer);
    }
  }, [isConnected]);
  
  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
    toast({
      title: "Language Changed",
      description: `Stream language changed to ${language.toUpperCase()}`,
    });
  };
  
  const handleRetryConnection = () => {
    disconnect();
    setTimeout(() => {
      connect();
    }, 1000);
  };
  
  const sendMessage = () => {
    if (!currentMessage.trim()) return;
    
    sendTextMessage(currentMessage.trim());
    setCurrentMessage('');
  };
  
  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
    
    toast({
      title: "Message Sent",
      description: "Your message has been sent.",
    });
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
                isHost={isHost} 
                onEndStream={onClose}
                isLoading={!isConnected}
                hasError={!!error}
                errorMessage={error || ''}
                onRetryConnection={handleRetryConnection}
                availableLanguages={availableLanguages}
                onLanguageChange={handleLanguageChange}
                currentLanguage={currentLanguage}
                isRecording={isRecording}
                isSpeaking={isSpeaking}
              />
            </div>
            
            {/* Chat area - only show if not in error state or if explicitly toggled */}
            {showChat && (
              <LiveChatArea 
                messages={messages}
                currentMessage={currentMessage}
                onMessageChange={setCurrentMessage}
                onSubmitMessage={handleQuestionSubmit}
                disabled={!isConnected}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LiveSessionViewer;
