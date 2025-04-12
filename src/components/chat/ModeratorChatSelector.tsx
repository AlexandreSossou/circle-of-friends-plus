
import React from 'react';
import { Shield, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ModeratorChatSelectorProps {
  onStartModeratorChat: () => void;
  onCancel: () => void;
}

const ModeratorChatSelector = ({ onStartModeratorChat, onCancel }: ModeratorChatSelectorProps) => {
  const navigate = useNavigate();
  
  const goToLiveSessions = () => {
    navigate('/live-sessions');
    onCancel();
  };
  
  return (
    <div className="h-80 overflow-y-auto p-4 flex flex-col items-center justify-center gap-4 bg-white">
      <div className="p-4 text-center border border-gray-200 rounded-lg">
        <Shield className="h-12 w-12 text-social-blue mx-auto mb-3" />
        <h3 className="font-medium text-lg mb-2">Chat with a Moderator</h3>
        <p className="text-sm text-social-textSecondary mb-4">
          Connect with our staff for support, report issues, or ask questions about our community guidelines.
        </p>
        <Button 
          className="w-full bg-social-blue hover:bg-social-darkblue mb-2"
          onClick={onStartModeratorChat}
        >
          Start Chat
        </Button>
      </div>
      
      <div className="p-4 text-center border border-gray-200 rounded-lg">
        <Video className="h-12 w-12 text-social-red mx-auto mb-3" />
        <h3 className="font-medium text-lg mb-2">Live Sessions</h3>
        <p className="text-sm text-social-textSecondary mb-4">
          Join our staff for live video sessions where you can watch and ask questions in real-time.
        </p>
        <Button 
          className="w-full bg-social-red hover:bg-red-700"
          onClick={goToLiveSessions}
        >
          View Live Sessions
        </Button>
      </div>
      
      <Button 
        variant="ghost"
        size="sm"
        onClick={onCancel}
        className="mt-2"
      >
        Cancel
      </Button>
    </div>
  );
};

export default ModeratorChatSelector;
