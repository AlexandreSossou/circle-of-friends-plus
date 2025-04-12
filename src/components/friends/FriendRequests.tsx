
import FriendRequest from "./FriendRequest";
import { Friend } from "@/types/friends";

interface FriendRequestsProps {
  requests: Friend[];
  onAccept: (id: string, name: string) => void;
  onDecline: (id: string) => void;
}

const FriendRequests = ({ requests, onAccept, onDecline }: FriendRequestsProps) => {
  return (
    <>
      {requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((request) => (
            <FriendRequest
              key={request.id}
              request={request}
              onAccept={onAccept}
              onDecline={onDecline}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-social-textSecondary">
          <p>No pending friend requests.</p>
        </div>
      )}
    </>
  );
};

export default FriendRequests;
