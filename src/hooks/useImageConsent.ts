import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ConsentRequest {
  id: string;
  post_id: string;
  tagged_user_id: string;
  tagged_by_user_id: string;
  consent_status: 'pending' | 'approved' | 'denied';
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

export const useImageConsent = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending consent requests for current user
  const { data: pendingRequests = [], isLoading } = useQuery({
    queryKey: ['image-consent-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('image_consent')
        .select('*')
        .eq('tagged_user_id', user.id)
        .eq('consent_status', 'pending');

      if (error) throw error;

      // Fetch profile data for each request
      const requestsWithProfiles = await Promise.all(
        data.map(async (request) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', request.tagged_by_user_id)
            .single();

          return {
            ...request,
            profiles: profile || { full_name: 'Unknown User', avatar_url: '/placeholder.svg' }
          };
        })
      );

      return requestsWithProfiles as ConsentRequest[];
    },
    enabled: !!user
  });

  // Update consent status
  const updateConsentMutation = useMutation({
    mutationFn: async ({ consentId, status }: { consentId: string; status: 'approved' | 'denied' }) => {
      const { error } = await supabase
        .from('image_consent')
        .update({ consent_status: status, updated_at: new Date().toISOString() })
        .eq('id', consentId);

      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['image-consent-requests'] });
      toast({
        title: status === 'approved' ? "Image approved" : "Image denied",
        description: `You have ${status} the image consent request.`
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update consent status",
        variant: "destructive"
      });
    }
  });

  const approveConsent = (consentId: string) => {
    updateConsentMutation.mutate({ consentId, status: 'approved' });
  };

  const denyConsent = (consentId: string) => {
    updateConsentMutation.mutate({ consentId, status: 'denied' });
  };

  return {
    pendingRequests,
    isLoading,
    approveConsent,
    denyConsent,
    isUpdating: updateConsentMutation.isPending
  };
};