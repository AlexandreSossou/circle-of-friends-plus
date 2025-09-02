import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Friend } from "@/types/profile";
import type { Vouch } from "@/types/vouch";
import { useToast } from "@/hooks/use-toast";
import { fetchVouches, submitVouch } from "@/services/safetyReviews";
import SafetyRatingSummary from "./SafetyRatingSummary";
import VouchForm from "./VouchForm";
import VouchList from "./VouchList";

type VouchProps = {
  profileId: string;
  isOwnProfile: boolean;
  currentUserId?: string;
  friends: Friend[];
};

const Vouch = ({ profileId, isOwnProfile, currentUserId, friends }: VouchProps) => {
  const [vouches, setVouches] = useState<Vouch[]>([]);
  const [isInRelationship, setIsInRelationship] = useState(false);
  const [relationshipDetail, setRelationshipDetail] = useState<string>("");
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch vouches
  useEffect(() => {
    if (!profileId) return;
    
    const getVouches = async () => {
      const data = await fetchVouches(profileId);
      setVouches(data);
    };
    
    getVouches();
  }, [profileId]);
  
  // Check if users are in a relationship
  useEffect(() => {
    const checkRelationshipStatus = async () => {
      if (!currentUserId || !profileId || isOwnProfile) {
        setIsInRelationship(false);
        return;
      }
      
      try {
        // Get current user's profile
        const { data: currentUserProfile, error: currentUserError } = await supabase
          .from('profiles')
          .select('partner_id, marital_status')
          .eq('id', currentUserId)
          .single();
          
        if (currentUserError) throw currentUserError;
        
        // Get viewed profile
        const { data: viewedProfile, error: viewedProfileError } = await supabase
          .from('profiles')
          .select('partner_id, marital_status, full_name')
          .eq('id', profileId)
          .single();
          
        if (viewedProfileError) throw viewedProfileError;
        
        // Check if they are partners
        const isPartnership = 
          (currentUserProfile?.partner_id === profileId) || 
          (viewedProfile?.partner_id === currentUserId);
          
        // Check if either has a marital status indicating a relationship
        const hasRelationshipStatus = 
          (currentUserProfile?.marital_status === 'Married' && viewedProfile?.partner_id === currentUserId) ||
          (viewedProfile?.marital_status === 'Married' && currentUserProfile?.partner_id === profileId);
        
        const inRelationship = isPartnership || hasRelationshipStatus;
        setIsInRelationship(inRelationship);
        
        if (inRelationship) {
          const relationshipType = currentUserProfile?.marital_status || 'In a relationship';
          setRelationshipDetail(`You are ${relationshipType.toLowerCase()} with ${viewedProfile?.full_name}`);
        }
      } catch (error) {
        console.error("Error checking relationship status:", error);
        setIsInRelationship(false);
      }
    };
    
    checkRelationshipStatus();
  }, [currentUserId, profileId, isOwnProfile]);
  
  // Check if current user can leave a vouch (must be logged in, not own profile, and not in a relationship)
  const canReview = !isOwnProfile && !!currentUserId && !isInRelationship;
  
  // Calculate the average rating
  const averageRating = vouches.length > 0 
    ? vouches.reduce((acc, vouch) => acc + vouch.rating, 0) / vouches.length 
    : 0;
  
  const handleSubmitVouch = async (rating: number, reviewText: string) => {
    if (!canReview || rating === 0 || !reviewText.trim()) return;
    
    const result = await submitVouch(profileId, rating, reviewText);
    
    if (result.success) {
      // Refresh vouches
      const updatedVouches = await fetchVouches(profileId);
      setVouches(updatedVouches);
      
      toast({
        title: "Vouch submitted",
        description: "Your vouch has been submitted",
      });
      
      return Promise.resolve();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to submit your vouch. Please try again.",
        variant: "destructive",
      });
      
      return Promise.reject(result.error);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Safety Rating Summary */}
      <SafetyRatingSummary averageRating={averageRating} reviewsCount={vouches.length} />
      
      {/* Leave a Vouch Form */}
      {currentUserId && !isOwnProfile && (
        <VouchForm 
          isInRelationship={isInRelationship}
          relationshipDetail={relationshipDetail}
          canReview={canReview} 
          onSubmit={handleSubmitVouch} 
        />
      )}
      
      {/* Vouches List */}
      <VouchList vouches={vouches} />
    </div>
  );
};

export default Vouch;