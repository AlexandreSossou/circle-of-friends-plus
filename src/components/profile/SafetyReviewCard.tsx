
import { Star } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Review } from "@/types/safetyReview";

type SafetyReviewCardProps = {
  review: Review;
};

const SafetyReviewCard = ({ review }: SafetyReviewCardProps) => {
  return (
    <Card>
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
  );
};

export default SafetyReviewCard;
