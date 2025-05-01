
import React from 'react';
import { ArrowLeft, MessageSquare, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiveSession } from '../LiveSessionCard';
import { useCalmMode } from '@/context/CalmModeContext';

interface LiveSessionHeaderProps {
  session: LiveSession;
  viewerCount: number;
  showChat: boolean;
  setShowChat: (show: boolean) => void;
  onClose: () => void;
  onBack?: () => void;
}

const LiveSessionHeader: React.FC<LiveSessionHeaderProps> = ({ 
  session, 
  viewerCount, 
  showChat, 
  setShowChat, 
  onClose, 
  onBack 
}) => {
  const { calmMode } = useCalmMode();
  
  return (
    <div className={`flex items-center justify-between p-3 border-b ${calmMode ? 'border-calm-border' : 'border-gray-200'}`}>
      <div className="flex items-center gap-2">
        {onBack ? (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ) : null}
        <div>
          <h3 className={`font-medium ${calmMode ? 'text-calm-text' : ''}`}>{session.title}</h3>
          <div className={`flex items-center gap-2 text-sm ${calmMode ? 'text-calm-textSecondary' : 'text-social-textSecondary'}`}>
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
  );
};

export default LiveSessionHeader;
