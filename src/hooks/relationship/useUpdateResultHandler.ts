
import { Partner, RelationshipStatus } from "@/types/relationship";
import { ProfileType } from "@/types/profile";
import { useToast } from "@/hooks/use-toast";

export const useUpdateResultHandler = (potentialPartners: Partner[]) => {
  const { toast } = useToast();

  const handleUpdateResult = (result: any, status: string, partnersList: string[], profileType: ProfileType) => {
    if (result.success) {
      let description = "";
      const profileTypeText = profileType === "private" ? "private" : "public";
      
      if (status === RelationshipStatus.Single) {
        description = `Your ${profileTypeText} relationship status has been updated to Single.`;
      } else if (status === RelationshipStatus.Polyamorous) {
        const partnerNames = partnersList
          .map(id => potentialPartners.find(p => p.id === id)?.full_name || "a partner")
          .join(", ");
        description = `Your ${profileTypeText} relationship status has been updated to ${status} with ${partnerNames || "no partners yet"}.`;
      } else {
        const partnerName = partnersList[0] ? 
          potentialPartners.find(p => p.id === partnersList[0])?.full_name || "your partner" : 
          "your partner";
        description = `Your ${profileTypeText} relationship status has been updated to ${status} with ${partnerName}.`;
      }
      
      toast({
        title: "Status updated",
        description
      });
    } else {
      const errorMessage = result.error || "Failed to update relationship status";
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return { handleUpdateResult };
};
