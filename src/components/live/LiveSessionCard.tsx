
import React from 'react';
import { Calendar, Users, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useCalmMode } from '@/context/CalmModeContext';

export interface LiveSession {
  id: string;
  title: string;
  description: string;
  hostName: string;
  scheduledFor: Date;
  isLive: boolean;
  viewerCount: number;
  language: string;
}

interface LiveSessionCardProps {
  session: LiveSession;
  onJoin: (sessionId: string) => void;
  disabled?: boolean;
}

const LiveSessionCard = ({ session, onJoin, disabled = false }: LiveSessionCardProps) => {
  const formattedDate = new Date(session.scheduledFor).toLocaleString();
  const { calmMode } = useCalmMode();
  
  return (
    <Card className={`shadow-sm hover:shadow-md transition-shadow ${calmMode ? 'bg-calm-card border-calm-border' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className={`text-lg font-semibold ${calmMode ? 'text-calm-text' : ''}`}>{session.title}</h3>
            <p className={`text-sm ${calmMode ? 'text-calm-textSecondary' : 'text-social-textSecondary'}`}>Hosted by {session.hostName}</p>
          </div>
          {session.isLive && (
            <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <span className="h-2 w-2 bg-white rounded-full animate-pulse inline-block"></span>
              LIVE
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <p className={`text-sm mb-3 ${calmMode ? 'text-calm-text' : ''}`}>{session.description}</p>
        <div className={`flex flex-col gap-1 text-xs ${calmMode ? 'text-calm-textSecondary' : 'text-social-textSecondary'}`}>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{session.viewerCount} viewers</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className={`w-full ${session.isLive 
            ? calmMode 
              ? 'bg-red-400 hover:bg-red-500 text-white' 
              : 'bg-social-red hover:bg-red-700' 
            : calmMode 
              ? 'bg-calm-primary hover:bg-calm-primary/90 text-calm-text' 
              : 'bg-social-blue hover:bg-social-darkblue'}`}
          onClick={() => onJoin(session.id)}
          disabled={!!disabled}
        >
          {disabled && session.isLive ? 'Joining…' : (session.isLive ? 'Join Live Now' : 'Set Reminder')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LiveSessionCard;
