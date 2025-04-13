
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateRelationshipStatus } from "@/services/safetyReviews";
import { fetchPotentialPartners, fetchCurrentStatus } from "@/services/relationship";
import { Partner, RelationshipStatus } from "@/types/relationship";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useRelationshipStatus = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<string>(RelationshipStatus.Single);
  const [partner, setPartner] = useState<string>("");
  const [partners, setPartners] = useState<string[]>([]);
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
        if (currentStatus.partners) {
          setPartners(currentStatus.partners || []);
        }
      } catch (err) {
        console.error("Exception when fetching current status:", err);
        setError("Failed to fetch your current relationship status");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCurrentStatus();
    
    // Set up subscription for real-time updates to the user's profile
    if (user) {
      const channel = supabase
        .channel('profile-changes')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        }, (payload) => {
          console.log("Profile updated:", payload);
          const newData = payload.new;
          
          // Update state with the new data
          if (newData.marital_status) {
            setStatus(newData.marital_status);
          }
          
          if (newData.partner_id !== undefined) {
            setPartner(newData.partner_id || "");
          }

          if (newData.partners !== undefined) {
            setPartners(newData.partners || []);
          }
          
          // Show toast notification about the change if it was changed by someone else
          if (payload.old.marital_status !== newData.marital_status) {
            toast({
              title: "Relationship Status Updated",
              description: `Your relationship status has been changed to ${newData.marital_status}`,
            });
          }
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, toast]);

  const verifyPartnerExists = (partnerId: string): boolean => {
    return potentialPartners.some(p => p.id === partnerId);
  };

  const verifyPartnersExist = (partnerIds: string[]): boolean => {
    return partnerIds.every(id => potentialPartners.some(p => p.id === id));
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
      // Different handling based on relationship type
      if (status === RelationshipStatus.Polyamorous) {
        // For polyamorous, we use multiple partners
        if (partners.length > 0) {
          const allPartnersExist = verifyPartnersExist(partners);
          if (!allPartnersExist) {
            console.error("One or more selected partners not found in potential partners list");
            toast({
              title: "Update failed",
              description: "One or more selected partners don't exist or are no longer available",
              variant: "destructive"
            });
            setError("One or more selected partners not found in available partners list");
            setIsUpdating(false);
            return;
          }
        }
        
        const result = await updateRelationshipStatus({
          userId: user.id,
          maritalStatus: status,
          partnerIds: partners.length > 0 ? partners : undefined
        });
        
        handleUpdateResult(result, status, partners);
      } else if (status !== RelationshipStatus.Single && partner) {
        // For non-single non-polyamorous relationships, we use a single partner
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
        
        const result = await updateRelationshipStatus({
          userId: user.id,
          maritalStatus: status,
          partnerId: partner
        });
        
        handleUpdateResult(result, status, [partner]);
      } else {
        // For single status
        const result = await updateRelationshipStatus({
          userId: user.id,
          maritalStatus: status
        });
        
        handleUpdateResult(result, status, []);
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

  const handleUpdateResult = (result: any, status: string, partnersList: string[]) => {
    if (result.success) {
      let description = "";
      
      if (status === RelationshipStatus.Single) {
        description = "Your relationship status has been updated to Single.";
      } else if (status === RelationshipStatus.Polyamorous) {
        const partnerNames = partnersList
          .map(id => potentialPartners.find(p => p.id === id)?.full_name || "a partner")
          .join(", ");
        description = `Your relationship status has been updated to ${status} with ${partnerNames || "no partners yet"}.`;
      } else {
        const partnerName = partnersList[0] ? 
          potentialPartners.find(p => p.id === partnersList[0])?.full_name || "your partner" : 
          "your partner";
        description = `Your relationship status has been updated to ${status} with ${partnerName}.`;
      }
      
      toast({
        title: "Status updated",
        description
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
  };

  const resetError = () => setError(null);

  return {
    status,
    setStatus,
    partner,
    setPartner,
    partners,
    setPartners,
    isUpdating,
    isLoading,
    error,
    resetError,
    potentialPartners,
    handleUpdateStatus,
    verifyPartnerExists,
    verifyPartnersExist
  };
};

// Export types from the main types file
export type { Partner, RelationshipStatus } from "@/types/relationship";
