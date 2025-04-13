
import SafetyReviewCard from "./SafetyReviewCard";
import { Review } from "@/types/safetyReview";

type SafetyReviewListProps = {
  reviews: Review[];
};

const SafetyReviewList = ({ reviews }: SafetyReviewListProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Safety Reviews</h3>
      {reviews.length === 0 ? (
        <p className="text-gray-500">No safety reviews yet.</p>
      ) : (
        reviews.map((review) => (
          <SafetyReviewCard key={review.id} review={review} />
        ))
      )}
    </div>
  );
};

export default SafetyReviewList;
