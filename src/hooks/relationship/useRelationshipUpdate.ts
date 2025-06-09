
import { useAuth } from "@/context/AuthContext";
import { updateRelationshipStatus } from "@/services/safetyReviews";
import { RelationshipStatus } from "@/types/relationship";
import { ProfileType } from "@/types/profile";
import { useToast } from "@/hooks/use-toast";
import { useUpdateResultHandler } from "./useUpdateResultHandler";
import { usePartnerVerification } from "./usePartnerVerification";
import { Partner } from "@/types/relationship";

interface UpdateParams {
  status: string;
  partner: string;
  partners: string[];
  privateStatus: string;
  privatePartner: string;
  privatePartners: string[];
  lookingFor: string[];
  potentialPartners: Partner[];
  setIsUpdating: (value: boolean) => void;
  setError: (error: string | null) => void;
}

export const useRelationshipUpdate = (params: UpdateParams) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { handleUpdateResult } = useUpdateResultHandler(params.potentialPartners);
  const { verifyPartnerExists, verifyPartnersExist } = usePartnerVerification(params.potentialPartners);

  const handleUpdateStatus = async (profileType: ProfileType = "public") => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to update your relationship status",
        variant: "destructive"
      });
      return;
    }
    
    params.setIsUpdating(true);
    params.setError(null);
    
    try {
      // Get the appropriate status and partners based on profile type
      const currentStatus = profileType === "private" ? params.privateStatus : params.status;
      const currentPartner = profileType === "private" ? params.privatePartner : params.partner;
      const currentPartners = profileType === "private" ? params.privatePartners : params.partners;
      
      // Different handling based on relationship type
      if (currentStatus === RelationshipStatus.Polyamorous) {
        // For polyamorous, we use multiple partners
        if (currentPartners.length > 0) {
          const allPartnersExist = verifyPartnersExist(currentPartners);
          if (!allPartnersExist) {
            console.error("One or more selected partners not found in potential partners list");
            toast({
              title: "Update failed",
              description: "One or more selected partners don't exist or are no longer available",
              variant: "destructive"
            });
            params.setError("One or more selected partners not found in available partners list");
            params.setIsUpdating(false);
            return;
          }
        }
        
        const result = await updateRelationshipStatus({
          userId: user.id,
          maritalStatus: currentStatus,
          partnerIds: currentPartners.length > 0 ? currentPartners : undefined,
          profileType,
          lookingFor: profileType === "private" ? params.lookingFor : undefined
        });
        
        handleUpdateResult(result, currentStatus, currentPartners, profileType);
      } else if (currentStatus !== RelationshipStatus.Single && currentPartner) {
        // For non-single non-polyamorous relationships, we use a single partner
        const partnerExists = verifyPartnerExists(currentPartner);
        if (!partnerExists) {
          console.error("Selected partner not found in potential partners list");
          toast({
            title: "Update failed",
            description: "The selected partner doesn't exist or is no longer available",
            variant: "destructive"
          });
          params.setError("Selected partner not found in available partners list");
          params.setIsUpdating(false);
          return;
        }
        
        const result = await updateRelationshipStatus({
          userId: user.id,
          maritalStatus: currentStatus,
          partnerId: currentPartner,
          profileType,
          lookingFor: profileType === "private" ? params.lookingFor : undefined
        });
        
        handleUpdateResult(result, currentStatus, [currentPartner], profileType);
      } else {
        // For single status
        const result = await updateRelationshipStatus({
          userId: user.id,
          maritalStatus: currentStatus,
          profileType,
          lookingFor: profileType === "private" ? params.lookingFor : undefined
        });
        
        handleUpdateResult(result, currentStatus, [], profileType);
      }
    } catch (error) {
      console.error("Error updating relationship status:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      params.setError(errorMessage);
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      params.setIsUpdating(false);
    }
  };

  return {
    handleUpdateStatus,
    verifyPartnerExists,
    verifyPartnersExist
  };
};
