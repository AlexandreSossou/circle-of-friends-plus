
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateRelationshipStatus } from "@/services/safetyReviews";
import { fetchPotentialPartners, fetchCurrentStatus } from "@/services/relationship";
import { Partner, RelationshipStatus } from "@/types/relationship";
import { useToast } from "@/hooks/use-toast";

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
    const loadPartners = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const partners = await fetchPotentialPartners(user.id);
        setPotentialPartners(partners);
      } catch (err) {
        console.error("Exception when fetching potential partners:", err);
        setError("Failed to fetch available partners");
        setPotentialPartners([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPartners();
  }, [user]);
  
  useEffect(() => {
    const loadCurrentStatus = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        const currentStatus = await fetchCurrentStatus(user.id);
        
        if (currentStatus.marital_status) {
          setStatus(currentStatus.marital_status);
        }
        if (currentStatus.partner_id) {
          setPartner(currentStatus.partner_id);
        }
      } catch (err) {
        console.error("Exception when fetching current status:", err);
        setError("Failed to fetch your current relationship status");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCurrentStatus();
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

// Export types from the main types file
export type { Partner, RelationshipStatus } from "@/types/relationship";
