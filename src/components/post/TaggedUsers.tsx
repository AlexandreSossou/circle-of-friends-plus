import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, Clock, X } from "lucide-react";
import { usePostTaggedUsers } from "@/hooks/usePostTaggedUsers";

interface TaggedUsersProps {
  postId: string;
}

const TaggedUsers: React.FC<TaggedUsersProps> = ({ postId }) => {
  const { taggedUsers, isLoading } = usePostTaggedUsers(postId);

  if (isLoading || taggedUsers.length === 0) {
    return null;
  }

  const getConsentIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check className="w-3 h-3" />;
      case 'denied':
        return <X className="w-3 h-3" />;
      case 'pending':
        return <Clock className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getConsentVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'denied':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getConsentText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Consented';
      case 'denied':
        return 'Denied';
      case 'pending':
        return 'Pending';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="mt-3 space-y-2">
      <p className="text-sm text-muted-foreground">Tagged users:</p>
      <div className="flex flex-wrap gap-2">
        {taggedUsers.map((user) => (
          <div key={user.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <Avatar className="w-6 h-6">
              <AvatarImage src={user.avatar_url} alt={user.full_name} />
              <AvatarFallback className="text-xs">
                {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{user.full_name}</span>
            <Badge 
              variant={getConsentVariant(user.consent_status)} 
              className="text-xs flex items-center gap-1"
            >
              {getConsentIcon(user.consent_status)}
              {getConsentText(user.consent_status)}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaggedUsers;