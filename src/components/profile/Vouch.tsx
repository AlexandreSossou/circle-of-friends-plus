
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Friend } from "@/types/profile";
import { Review } from "@/types/safetyReview";
import { useToast } from "@/hooks/use-toast";
import { fetchSafetyReviews, submitSafetyReview } from "@/services/safetyReviews";
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
  const [relationshipDetail, setRelationshipDetail] = useState<string>("");
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch safety reviews
  useEffect(() => {
    if (!profileId) return;
    
    const getReviews = async () => {
      const data = await fetchSafetyReviews(profileId);
      setReviews(data);
    };
    
    getReviews();
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
  
  // Check if current user can leave a review (must be logged in, not own profile, and not in a relationship)
  const canReview = !isOwnProfile && !!currentUserId && !isInRelationship;
  
  // Calculate the average rating
  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
    : 0;
  
  const handleSubmitReview = async (rating: number, reviewText: string) => {
    if (!canReview || rating === 0 || !reviewText.trim()) return;
    
    const result = await submitSafetyReview(profileId, rating, reviewText);
    
    if (result.success) {
      // Refresh reviews
      const updatedReviews = await fetchSafetyReviews(profileId);
      setReviews(updatedReviews);
      
      toast({
        title: "Review submitted",
        description: "Your safety review has been submitted",
      });
      
      return Promise.resolve();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to submit your review. Please try again.",
        variant: "destructive",
      });
      
      return Promise.reject(result.error);
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
          relationshipDetail={relationshipDetail}
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
