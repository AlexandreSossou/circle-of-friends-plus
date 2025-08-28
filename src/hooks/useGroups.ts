import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Group, GroupFormData } from "@/types/group";
import { useAuth } from "@/context/AuthContext";

export const useGroups = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's groups
  const { data: userGroups = [], isLoading: isLoadingUserGroups } = useQuery({
    queryKey: ["userGroups", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: groupsData, error: groupsError } = await supabase
        .from("groups")
        .select(`
          *,
          group_members!inner (
            role,
            user_id
          )
        `)
        .eq("group_members.user_id", user.id);

      if (groupsError) throw groupsError;

      // Get member counts for each group
      const groupIds = groupsData?.map(g => g.id) || [];
      if (groupIds.length === 0) return [];

      const { data: memberCounts, error: countError } = await supabase
        .from("group_members")
        .select("group_id")
        .in("group_id", groupIds);

      if (countError) throw countError;

      // Count members per group
      const countMap = new Map<string, number>();
      memberCounts?.forEach(m => {
        countMap.set(m.group_id, (countMap.get(m.group_id) || 0) + 1);
      });

      return groupsData?.map(group => ({
        ...group,
        member_count: countMap.get(group.id) || 0,
        user_role: group.group_members[0]?.role
      })) as Group[];
    },
    enabled: !!user,
  });

  // Fetch public groups for discovery
  const { data: publicGroups = [], isLoading: isLoadingPublicGroups } = useQuery({
    queryKey: ["publicGroups"],
    queryFn: async () => {
      const { data: groupsData, error: groupsError } = await supabase
        .from("groups")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (groupsError) throw groupsError;

      // Get member counts
      const groupIds = groupsData?.map(g => g.id) || [];
      if (groupIds.length === 0) return [];

      const { data: memberCounts, error: countError } = await supabase
        .from("group_members")
        .select("group_id")
        .in("group_id", groupIds);

      if (countError) throw countError;

      const countMap = new Map<string, number>();
      memberCounts?.forEach(m => {
        countMap.set(m.group_id, (countMap.get(m.group_id) || 0) + 1);
      });

      return groupsData?.map(group => ({
        ...group,
        member_count: countMap.get(group.id) || 0
      })) as Group[];
    },
    enabled: !!user,
  });

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (data: GroupFormData) => {
      if (!user) throw new Error("You must be logged in to create groups");

      // Create the group
      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .insert({
          name: data.name,
          description: data.description || null,
          category: data.category,
          created_by: user.id,
          is_public: data.is_public
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as admin
      const { error: memberError } = await supabase
        .from("group_members")
        .insert({
          group_id: groupData.id,
          user_id: user.id,
          role: "admin"
        });

      if (memberError) throw memberError;

      return groupData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userGroups"] });
      queryClient.invalidateQueries({ queryKey: ["publicGroups"] });
      toast({
        title: "Success!",
        description: "Group created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create group",
        variant: "destructive",
      });
    },
  });

  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      if (!user) throw new Error("You must be logged in to join groups");

      const { error } = await supabase
        .from("group_members")
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: "member"
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userGroups"] });
      toast({
        title: "Success!",
        description: "You've joined the group.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join group",
        variant: "destructive",
      });
    },
  });

  return {
    userGroups,
    publicGroups,
    isLoadingUserGroups,
    isLoadingPublicGroups,
    createGroupMutation,
    joinGroupMutation,
  };
};