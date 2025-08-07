
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import LiveSessionsList from '@/components/live/LiveSessionsList';
import LiveSessionViewer from '@/components/live/LiveSessionViewer';
import StartLiveSessionDialog from '@/components/live/StartLiveSessionDialog';
import { useLiveSessions } from '@/hooks/useLiveSessions';
import { useCalmMode } from '@/context/CalmModeContext';
import { useUserRole } from '@/hooks/useUserRole';

const LiveSessions = () => {
  const { sessions, activeSession, isViewingLive, joinSession, leaveSession, startSession } = useLiveSessions();
  const { calmMode } = useCalmMode();
  const { hasModeratorAccess } = useUserRole();

  return (
    <MainLayout>
      <div className={`social-card ${calmMode ? 'bg-calm-card border-calm-border' : ''}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold ${calmMode ? 'text-calm-text' : ''}`}>Staff Live Sessions</h1>
          {hasModeratorAccess && (
            <StartLiveSessionDialog onStartSession={startSession} />
          )}
        </div>
        
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
