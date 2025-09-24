
import { supabase } from "@/integrations/supabase/client";
import { updateRemovedPartners, updateNewPartners } from "./partnerStatusUpdater";

export const handlePartnerUpdates = async (
  userId: string,
  maritalStatus: string,
  partnerId?: string,
  partnerIds?: string[],
  profileType: 'public' | 'private' = "public"
): Promise<void> => {
  console.log(`handlePartnerUpdates called with: userId=${userId}, maritalStatus=${maritalStatus}, partnerId=${partnerId}, partnerIds=${partnerIds}, profileType=${profileType}`);
  
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
    console.log(`Previous partner data: partnerId=${previousPartnerId}, partners=${previousPartnerIds}`);
  }
  
  const isPolyamorous = maritalStatus === "Polyamorous";
  const currentPartners = isPolyamorous ? 
    (partnerIds || []) : 
    (partnerId ? [partnerId] : []);
    
  console.log(`Current partners to update: ${currentPartners}`);
  
  // Partners that are no longer in the relationship
  const allPreviousPartners = [...new Set([
    ...(previousPartnerId ? [previousPartnerId] : []),
    ...previousPartnerIds
  ])].filter(id => id);
  
  const removedPartners = allPreviousPartners.filter(id => !currentPartners.includes(id));
  console.log(`Partners to remove: ${removedPartners}`);
  
  // Update removed partners to Single
  if (removedPartners.length > 0) {
    await updateRemovedPartners(userId, removedPartners, profileType);
  }
  
  // Handle new partners - update their status to match
  if (currentPartners.length > 0 && maritalStatus !== "Single") {
    console.log(`Calling updateNewPartners with partners: ${currentPartners}`);
    await updateNewPartners(userId, currentPartners, maritalStatus, profileType);
  } else {
    console.log(`Skipping updateNewPartners: currentPartners.length=${currentPartners.length}, maritalStatus=${maritalStatus}`);
  }
};
