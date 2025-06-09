
import { PartnerUpdateData } from "./types";

export const buildProfileUpdateData = (
  maritalStatus: string,
  partnerId?: string,
  partnerIds?: string[],
  profileType: 'public' | 'private' = "public",
  lookingFor?: string[]
): PartnerUpdateData => {
  const isPolyamorous = maritalStatus === "Polyamorous";
  let updateData: PartnerUpdateData = {};
  
  if (profileType === "private") {
    updateData.private_marital_status = maritalStatus;
    
    if (isPolyamorous) {
      updateData.private_partners = partnerIds || [];
      updateData.private_partner_id = partnerIds && partnerIds.length > 0 ? partnerIds[0] : null;
    } else {
      updateData.private_partner_id = partnerId || null;
      updateData.private_partners = [];
    }
  } else {
    updateData.marital_status = maritalStatus;
    
    if (isPolyamorous) {
      updateData.partners = partnerIds || [];
      updateData.partner_id = partnerIds && partnerIds.length > 0 ? partnerIds[0] : null;
    } else {
      updateData.partner_id = partnerId || null;
      updateData.partners = [];
    }
  }
  
  // Add looking_for if provided
  if (lookingFor !== undefined) {
    updateData.looking_for = lookingFor;
  }
  
  return updateData;
};
