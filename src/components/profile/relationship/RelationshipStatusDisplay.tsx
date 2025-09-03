import { Badge } from "@/components/ui/badge";
import { RelationshipStatus } from "@/types/relationship";
import { 
  Heart, 
  UserIcon, 
  Users, 
  Network
} from "lucide-react";
import { Link } from "react-router-dom";

interface RelationshipStatusDisplayProps {
  status: string;
  partnerId?: string;
  partnerName?: string;
  partnerIds?: string[];
  partnerNames?: string[];
  showIcon?: boolean;
  showLink?: boolean;
  className?: string;
}

const RelationshipStatusDisplay = ({
  status,
  partnerId,
  partnerName,
  partnerIds = [],
  partnerNames = [],
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
      case RelationshipStatus.CoupleMarried:
        return {
          icon: <Heart className="h-3 w-3" />,
          color: "bg-pink-100 text-pink-700",
        };
      case RelationshipStatus.OpenRelationship:
        return {
          icon: <Users className="h-3 w-3" />,
          color: "bg-indigo-100 text-indigo-700",
        };
      case RelationshipStatus.Polyamorous:
        return {
          icon: <Network className="h-3 w-3" />,
          color: "bg-violet-100 text-violet-700",
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

  // Handle polyamorous relationships differently
  const isPolyamorous = status === RelationshipStatus.Polyamorous;
  
  // For polyamorous, we display all partners
  const displayPartners = isPolyamorous ? 
    (partnerIds?.length ? partnerIds : []) : 
    (partnerId ? [partnerId] : []);
    
  const displayPartnerNames = isPolyamorous ?
    (partnerNames?.length ? partnerNames : []) :
    (partnerName ? [partnerName] : []);

  return (
    <Badge className={`${color} gap-1 ${className}`} variant="outline">
      {showIcon && icon}
      <span className="text-xs">{status}</span>
      
      {displayPartners.length > 0 && status !== RelationshipStatus.Single && (
        <span className="text-xs ml-0.5">
          with
          {displayPartners.map((id, index) => {
            const name = displayPartnerNames[index] || `Partner ${index + 1}`;
            return (
              <span key={id} className="mx-1">
                {index > 0 && ", "}
                {showLink ? (
                  <Link
                    to={`/profile/${id}`}
                    className="font-medium hover:underline"
                  >
                    {name}
                  </Link>
                ) : (
                  <span className="font-medium">{name}</span>
                )}
              </span>
            );
          })}
        </span>
      )}
    </Badge>
  );
};

export default RelationshipStatusDisplay;