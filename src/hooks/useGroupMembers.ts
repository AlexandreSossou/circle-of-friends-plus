import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GroupMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    username: string | null;
  };
}

export const useGroupMembers = (groupId: string | undefined) => {
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["groupMembers", groupId],
    queryFn: async () => {
      if (!groupId) return [];

      const { data, error } = await supabase
        .from("group_members")
        .select(`
          id,
          user_id,
          role,
          joined_at,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            username
          )
        `)
        .eq("group_id", groupId)
        .order("joined_at", { ascending: true });

      if (error) throw error;

      return (data || []).map(member => ({
        ...member,
        profile: Array.isArray(member.profiles) ? member.profiles[0] : member.profiles,
      })) as GroupMember[];
    },
    enabled: !!groupId,
  });

  return {
    members,
    isLoading,
  };
};