import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateRelationshipStatus } from "@/services/safetyReviews";
import { supabase } from "@/integrations/supabase/client";
import { mockProfiles } from "@/services/mocks/mockProfiles";
import { useToast } from "@/hooks/use-toast";

export interface Partner {
  id: string;
  full_name: string;
}

export enum RelationshipStatus {
  Single = "Single",
  InRelationship = "In a relationship",
  Engaged = "Engaged",
  Married = "Married",
  Complicated = "It's complicated",
  OpenRelationship = "Open relationship",
  JustDating = "Just dating"
}

export const useRelationshipStatus = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<string>(RelationshipStatus.Single);
  const [partner, setPartner] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [potentialPartners, setPotentialPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Fetching profiles from database...");
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name')
          .neq('id', user.id);
        
        if (error) {
          console.error("Error fetching profiles:", error);
          setError("Failed to fetch profiles from database");
          useMockProfiles();
          return;
        }
        
        if (data && data.length > 0) {
          console.log("Got profiles from database:", data.length);
          const validProfiles = data
            .filter(profile => profile && profile.id)
            .map(profile => ({
              id: profile.id,
              full_name: profile.full_name || `User ${profile.id.substring(0, 8)}`
            }));
            
          setPotentialPartners(validProfiles);
        } else {
          console.log("No profiles found in database, using mock data");
          useMockProfiles();
        }
      } catch (err) {
        console.error("Exception when fetching profiles:", err);
        setError("Unexpected error when fetching profiles");
        useMockProfiles();
      } finally {
        setIsLoading(false);
      }
    };
    
    const useMockProfiles = () => {
      console.log("Using mock profiles as partners");
      try {
        const mockPartners = Object.values(mockProfiles)
          .filter(profile => profile && profile.id && profile.id !== user?.id)
          .map(profile => ({
            id: profile.id,
            full_name: profile.full_name || `User ${profile.id.substring(0, 8)}`
          }));
        
        setPotentialPartners(mockPartners);
        console.log("Available mock partners:", mockPartners.length);
      } catch (error) {
        console.error("Error processing mock profiles:", error);
        setPotentialPartners([]);
        setError("Failed to process mock profile data");
      }
    };
    
    fetchProfiles();
  }, [user]);
  
  useEffect(() => {
    const fetchCurrentStatus = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('marital_status, partner_id')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error("Error fetching current status:", error);
          
          if (mockProfiles[user.id]) {
            const mockUser = mockProfiles[user.id];
            if (mockUser.marital_status) {
              setStatus(mockUser.marital_status);
            }
            if (mockUser.partner_id) {
              setPartner(mockUser.partner_id);
            }
          }
          return;
        }
        
        if (data) {
          if (data.marital_status) {
            setStatus(data.marital_status);
          }
          if (data.partner_id) {
            setPartner(data.partner_id);
          }
        }
      } catch (err) {
        console.error("Exception when fetching current status:", err);
        setError("Failed to fetch your current relationship status");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCurrentStatus();
  }, [user]);

  const verifyPartnerExists = (partnerId: string): boolean => {
    return potentialPartners.some(p => p.id === partnerId);
  };

  const handleUpdateStatus = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to update your relationship status",
        variant: "destructive"
      });
      return;
    }
    
    setIsUpdating(true);
    setError(null);
    
    try {
      if (status !== RelationshipStatus.Single && partner) {
        const partnerExists = verifyPartnerExists(partner);
        if (!partnerExists) {
          console.error("Selected partner not found in potential partners list");
          toast({
            title: "Update failed",
            description: "The selected partner doesn't exist or is no longer available",
            variant: "destructive"
          });
          setError("Selected partner not found in available partners list");
          setIsUpdating(false);
          return;
        }
      }
      
      const result = await updateRelationshipStatus({
        userId: user.id,
        maritalStatus: status,
        partnerId: status === RelationshipStatus.Single ? undefined : partner || undefined
      });
      
      if (result.success) {
        const partnerName = status !== RelationshipStatus.Single && partner 
          ? potentialPartners.find(p => p.id === partner)?.full_name || "your partner"
          : "";
          
        toast({
          title: "Status updated",
          description: status === RelationshipStatus.Single 
            ? "Your relationship status has been updated to Single."
            : `Your relationship status has been updated to ${status} with ${partnerName}.`
        });
      } else {
        const errorMessage = result.error || "Failed to update relationship status";
        setError(errorMessage);
        toast({
          title: "Update failed",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error updating relationship status:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const resetError = () => setError(null);

  return {
    status,
    setStatus,
    partner,
    setPartner,
    isUpdating,
    isLoading,
    error,
    resetError,
    potentialPartners,
    handleUpdateStatus,
    verifyPartnerExists
  };
};
