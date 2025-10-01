import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GroupJoinRequest } from "@/types/group";
import { useAuth } from "@/context/AuthContext";

export const useGroupJoinRequests = (groupId: string | undefined) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending requests for a group (admin only)
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["groupJoinRequests", groupId],
    queryFn: async () => {
      if (!groupId) return [];

      const { data, error } = await supabase
        .from("group_join_requests")
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            username
          )
        `)
        .eq("group_id", groupId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map(request => ({
        ...request,
        profile: Array.isArray(request.profiles) ? request.profiles[0] : request.profiles,
      })) as GroupJoinRequest[];
    },
    enabled: !!groupId && !!user,
  });

  // Create join request
  const createRequestMutation = useMutation({
    mutationFn: async ({ groupId, message }: { groupId: string; message: string }) => {
      if (!user) throw new Error("You must be logged in");

      const { error } = await supabase
        .from("group_join_requests")
        .insert({
          group_id: groupId,
          user_id: user.id,
          message,
          status: "pending",
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Request sent!",
        description: "Your join request has been sent to the group admin.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send join request",
        variant: "destructive",
      });
    },
  });

  // Approve request
  const approveRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      if (!user) throw new Error("You must be logged in");

      const { data: request, error: fetchError } = await supabase
        .from("group_join_requests")
        .select("*")
        .eq("id", requestId)
        .single();

      if (fetchError) throw fetchError;

      // Add user to group
      const { error: memberError } = await supabase
        .from("group_members")
        .insert({
          group_id: request.group_id,
          user_id: request.user_id,
          role: "member",
        });

      if (memberError) throw memberError;

      // Update request status
      const { error: updateError } = await supabase
        .from("group_join_requests")
        .update({
          status: "approved",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupJoinRequests", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] });
      toast({
        title: "Request approved!",
        description: "User has been added to the group.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve request",
        variant: "destructive",
      });
    },
  });

  // Reject request
  const rejectRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      if (!user) throw new Error("You must be logged in");

      const { error } = await supabase
        .from("group_join_requests")
        .update({
          status: "rejected",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupJoinRequests", groupId] });
      toast({
        title: "Request rejected",
        description: "Join request has been declined.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject request",
        variant: "destructive",
      });
    },
  });

  return {
    requests,
    isLoading,
    createRequestMutation,
    approveRequestMutation,
    rejectRequestMutation,
  };
};
