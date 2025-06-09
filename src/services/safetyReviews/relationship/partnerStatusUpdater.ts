
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
    
    const partnerUpdateData: PartnerUpdateData = profileType === "private" ? {
      private_marital_status: "Single",
      private_partner_id: null,
      private_partners: []
    } : {
      marital_status: "Single",
      partner_id: null,
      partners: []
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
    
    let partnerUpdateData: PartnerUpdateData = {};
    
    if (profileType === "private") {
      partnerUpdateData.private_marital_status = maritalStatus;
      
      if (isPolyamorous) {
        const { data: existingPartnerData, error: partnerDataError } = await supabase
          .from('profiles')
          .select('private_partners, private_partner_id')
          .eq('id', partnerToUpdate)
          .single();
          
        if (partnerDataError) {
          console.error(`Error fetching partner data for ${partnerToUpdate}:`, partnerDataError);
          continue;
        }
        
        const existingPartners = existingPartnerData?.private_partners || [];
        
        if (!existingPartners.includes(userId)) {
          partnerUpdateData.private_partners = [...existingPartners, userId];
        } else {
          partnerUpdateData.private_partners = existingPartners;
        }
        
        if (!existingPartnerData?.private_partner_id) {
          partnerUpdateData.private_partner_id = userId;
        }
      } else {
        partnerUpdateData.private_partner_id = userId;
        partnerUpdateData.private_partners = [];
      }
    } else {
      partnerUpdateData.marital_status = maritalStatus;
      
      if (isPolyamorous) {
        const { data: existingPartnerData, error: partnerDataError } = await supabase
          .from('profiles')
          .select('partners, partner_id')
          .eq('id', partnerToUpdate)
          .single();
          
        if (partnerDataError) {
          console.error(`Error fetching partner data for ${partnerToUpdate}:`, partnerDataError);
          continue;
        }
        
        const existingPartners = existingPartnerData?.partners || [];
        
        if (!existingPartners.includes(userId)) {
          partnerUpdateData.partners = [...existingPartners, userId];
        } else {
          partnerUpdateData.partners = existingPartners;
        }
        
        if (!existingPartnerData?.partner_id) {
          partnerUpdateData.partner_id = userId;
        }
      } else {
        partnerUpdateData.partner_id = userId;
        partnerUpdateData.partners = [];
      }
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
