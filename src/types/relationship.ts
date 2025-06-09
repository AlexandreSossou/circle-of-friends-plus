
export enum RelationshipStatus {
  Single = "Single",
  InRelationship = "In a relationship",
  Engaged = "Engaged",
  Married = "Married",
  Complicated = "It's complicated",
  OpenRelationship = "Open relationship",
  JustDating = "Just dating",
  Polyamorous = "Polyamorous"
}

export interface Partner {
  id: string;
  full_name: string;
}

export interface RelationshipUpdateParams {
  userId: string;
  maritalStatus: string;
  partnerId?: string;
  partnerIds?: string[]; // Added for multiple partners
  profileType?: 'public' | 'private'; // Added for profile type
  lookingFor?: string[]; // Added for looking for preferences
}

export interface RelationshipUpdateResult {
  success: boolean;
  data?: any;
  error?: string;
}
