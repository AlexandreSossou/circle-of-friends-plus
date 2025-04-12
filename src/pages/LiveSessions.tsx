
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import LiveSessionsList from '@/components/live/LiveSessionsList';
import LiveSessionViewer from '@/components/live/LiveSessionViewer';
import { useLiveSessions } from '@/hooks/useLiveSessions';

const LiveSessions = () => {
  const { sessions, activeSession, isViewingLive, joinSession, leaveSession } = useLiveSessions();

  return (
    <MainLayout>
      <div className="social-card">
        <h1 className="text-2xl font-bold mb-6">Staff Live Sessions</h1>
        
        <LiveSessionsList 
          sessions={sessions}
          onJoinSession={joinSession}
        />
        
        {activeSession && (
          <LiveSessionViewer
            session={activeSession}
            isOpen={isViewingLive}
            onClose={leaveSession}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default LiveSessions;
