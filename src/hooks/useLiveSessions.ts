
import { useState, useEffect, useRef } from 'react';
import { LiveSession } from '@/components/live/LiveSessionCard';
import { useToast } from '@/hooks/use-toast';

// Mock data for demo purposes
const mockSessions: LiveSession[] = [
  {
    id: 'live-1',
    title: 'Community Guidelines Q&A',
    description: 'Join our moderators to learn about community guidelines and ask any questions about content policies.',
    hostName: 'Sarah Johnson',
    scheduledFor: new Date(Date.now() + 1000 * 60 * 5), // 5 minutes from now
    isLive: true,
    viewerCount: 42,
    language: 'en' // English
  },
  {
    id: 'upcoming-1',
    title: 'New Features Walkthrough',
    description: 'A detailed overview of upcoming platform features and improvements. Learn how to make the most of new tools.',
    hostName: 'Alex Rivera',
    scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24), // Tomorrow
    isLive: false,
    viewerCount: 0,
    language: 'es' // Spanish
  },
  {
    id: 'upcoming-2',
    title: 'Meet the Moderators',
    description: 'Get to know our moderation team and learn about how we keep the platform safe and welcoming for everyone.',
    hostName: 'Moderator Team',
    scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days from now
    isLive: false,
    viewerCount: 0,
    language: 'fr' // French
  },
  {
    id: 'live-2',
    title: 'Tech Support Live',
    description: 'Get help with your technical issues in real-time from our support team.',
    hostName: 'Mike Chen',
    scheduledFor: new Date(Date.now() - 1000 * 60 * 30), // Started 30 minutes ago
    isLive: true,
    viewerCount: 28,
    language: 'zh' // Chinese
  },
  {
    id: 'live-3',
    title: 'Wellness Wednesday',
    description: 'Join our wellness coach for tips on staying healthy and balanced.',
    hostName: 'Luisa Fernandez',
    scheduledFor: new Date(Date.now() - 1000 * 60 * 15), // Started 15 minutes ago
    isLive: true,
    viewerCount: 35,
    language: 'pt' // Portuguese
  }
];

export const useLiveSessions = () => {
  const [sessions, setSessions] = useState<LiveSession[]>(mockSessions);
  const [activeSession, setActiveSession] = useState<LiveSession | null>(null);
  const [isViewingLive, setIsViewingLive] = useState(false);
  const joiningRef = useRef(false);
  const { toast } = useToast();
  
  // In a real app, this would fetch from an API
  useEffect(() => {
    // Simulate session updates
    const timer = setInterval(() => {
      setSessions(prev => 
        prev.map(session => {
          // Update live session viewer count
          if (session.isLive) {
            return {
              ...session,
              viewerCount: session.viewerCount + Math.floor(Math.random() * 3)
            };
          }
          
          // Make upcoming sessions go live when their time comes
          if (!session.isLive && new Date(session.scheduledFor) <= new Date()) {
            toast({
              title: "New Live Session",
              description: `"${session.title}" with ${session.hostName} is now live!`,
            });
            
            return {
              ...session,
              isLive: true,
              viewerCount: Math.floor(Math.random() * 20) + 10
            };
          }
          
          return session;
        })
      );
    }, 30000);
    
    return () => clearInterval(timer);
  }, [toast]);
  
  const joinSession = (sessionId: string) => {
    // Prevent opening multiple viewers or rapid double-clicks
    if (joiningRef.current || isViewingLive) {
      return;
    }
    joiningRef.current = true;

    const session = sessions.find(s => s.id === sessionId);
    
    if (session) {
      if (session.isLive) {
        setActiveSession(session);
        setIsViewingLive(true);
        
        // Update session with one more viewer
        setSessions(prev => 
          prev.map(s => 
            s.id === sessionId 
              ? { ...s, viewerCount: s.viewerCount + 1 } 
              : s
          )
        );
      } else {
        // Set reminder functionality would go here
        toast({
          title: "Reminder Set",
          description: `We'll notify you when "${session.title}" goes live.`,
        });
        // Not joining; allow future clicks
        joiningRef.current = false;
        return;
      }
    }
    // Safety: reset joining flag after a short delay in case state batching delays
    setTimeout(() => { joiningRef.current = false; }, 800);
  };
  
  const leaveSession = () => {
    if (activeSession) {
      // Update session with one less viewer
      setSessions(prev => 
        prev.map(s => 
          s.id === activeSession.id
            ? { ...s, viewerCount: Math.max(0, s.viewerCount - 1) } 
            : s
        )
      );
      
      setActiveSession(null);
      setIsViewingLive(false);
      joiningRef.current = false;
    }
  };

  const startSession = (sessionData: { title: string; description: string; language: string }) => {
    const newSession: LiveSession = {
      id: `live-${Date.now()}`,
      title: sessionData.title,
      description: sessionData.description,
      hostName: 'You', // In a real app, this would be the current user's name
      scheduledFor: new Date(),
      isLive: true,
      viewerCount: 1,
      language: sessionData.language
    };

    setSessions(prev => [newSession, ...prev]);
    
    toast({
      title: "Live Session Started",
      description: `"${sessionData.title}" is now live!`,
    });

    return newSession;
  };
  
  return {
    sessions,
    activeSession,
    isViewingLive,
    joinSession,
    leaveSession,
    startSession,
    liveSessions: sessions.filter(session => session.isLive)
  };
};
