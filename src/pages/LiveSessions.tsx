
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import LiveSessionsList from '@/components/live/LiveSessionsList';
import LiveSessionViewer from '@/components/live/LiveSessionViewer';
import { useLiveSessions } from '@/hooks/useLiveSessions';
import { useCalmMode } from '@/context/CalmModeContext';

const LiveSessions = () => {
  const { sessions, activeSession, isViewingLive, joinSession, leaveSession } = useLiveSessions();
  const { calmMode } = useCalmMode();

  return (
    <MainLayout>
      <div className={`social-card ${calmMode ? 'bg-calm-card border-calm-border' : ''}`}>
        <h1 className={`text-2xl font-bold mb-6 ${calmMode ? 'text-calm-text' : ''}`}>Staff Live Sessions</h1>
        
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
