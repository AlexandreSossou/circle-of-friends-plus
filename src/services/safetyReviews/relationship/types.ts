
export type RelationshipUpdateParams = {
  userId: string;
  maritalStatus: string;
  partnerId?: string;
  partnerIds?: string[];
  profileType?: 'public' | 'private';
  lookingFor?: string[];
};

export interface PartnerUpdateData {
  marital_status?: string;
  partner_id?: string | null;
  partners?: string[];
  private_marital_status?: string;
  private_partner_id?: string | null;
  private_partners?: string[];
  looking_for?: string[];
}
