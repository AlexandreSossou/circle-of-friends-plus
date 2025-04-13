
import { Badge } from "@/components/ui/badge";
import { RelationshipStatus } from "@/hooks/useRelationshipStatus";
import { Heart, UserIcon, Ring, HeartHandshake } from "lucide-react";
import { Link } from "react-router-dom";

interface RelationshipStatusDisplayProps {
  status: string;
  partnerId?: string;
  partnerName?: string;
  showIcon?: boolean;
  showLink?: boolean;
  className?: string;
}

const RelationshipStatusDisplay = ({
  status,
  partnerId,
  partnerName,
  showIcon = true,
  showLink = true,
  className = "",
}: RelationshipStatusDisplayProps) => {
  // Define icon and color based on status
  const getStatusDetails = () => {
    switch (status) {
      case RelationshipStatus.Single:
        return {
          icon: <UserIcon className="h-3 w-3" />,
          color: "bg-gray-200 text-gray-700",
        };
      case RelationshipStatus.InRelationship:
        return {
          icon: <HeartHandshake className="h-3 w-3" />,
          color: "bg-pink-100 text-pink-700",
        };
      case RelationshipStatus.Engaged:
        return {
          icon: <Ring className="h-3 w-3" />,
          color: "bg-purple-100 text-purple-700",
        };
      case RelationshipStatus.Married:
        return {
          icon: <Heart className="h-3 w-3" />,
          color: "bg-red-100 text-red-700",
        };
      default:
        return {
          icon: <UserIcon className="h-3 w-3" />,
          color: "bg-gray-200 text-gray-700",
        };
    }
  };

  const { icon, color } = getStatusDetails();

  // If no status is provided, don't render anything
  if (!status) {
    return null;
  }

  return (
    <Badge className={`${color} gap-1 ${className}`} variant="outline">
      {showIcon && icon}
      <span className="text-xs">{status}</span>
      {partnerId && partnerName && status !== RelationshipStatus.Single && (
        <span className="text-xs ml-0.5">
          with
          {showLink ? (
            <Link
              to={`/profile/${partnerId}`}
              className="ml-1 font-medium hover:underline"
            >
              {partnerName}
            </Link>
          ) : (
            <span className="ml-1 font-medium">{partnerName}</span>
          )}
        </span>
      )}
    </Badge>
  );
};

export default RelationshipStatusDisplay;
