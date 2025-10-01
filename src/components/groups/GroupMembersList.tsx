import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { GroupMember } from "@/hooks/useGroupMembers";
import { format } from "date-fns";

interface GroupMembersListProps {
  members: GroupMember[];
  isLoading: boolean;
}

const GroupMembersList = ({ members, isLoading }: GroupMembersListProps) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-10 text-social-textSecondary">
        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No members found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
        >
          <Avatar className="w-12 h-12">
            <AvatarImage src={member.profile.avatar_url || "/placeholder.svg"} />
            <AvatarFallback>
              {getInitials(member.profile.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">{member.profile.full_name}</p>
              {member.role === 'admin' && (
                <Badge variant="default" className="text-xs">Admin</Badge>
              )}
            </div>
            <p className="text-sm text-social-textSecondary">
              Joined {format(new Date(member.joined_at), "MMM d, yyyy")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupMembersList;