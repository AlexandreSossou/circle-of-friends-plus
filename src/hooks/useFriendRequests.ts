import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface FriendRequest {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
  profile: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
}

export const useFriendRequests = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch incoming friend requests
  const { data: incomingRequests = [], isLoading } = useQuery({
    queryKey: ["friendRequests", "incoming"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("friends")
        .select(`
          id,
          user_id,
          friend_id,
          status,
          created_at,
          user_profile:profiles!user_id(id, full_name, avatar_url)
        `)
        .eq("friend_id", user.id)
        .eq("status", "pending");

      if (error) {
        console.error("Error fetching friend requests:", error);
        return [];
      }

      return data?.map(request => ({
        id: request.id,
        user_id: request.user_id,
        friend_id: request.friend_id,
        status: request.status,
        created_at: request.created_at,
        profile: request.user_profile
      })) || [];
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  // Accept friend request mutation
  const acceptRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from("friends")
        .update({ status: "accepted" })
        .eq("id", requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friendshipStatus"] });
      toast({
        title: "Friend request accepted",
        description: "You are now Lovarinos!",
      });
    },
    onError: (error) => {
      console.error("Error accepting friend request:", error);
      toast({
        title: "Error",
        description: "Failed to accept friend request",
        variant: "destructive",
      });
    },
  });

  // Decline friend request mutation
  const declineRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from("friends")
        .delete()
        .eq("id", requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      toast({
        title: "Friend request declined",
      });
    },
    onError: (error) => {
      console.error("Error declining friend request:", error);
      toast({
        title: "Error",
        description: "Failed to decline friend request",
        variant: "destructive",
      });
    },
  });

  // Send friend request mutation
  const sendRequestMutation = useMutation({
    mutationFn: async (friendId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if request already exists
      const { data: existing } = await supabase
        .from("friends")
        .select("id")
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`);

      if (existing && existing.length > 0) {
        throw new Error("Friend request already exists");
      }

      const { error } = await supabase
        .from("friends")
        .insert({
          user_id: user.id,
          friend_id: friendId,
          status: "pending"
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendshipStatus"] });
      toast({
        title: "Success",
        description: "Lovarino request sent!",
      });
    },
    onError: (error: any) => {
      console.error("Error sending friend request:", error);
      const message = error.message === "Friend request already exists" 
        ? "Friend request already exists or you are already friends"
        : "Failed to send Lovarino request";
      
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  return {
    incomingRequests,
    isLoading,
    acceptRequest: acceptRequestMutation.mutate,
    declineRequest: declineRequestMutation.mutate,
    sendRequest: sendRequestMutation.mutate,
    isAccepting: acceptRequestMutation.isPending,
    isDeclining: declineRequestMutation.isPending,
    isSending: sendRequestMutation.isPending,
  };
};