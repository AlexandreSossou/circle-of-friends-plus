
import { Shield, Star, StarHalf } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SafetyRatingSummaryProps = {
  averageRating: number;
  reviewsCount: number;
};

const SafetyRatingSummary = ({ averageRating, reviewsCount }: SafetyRatingSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-500" />
          Safety Rating
        </CardTitle>
        <CardDescription>
          Community safety rating based on {reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'}
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
  );
};

export default SafetyRatingSummary;
