
import { Partner } from "@/types/relationship";

export interface RelationshipState {
  // Public profile relationship state
  status: string;
  partner: string;
  partners: string[];
  
  // Private profile relationship state
  privateStatus: string;
  privatePartner: string;
  privatePartners: string[];
  
  // Looking for preferences
  lookingFor: string[];
  
  // Common state
  isUpdating: boolean;
  isLoading: boolean;
  error: string | null;
  potentialPartners: Partner[];
}

export interface RelationshipActions {
  setStatus: (status: string) => void;
  setPartner: (partner: string) => void;
  setPartners: (partners: string[]) => void;
  setPrivateStatus: (status: string) => void;
  setPrivatePartner: (partner: string) => void;
  setPrivatePartners: (partners: string[]) => void;
  setLookingFor: (lookingFor: string[]) => void;
  resetError: () => void;
  handleUpdateStatus: (profileType?: "public" | "private") => Promise<void>;
  verifyPartnerExists: (partnerId: string) => boolean;
  verifyPartnersExist: (partnerIds: string[]) => boolean;
}

export type UseRelationshipStatusReturn = RelationshipState & RelationshipActions;
