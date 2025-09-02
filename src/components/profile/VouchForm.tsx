import { useState } from "react";
import { Star, HeartOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type VouchFormProps = {
  isInRelationship: boolean;
  relationshipDetail?: string;
  canReview: boolean;
  onSubmit: (rating: number, reviewText: string) => Promise<void>;
};

const VouchForm = ({ isInRelationship, relationshipDetail, canReview, onSubmit }: VouchFormProps) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleRatingClick = (newRating: number) => {
    if (canReview) {
      setRating(newRating);
    }
  };

  const handleSubmitReview = async () => {
    if (!canReview || rating === 0 || !reviewText.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(rating, reviewText);
      
      // Reset the form
      setRating(0);
      setReviewText("");
      
      toast({
        title: "Vouch submitted",
        description: "Your vouch has been submitted",
      });
    } catch (error) {
      console.error("Error submitting vouch:", error);
      toast({
        title: "Error",
        description: "Failed to submit your vouch. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave a Vouch</CardTitle>
        <CardDescription>
          Share your experience regarding this user's safety and trustworthiness
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isInRelationship ? (
          <div className="p-4 border border-amber-200 bg-amber-50 rounded-md flex items-center gap-2">
            <HeartOff className="h-5 w-5 text-amber-500" />
            <div className="text-amber-700">
              <p>You cannot leave a vouch for someone you are in a relationship with.</p>
              {relationshipDetail && <p className="text-sm mt-1">{relationshipDetail}</p>}
            </div>
          </div>
        ) : (
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
              <p className="mb-2 text-sm font-medium">Your vouch</p>
              <Textarea
                placeholder="Write your vouch here..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                disabled={isSubmitting}
                className="min-h-[100px]"
              />
            </div>
          </div>
        )}
      </CardContent>
      {!isInRelationship && (
        <CardFooter>
          <Button
            onClick={handleSubmitReview}
            disabled={rating === 0 || !reviewText.trim() || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Vouch"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default VouchForm;