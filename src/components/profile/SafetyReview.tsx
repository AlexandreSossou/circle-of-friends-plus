
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Shield, StarHalf } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Friend } from "@/types/profile";

type SafetyReviewProps = {
  profileId: string;
  isOwnProfile: boolean;
  currentUserId?: string;
  friends: Friend[];
};

type Review = {
  id: string;
  rating: number;
  content: string;
  created_at: string;
  reviewer: {
    name: string;
    avatar: string;
    initials: string;
  };
};

const SafetyReview = ({ profileId, isOwnProfile, currentUserId, friends }: SafetyReviewProps) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Check if current user can leave a review (must be logged in and not own profile)
  const canReview = !isOwnProfile && !!currentUserId;
  
  // Calculate the average rating
  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
    : 0;
  
  const handleRatingClick = (newRating: number) => {
    if (canReview) {
      setRating(newRating);
    }
  };
  
  const handleSubmitReview = async () => {
    if (!canReview || rating === 0 || !reviewText.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
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
      
      // Reset the form
      setRating(0);
      setReviewText("");
      
      toast({
        title: "Review submitted",
        description: "Your safety review has been submitted",
      });
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "Failed to submit your review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // In a real app, we would fetch reviews from the database
  
  return (
    <div className="space-y-6">
      {/* Safety Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Safety Rating
          </CardTitle>
          <CardDescription>
            Community safety rating based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => {
                if (star <= Math.floor(averageRating)) {
                  return <Star key={star} className="h-6 w-6 fill-yellow-400 text-yellow-400" />;
                } else if (star === Math.ceil(averageRating) && !Number.isInteger(averageRating)) {
                  return <StarHalf key={star} className="h-6 w-6 fill-yellow-400 text-yellow-400" />;
                } else {
                  return <Star key={star} className="h-6 w-6 text-gray-300" />;
                }
              })}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Leave a Review Form */}
      {canReview && (
        <Card>
          <CardHeader>
            <CardTitle>Leave a Safety Review</CardTitle>
            <CardDescription>
              Share your experience regarding this user's safety and trustworthiness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium">Your rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 cursor-pointer ${
                        star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                      onClick={() => handleRatingClick(star)}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Your review</p>
                <Textarea
                  placeholder="Write your safety review here..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  disabled={isSubmitting}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSubmitReview}
              disabled={rating === 0 || !reviewText.trim() || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Safety Reviews</h3>
        {reviews.length === 0 ? (
          <p className="text-gray-500">No safety reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{review.reviewer.name}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p>{review.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SafetyReview;
