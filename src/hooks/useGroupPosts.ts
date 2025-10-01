import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export interface GroupPost {
  id: string;
  group_id: string;
  user_id: string;
  parent_post_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  replies?: GroupPost[];
}

export const useGroupPosts = (groupId: string | undefined) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch posts for a group
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["groupPosts", groupId],
    queryFn: async () => {
      if (!groupId) return [];

      const { data, error } = await supabase
        .from("group_posts")
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq("group_id", groupId)
        .is("parent_post_id", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch replies for each post
      const postsWithReplies = await Promise.all(
        (data || []).map(async (post) => {
          const { data: replies, error: repliesError } = await supabase
            .from("group_posts")
            .select(`
              *,
              profiles:user_id (
                id,
                full_name,
                avatar_url
              )
            `)
            .eq("parent_post_id", post.id)
            .order("created_at", { ascending: true });

          if (repliesError) throw repliesError;

          return {
            ...post,
            author: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles,
            replies: (replies || []).map(reply => ({
              ...reply,
              author: Array.isArray(reply.profiles) ? reply.profiles[0] : reply.profiles,
            }))
          } as GroupPost;
        })
      );

      return postsWithReplies;
    },
    enabled: !!groupId && !!user,
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async ({ content, parentPostId }: { content: string; parentPostId?: string }) => {
      if (!user || !groupId) throw new Error("User not authenticated or group not found");

      const { data, error } = await supabase
        .from("group_posts")
        .insert({
          group_id: groupId,
          user_id: user.id,
          content: content.trim(),
          parent_post_id: parentPostId || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupPosts", groupId] });
      toast({
        title: "Posted",
        description: "Your post has been added to the group.",
        duration: 2000,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
        duration: 2000,
      });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from("group_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupPosts", groupId] });
      toast({
        title: "Deleted",
        description: "Post has been removed.",
        duration: 2000,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        variant: "destructive",
        duration: 2000,
      });
    },
  });

  return {
    posts,
    isLoading,
    createPost: createPostMutation.mutate,
    deletePost: deletePostMutation.mutate,
    isCreatingPost: createPostMutation.isPending,
    isDeletingPost: deletePostMutation.isPending,
  };
};