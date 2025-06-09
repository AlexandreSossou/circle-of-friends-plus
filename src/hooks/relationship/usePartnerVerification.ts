
import { Partner } from "@/types/relationship";

export const usePartnerVerification = (potentialPartners: Partner[]) => {
  const verifyPartnerExists = (partnerId: string): boolean => {
    return potentialPartners.some(p => p.id === partnerId);
  };

  const verifyPartnersExist = (partnerIds: string[]): boolean => {
    return partnerIds.every(id => potentialPartners.some(p => p.id === id));
  };

  return {
    verifyPartnerExists,
    verifyPartnersExist
  };
};
