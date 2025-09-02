import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { LocalAlert, LocalAlertFormData } from "@/types/localAlert";
import { useToast } from "@/hooks/use-toast";
import { canUserCreateLocalAlert } from "@/services/localAlertLimits/localAlertLimitService";

export const useLocalAlerts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [localAlertData, setLocalAlertData] = useState<LocalAlertFormData>({
    title: "",
    description: "",
    location: "",
    category: "",
    visibility: "public",
    duration: "60"
  });
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [canCreate, setCanCreate] = useState(true);
  const [limitReason, setLimitReason] = useState<string | undefined>();

  // Check if user can create local alerts
  useEffect(() => {
    const checkCreateLimits = async () => {
      if (!user?.id) return;
      
      try {
        const result = await canUserCreateLocalAlert(user.id);
        setCanCreate(result.canCreate);
        setLimitReason(result.limitReason);
      } catch (error) {
        console.error("Error checking local alert limits:", error);
        setCanCreate(true);
      }
    };

    checkCreateLimits();
  }, [user?.id]);

  // Fetch local alerts
  const {
    data: localAlerts = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ["localAlerts"],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("announcements")
        .select(`
          *,
          profiles:user_id(
            id,
            full_name,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get profiles for each local alert
      const localAlertsWithProfiles = data?.map(localAlert => ({
        ...localAlert,
        profiles: {
          id: localAlert.user_id,
          full_name: null,
          avatar_url: null
        }
      })) || [];

      return localAlertsWithProfiles as LocalAlert[];
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Add local alert mutation
  const addLocalAlertMutation = useMutation({
    mutationFn: async (formData: LocalAlertFormData) => {
      if (!user?.id) throw new Error("User not authenticated");

      // Check limits before creating
      const limitCheck = await canUserCreateLocalAlert(user.id);
      if (!limitCheck.canCreate) {
        throw new Error(limitCheck.limitReason || "Cannot create local alert");
      }

      // Calculate expiration date
      const now = new Date();
      const expiresAt = new Date(now.getTime() + parseInt(formData.duration) * 60 * 1000);

      const { error } = await supabase
        .from("announcements")
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description || null,
          location: formData.location,
          category: formData.category,
          visibility: formData.visibility,
          expires_at: expiresAt.toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["localAlerts"] });
      toast({
        title: "Success",
        description: "Local alert created successfully",
      });
      setIsAddDialogOpen(false);
      setLocalAlertData({
        title: "",
        description: "",
        location: "",
        category: "",
        visibility: "public",
        duration: "60"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create local alert",
        variant: "destructive",
      });
    },
  });

  // Delete local alert mutation
  const deleteLocalAlertMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["localAlerts"] });
      toast({
        title: "Success",
        description: "Local alert deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to delete local alert",
        variant: "destructive",
      });
    },
  });

  // Handle input changes
  const handleInputChange = (field: keyof LocalAlertFormData, value: string) => {
    setLocalAlertData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!localAlertData.title || !localAlertData.location || !localAlertData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!canCreate) {
      toast({
        title: "Cannot create local alert",
        description: limitReason || "You have reached your local alert limit",
        variant: "destructive",
      });
      return;
    }

    // Check limits again before submitting
    if (user?.id) {
      const limitCheck = await canUserCreateLocalAlert(user.id);
      if (!limitCheck.canCreate) {
        toast({
          title: "Cannot create local alert",
          description: limitCheck.limitReason || "You have reached your local alert limit",
          variant: "destructive",
        });
        return;
      }
    }

    addLocalAlertMutation.mutate(localAlertData);
  };

  return {
    localAlerts,
    isLoading,
    error,
    localAlertData,
    isAddDialogOpen,
    setIsAddDialogOpen,
    deleteLocalAlertMutation,
    handleInputChange,
    handleSubmit,
    canCreate,
    limitReason
  };
};