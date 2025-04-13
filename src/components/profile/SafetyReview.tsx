
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Friend } from "@/types/profile";
import { Review } from "@/types/safetyReview";
import SafetyRatingSummary from "./SafetyRatingSummary";
import SafetyReviewForm from "./SafetyReviewForm";
import SafetyReviewList from "./SafetyReviewList";

type SafetyReviewProps = {
  profileId: string;
  isOwnProfile: boolean;
  currentUserId?: string;
  friends: Friend[];
};

const SafetyReview = ({ profileId, isOwnProfile, currentUserId, friends }: SafetyReviewProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isInRelationship, setIsInRelationship] = useState(false);
  const { user } = useAuth();
  
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
          .select('partner_id, marital_status')
          .eq('id', profileId)
          .single();
          
        if (viewedProfileError) throw viewedProfileError;
        
        // Check if they are partners
        const isPartnership = 
          (currentUserProfile?.partner_id === profileId) || 
          (viewedProfile?.partner_id === currentUserId);
          
        // Check if either has a marital status indicating a relationship
        const hasRelationshipStatus = 
          (currentUserProfile?.marital_status === 'married' && viewedProfile?.partner_id === currentUserId) ||
          (viewedProfile?.marital_status === 'married' && currentUserProfile?.partner_id === profileId);
        
        setIsInRelationship(isPartnership || hasRelationshipStatus);
      } catch (error) {
        console.error("Error checking relationship status:", error);
        setIsInRelationship(false);
      }
    };
    
    checkRelationshipStatus();
  }, [currentUserId, profileId, isOwnProfile]);
  
  // Check if current user can leave a review (must be logged in, not own profile, and not in a relationship)
  const canReview = !isOwnProfile && !!currentUserId && !isInRelationship;
  
  // Calculate the average rating
  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
    : 0;
  
  const handleSubmitReview = async (rating: number, reviewText: string) => {
    if (!canReview || rating === 0 || !reviewText.trim()) return;
    
    try {
      // In a real app, we would store this in the database
      const newReview = {
        id: crypto.randomUUID(),
        rating,
        content: reviewText,
        created_at: new Date().toISOString(),
        reviewer: {
          name: user?.email || "Anonymous",
          avatar: "/placeholder.svg",
          initials: "AN"
        }
      };
      
      // Add the new review locally
      setReviews([newReview, ...reviews]);
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error submitting review:", error);
      return Promise.reject(error);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Safety Rating Summary */}
      <SafetyRatingSummary averageRating={averageRating} reviewsCount={reviews.length} />
      
      {/* Leave a Review Form */}
      {currentUserId && !isOwnProfile && (
        <SafetyReviewForm 
          isInRelationship={isInRelationship} 
          canReview={canReview} 
          onSubmit={handleSubmitReview} 
        />
      )}
      
      {/* Reviews List */}
      <SafetyReviewList reviews={reviews} />
    </div>
  );
};

export default SafetyReview;
