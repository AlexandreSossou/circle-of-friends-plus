
import { supabase } from "@/integrations/supabase/client";
import { PartnerUpdateData } from "./types";
import { sendNotificationMessage } from "./notificationService";

export const updateRemovedPartners = async (
  userId: string,
  removedPartners: string[],
  profileType: 'public' | 'private'
): Promise<void> => {
  for (const partnerIdToUpdate of removedPartners) {
    console.log(`Updating removed partner status for: ${partnerIdToUpdate}`);
    
    // Update BOTH public and private profile types to ensure consistency
    const partnerUpdateData: PartnerUpdateData = {
      marital_status: "Single",
      partner_id: null,
      partners: [],
      private_marital_status: "Single",
      private_partner_id: null,
      private_partners: []
    };
    
    const { error: partnerUpdateError } = await supabase
      .from('profiles')
      .update(partnerUpdateData)
      .eq('id', partnerIdToUpdate);
      
    if (partnerUpdateError) {
      console.error(`Error updating removed partner status for ${partnerIdToUpdate}:`, partnerUpdateError);
    } else {
      console.log(`Successfully updated removed partner status to Single for ${partnerIdToUpdate}`);
      
      await sendNotificationMessage(
        userId, 
        partnerIdToUpdate, 
        `Your ${profileType} relationship status has been updated to "Single" because your partner changed their status.`
      );
    }
  }
};

export const updateNewPartners = async (
  userId: string,
  currentPartners: string[],
  maritalStatus: string,
  profileType: 'public' | 'private'
): Promise<void> => {
  const isPolyamorous = maritalStatus === "Polyamorous";
  
  for (const partnerToUpdate of currentPartners) {
    console.log(`Updating new partner status for: ${partnerToUpdate}`);
    
    // Update BOTH public and private profile types to ensure consistency
    let partnerUpdateData: PartnerUpdateData = {};
    
    // Always update both public and private relationship status
    partnerUpdateData.marital_status = maritalStatus;
    partnerUpdateData.private_marital_status = maritalStatus;
    
    if (isPolyamorous) {
      // Fetch existing partner data for both public and private
      const { data: existingPartnerData, error: partnerDataError } = await supabase
        .from('profiles')
        .select('partners, partner_id, private_partners, private_partner_id')
        .eq('id', partnerToUpdate)
        .single();
        
      if (partnerDataError) {
        console.error(`Error fetching partner data for ${partnerToUpdate}:`, partnerDataError);
        continue;
      }
      
      // Update public partners
      const existingPartners = existingPartnerData?.partners || [];
      if (!existingPartners.includes(userId)) {
        partnerUpdateData.partners = [...existingPartners, userId];
      } else {
        partnerUpdateData.partners = existingPartners;
      }
      
      if (!existingPartnerData?.partner_id) {
        partnerUpdateData.partner_id = userId;
      }
      
      // Update private partners
      const existingPrivatePartners = existingPartnerData?.private_partners || [];
      if (!existingPrivatePartners.includes(userId)) {
        partnerUpdateData.private_partners = [...existingPrivatePartners, userId];
      } else {
        partnerUpdateData.private_partners = existingPrivatePartners;
      }
      
      if (!existingPartnerData?.private_partner_id) {
        partnerUpdateData.private_partner_id = userId;
      }
    } else {
      // For non-polyamorous relationships, set single partner for both public and private
      partnerUpdateData.partner_id = userId;
      partnerUpdateData.partners = [];
      partnerUpdateData.private_partner_id = userId;
      partnerUpdateData.private_partners = [];
    }
    
    const { error: newPartnerUpdateError } = await supabase
      .from('profiles')
      .update(partnerUpdateData)
      .eq('id', partnerToUpdate);
      
    if (newPartnerUpdateError) {
      console.error(`Error updating new partner status for ${partnerToUpdate}:`, newPartnerUpdateError);
    } else {
      console.log(`Successfully updated new partner status to ${maritalStatus} for ${partnerToUpdate}`);
      
      let notificationMessage = isPolyamorous
        ? `Your ${profileType} relationship status has been updated to "${maritalStatus}" with a partner.`
        : `Your ${profileType} relationship status has been updated to "${maritalStatus}" with your partner.`;
        
      await sendNotificationMessage(userId, partnerToUpdate, notificationMessage);
    }
  }
};
