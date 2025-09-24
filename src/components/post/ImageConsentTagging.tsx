import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, X } from "lucide-react";
import { UserMentionInput } from "./UserMentionInput";

interface TaggedUser {
  id: string;
  full_name: string;
  avatar_url: string;
}

interface ImageConsentTaggingProps {
  imagePreview: string | null;
  taggedUsers: TaggedUser[];
  onTaggedUsersChange: (users: TaggedUser[]) => void;
}

const ImageConsentTagging: React.FC<ImageConsentTaggingProps> = ({
  imagePreview,
  taggedUsers,
  onTaggedUsersChange
}) => {
  const [showTagging, setShowTagging] = useState(false);

  if (!imagePreview) return null;

  const handleUserSelect = (text: string, users: TaggedUser[]) => {
    onTaggedUsersChange(users);
  };

  const removeTag = (userId: string) => {
    const updatedUsers = taggedUsers.filter(user => user.id !== userId);
    onTaggedUsersChange(updatedUsers);
  };

  return (
    <div className="mt-2">
      {!showTagging ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTagging(true)}
          className="mb-2"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Tag people in this image
        </Button>
      ) : (
        <div className="space-y-2 mb-2">
          <div className="text-sm font-medium text-muted-foreground">
            Tag people who need to consent to this image:
          </div>
          <UserMentionInput
            value=""
            onChange={handleUserSelect}
            placeholder="Type @ to tag someone..."
            className="text-sm"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTagging(false)}
          >
            Done tagging
          </Button>
        </div>
      )}

      {taggedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {taggedUsers.map((user) => (
            <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
              {user.full_name}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => removeTag(user.id)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageConsentTagging;