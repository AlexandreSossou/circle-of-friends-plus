
import { useState } from "react";
import { RelationshipStatus } from "@/types/relationship";

export const useRelationshipState = () => {
  // Public profile relationship state
  const [status, setStatus] = useState<string>(RelationshipStatus.Single);
  const [partner, setPartner] = useState<string>("");
  const [partners, setPartners] = useState<string[]>([]);
  
  // Private profile relationship state
  const [privateStatus, setPrivateStatus] = useState<string>(RelationshipStatus.Single);
  const [privatePartner, setPrivatePartner] = useState<string>("");
  const [privatePartners, setPrivatePartners] = useState<string[]>([]);
  
  // Looking for preferences (only for private profile)
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resetError = () => setError(null);

  return {
    // Public profile state
    status,
    setStatus,
    partner,
    setPartner,
    partners,
    setPartners,
    
    // Private profile state
    privateStatus,
    setPrivateStatus,
    privatePartner,
    setPrivatePartner,
    privatePartners,
    setPrivatePartners,
    
    // Looking for preferences
    lookingFor,
    setLookingFor,
    
    // Common state
    isUpdating,
    setIsUpdating,
    isLoading,
    setIsLoading,
    error,
    setError,
    resetError
  };
};
