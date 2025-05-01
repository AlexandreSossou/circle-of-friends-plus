
import React from 'react';
import { LiveSession } from './LiveSessionCard';
import LiveSessionCard from './LiveSessionCard';
import { useCalmMode } from '@/context/CalmModeContext';

interface LiveSessionsListProps {
  sessions: LiveSession[];
  onJoinSession: (sessionId: string) => void;
}

const LiveSessionsList = ({ sessions, onJoinSession }: LiveSessionsListProps) => {
  const liveSessions = sessions.filter(session => session.isLive);
  const upcomingSessions = sessions.filter(session => !session.isLive);
  const { calmMode } = useCalmMode();
  
  return (
    <div className="space-y-6">
      {liveSessions.length > 0 && (
        <div>
          <h2 className={`text-xl font-bold mb-4 ${calmMode ? 'text-calm-text' : ''}`}>Live Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveSessions.map(session => (
              <LiveSessionCard 
                key={session.id} 
                session={session} 
                onJoin={onJoinSession} 
              />
            ))}
          </div>
        </div>
      )}
      
      {upcomingSessions.length > 0 && (
        <div>
          <h2 className={`text-xl font-bold mb-4 ${calmMode ? 'text-calm-text' : ''}`}>Upcoming Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingSessions.map(session => (
              <LiveSessionCard 
                key={session.id} 
                session={session} 
                onJoin={onJoinSession} 
              />
            ))}
          </div>
        </div>
      )}
      
      {sessions.length === 0 && (
        <div className="text-center py-12">
          <h3 className={`text-lg font-medium ${calmMode ? 'text-calm-text' : 'text-gray-800'}`}>No Live Sessions Available</h3>
          <p className={`${calmMode ? 'text-calm-textSecondary' : 'text-social-textSecondary'} mt-2`}>Check back later for upcoming live sessions with our staff.</p>
        </div>
      )}
    </div>
  );
};

export default LiveSessionsList;
