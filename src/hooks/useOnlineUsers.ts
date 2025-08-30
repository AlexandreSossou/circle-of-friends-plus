import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface OnlineUser {
  id: string;
  full_name: string;
  avatar_url: string;
  online_at: string;
}

export const useOnlineUsers = () => {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('online_users');

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const users: OnlineUser[] = [];
        
        Object.keys(presenceState).forEach((userId) => {
          const presences = presenceState[userId];
          if (presences.length > 0) {
            const presence = presences[0] as any;
            // Don't include the current user in the online list
            if (presence.id !== user.id) {
              users.push({
                id: presence.id,
                full_name: presence.full_name,
                avatar_url: presence.avatar_url,
                online_at: presence.online_at
              });
            }
          }
        });
        
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        const newUsers = newPresences
          .map((presence: any) => ({
            id: presence.id,
            full_name: presence.full_name,
            avatar_url: presence.avatar_url,
            online_at: presence.online_at
          }))
          .filter((userData: OnlineUser) => userData.id !== user.id);
        
        setOnlineUsers(prev => {
          const existingIds = prev.map(u => u.id);
          const uniqueNewUsers = newUsers.filter((u: OnlineUser) => !existingIds.includes(u.id));
          return [...prev, ...uniqueNewUsers];
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const leftUserIds = leftPresences.map((presence: any) => presence.id);
        setOnlineUsers(prev => prev.filter(u => !leftUserIds.includes(u.id)));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Get user profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', user.id)
            .single();

          if (profile) {
            // Track current user presence
            await channel.track({
              id: user.id,
              full_name: profile.full_name || 'Anonymous',
              avatar_url: profile.avatar_url || '/placeholder.svg',
              online_at: new Date().toISOString(),
            });
          }
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { onlineUsers };
};