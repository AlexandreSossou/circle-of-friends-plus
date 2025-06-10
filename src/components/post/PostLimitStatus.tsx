
import { usePostLimit } from "@/hooks/usePostLimit";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

const PostLimitStatus = () => {
  const { canCreate, remainingPosts, dailyLimit, isLoading } = usePostLimit();

  if (isLoading) {
    return null;
  }

  if (canCreate && remainingPosts === dailyLimit) {
    return null; // Don't show anything when user hasn't posted yet
  }

  return (
    <Alert className={`mb-4 ${!canCreate ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
      <InfoIcon className="h-4 w-4" />
      <AlertDescription>
        {canCreate ? (
          <span>
            You have <strong>{remainingPosts}</strong> post{remainingPosts !== 1 ? 's' : ''} remaining today 
            (Daily limit: {dailyLimit})
          </span>
        ) : (
          <span className="text-red-700">
            You've reached your daily limit of <strong>{dailyLimit}</strong> post{dailyLimit !== 1 ? 's' : ''}. 
            You can create more posts tomorrow.
          </span>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default PostLimitStatus;
