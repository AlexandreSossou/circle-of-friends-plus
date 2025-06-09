
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchPotentialPartners, fetchCurrentStatus } from "@/services/relationship";
import { Partner } from "@/types/relationship";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRelationshipState } from "./relationship/useRelationshipState";
import { useRelationshipUpdate } from "./relationship/useRelationshipUpdate";
import { UseRelationshipStatusReturn } from "./relationship/types";

export const useRelationshipStatus = (): UseRelationshipStatusReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    status,
    setStatus,
    partner,
    setPartner,
    partners,
    setPartners,
    privateStatus,
    setPrivateStatus,
    privatePartner,
    setPrivatePartner,
    privatePartners,
    setPrivatePartners,
    lookingFor,
    setLookingFor,
    isUpdating,
    setIsUpdating,
    isLoading,
    setIsLoading,
    error,
    setError,
    resetError
  } = useRelationshipState();
  
  const [potentialPartners, setPotentialPartners] = useState<Partner[]>([]);
  
  const { handleUpdateStatus, verifyPartnerExists, verifyPartnersExist } = useRelationshipUpdate({
    status,
    partner,
    partners,
    privateStatus,
    privatePartner,
    privatePartners,
    lookingFor,
    potentialPartners,
    setIsUpdating,
    setError
  });
  
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
  }, [user, setIsLoading, setError]);
  
  useEffect(() => {
    const loadCurrentStatus = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        const currentStatus = await fetchCurrentStatus(user.id);
        
        // Public profile relationship data
        if (currentStatus.marital_status) {
          setStatus(currentStatus.marital_status);
        }
        if (currentStatus.partner_id) {
          setPartner(currentStatus.partner_id);
        }
        if (currentStatus.partners) {
          setPartners(currentStatus.partners || []);
        }
        
        // Private profile relationship data
        if (currentStatus.private_marital_status) {
          setPrivateStatus(currentStatus.private_marital_status);
        }
        if (currentStatus.private_partner_id) {
          setPrivatePartner(currentStatus.private_partner_id);
        }
        if (currentStatus.private_partners) {
          setPrivatePartners(currentStatus.private_partners || []);
        }
        
        // Looking for preferences
        if (currentStatus.looking_for) {
          setLookingFor(currentStatus.looking_for || []);
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
          
          // Update public profile relationship state
          if (newData.marital_status) {
            setStatus(newData.marital_status);
          }
          if (newData.partner_id !== undefined) {
            setPartner(newData.partner_id || "");
          }
          if (newData.partners !== undefined) {
            setPartners(newData.partners || []);
          }
          
          // Update private profile relationship state
          if (newData.private_marital_status) {
            setPrivateStatus(newData.private_marital_status);
          }
          if (newData.private_partner_id !== undefined) {
            setPrivatePartner(newData.private_partner_id || "");
          }
          if (newData.private_partners !== undefined) {
            setPrivatePartners(newData.private_partners || []);
          }
          
          // Update looking for preferences
          if (newData.looking_for !== undefined) {
            setLookingFor(newData.looking_for || []);
          }
          
          // Show toast notification about the change
          if (payload.old.marital_status !== newData.marital_status || 
              payload.old.private_marital_status !== newData.private_marital_status) {
            toast({
              title: "Relationship Status Updated",
              description: "Your relationship status has been updated",
            });
          }
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, toast, setStatus, setPartner, setPartners, setPrivateStatus, setPrivatePartner, setPrivatePartners, setLookingFor, setError, setIsLoading]);

  return {
    // Public profile state
    status,
    setStatus,
    partner,
    setPartner,
    partners,
    setPartners,
    
    // Private profile state
    privateStatus,
    setPrivateStatus,
    privatePartner,
    setPrivatePartner,
    privatePartners,
    setPrivatePartners,
    
    // Looking for preferences
    lookingFor,
    setLookingFor,
    
    // Common state
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
