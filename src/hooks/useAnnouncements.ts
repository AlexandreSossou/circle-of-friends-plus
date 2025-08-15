import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Announcement, AnnouncementFormData } from "@/types/announcement";
import { useToast } from "@/hooks/use-toast";
import { canUserCreateAnnouncement } from "@/services/announcementLimits/announcementLimitService";

export const useAnnouncements = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [announcementData, setAnnouncementData] = useState<AnnouncementFormData>({
    title: "",
    description: "",
    location: "",
    category: "general",
    visibility: "public" as "public" | "friends"
  });
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [canCreate, setCanCreate] = useState(true);
  const [limitReason, setLimitReason] = useState<string | undefined>();

  // Check announcement limits when user changes
  useEffect(() => {
    const checkLimits = async () => {
      if (!user) {
        setCanCreate(false);
        return;
      }

      const result = await canUserCreateAnnouncement(user.id);
      setCanCreate(result.canCreate);
      setLimitReason(result.limitReason);
    };

    checkLimits();
  }, [user]);

  // Fetch announcements
  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data: announcementData, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching announcements:", error);
        throw error;
      }

      // Fetch profile data for each announcement
      const announcementsWithProfiles = await Promise.all(
        announcementData.map(async (announcement) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .eq("id", announcement.user_id)
            .single();

          return {
            ...announcement,
            profiles: profileData || { id: announcement.user_id, full_name: null, avatar_url: null }
          };
        })
      );

      return announcementsWithProfiles as Announcement[];
    },
    enabled: !!user,
  });

  // Add announcement mutation
  const addAnnouncementMutation = useMutation({
    mutationFn: async (data: AnnouncementFormData) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("announcements")
        .insert({
          user_id: user.id,
          title: data.title,
          description: data.description,
          location: data.location,
          category: data.category,
          visibility: data.visibility,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      setAnnouncementData({
        title: "",
        description: "",
        location: "",
        category: "general",
        visibility: "public" as "public" | "friends"
      });
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Announcement created successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create announcement: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete announcement mutation
  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast({
        title: "Success",
        description: "Announcement deleted successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete announcement: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof AnnouncementFormData, value: string) => {
    setAnnouncementData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!announcementData.title.trim() || !announcementData.location.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create announcements",
        variant: "destructive",
      });
      return;
    }

    // Check limits before submitting
    const result = await canUserCreateAnnouncement(user.id);
    if (!result.canCreate) {
      toast({
        title: "Announcement Limit Reached",
        description: result.limitReason || "You have reached your announcement limit",
        variant: "destructive",
      });
      return;
    }

    addAnnouncementMutation.mutate(announcementData);
  };

  return {
    announcements,
    isLoading,
    announcementData,
    isAddDialogOpen,
    setIsAddDialogOpen,
    addAnnouncementMutation,
    deleteAnnouncementMutation,
    handleInputChange,
    handleSubmit,
    canCreate,
    limitReason,
  };
};