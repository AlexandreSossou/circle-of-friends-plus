
import { supabase } from "@/integrations/supabase/client";
import { updateRemovedPartners, updateNewPartners } from "./partnerStatusUpdater";

export const handlePartnerUpdates = async (
  userId: string,
  maritalStatus: string,
  partnerId?: string,
  partnerIds?: string[],
  profileType: 'public' | 'private' = "public"
): Promise<void> => {
  // Store previous partner ids to notify them if relationship status changes
  let previousPartnerId: string | null = null;
  let previousPartnerIds: string[] = [];
  
  const fieldPrefix = profileType === "private" ? "private_" : "";
  const partnerIdField = profileType === "private" ? "private_partner_id" : "partner_id";
  const partnersField = profileType === "private" ? "private_partners" : "partners";
  
  const { data: currentProfile, error: profileError } = await supabase
    .from('profiles')
    .select(`${partnerIdField}, ${partnersField}`)
    .eq('id', userId)
    .single();
    
  if (!profileError && currentProfile) {
    previousPartnerId = currentProfile[partnerIdField] || null;
    previousPartnerIds = currentProfile[partnersField] || [];
  }
  
  const isPolyamorous = maritalStatus === "Polyamorous";
  const currentPartners = isPolyamorous ? 
    (partnerIds || []) : 
    (partnerId ? [partnerId] : []);
  
  // Partners that are no longer in the relationship
  const allPreviousPartners = [...new Set([
    ...(previousPartnerId ? [previousPartnerId] : []),
    ...previousPartnerIds
  ])].filter(id => id);
  
  const removedPartners = allPreviousPartners.filter(id => !currentPartners.includes(id));
  
  // Update removed partners to Single
  if (removedPartners.length > 0) {
    await updateRemovedPartners(userId, removedPartners, profileType);
  }
  
  // Handle new partners - update their status to match
  if (currentPartners.length > 0 && maritalStatus !== "Single") {
    await updateNewPartners(userId, currentPartners, maritalStatus, profileType);
  }
};
