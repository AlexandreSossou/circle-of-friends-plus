
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ProfileData, ProfileType } from "@/types/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

type ProfileIdentityManagerProps = {
  profileData: ProfileData;
  profileType: ProfileType;
  onSave: (updates: Partial<ProfileData>) => void;
};

const ProfileIdentityManager = ({ profileData, profileType, onSave }: ProfileIdentityManagerProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState(
    profileType === "public" ? profileData.username || "" : profileData.private_username || ""
  );
  const [editedBio, setEditedBio] = useState(
    profileType === "public" ? profileData.bio || "" : profileData.private_bio || ""
  );
  const { toast } = useToast();

  const currentUsername = profileType === "public" ? profileData.username : profileData.private_username;
  const currentBio = profileType === "public" ? profileData.bio : profileData.private_bio;
  const currentAvatar = profileType === "public" ? profileData.avatar_url : profileData.private_avatar_url || profileData.avatar_url;

  const handleSave = () => {
    const updates: Partial<ProfileData> = {};
    
    if (profileType === "public") {
      updates.username = editedUsername;
      updates.bio = editedBio;
    } else {
      updates.private_username = editedUsername;
      updates.private_bio = editedBio;
    }
    
    onSave(updates);
    setIsEditing(false);
    
    toast({
      title: `${profileType === "public" ? "Public" : "Private"} profile updated`,
      description: "Your profile identity has been updated successfully.",
    });
  };

  const handleCancel = () => {
    setEditedUsername(currentUsername || "");
    setEditedBio(currentBio || "");
    setIsEditing(false);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{profileType === "public" ? "Public" : "Private"} Profile Identity</span>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit Identity
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar className="w-20 h-20">
              <AvatarImage src={currentAvatar} alt={currentUsername || "Profile"} />
              <AvatarFallback>{(currentUsername || "U").substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            {isEditing && (
              <Button
                variant="outline"
                size="icon"
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full"
              >
                <Camera className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <div className="flex-1">
            {!isEditing ? (
              <>
                <h3 className="font-semibold text-lg">{currentUsername || "No username set"}</h3>
                <p className="text-social-textSecondary text-sm">
                  {profileType === "public" ? "Public identity" : "Private identity"}
                </p>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={editedUsername}
                  onChange={(e) => setEditedUsername(e.target.value)}
                  placeholder={`Enter your ${profileType} username`}
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          {!isEditing ? (
            <p className="text-sm text-social-textSecondary mt-1 break-words">
              {currentBio || `No ${profileType} bio set`}
            </p>
          ) : (
            <Textarea
              id="bio"
              value={editedBio}
              onChange={(e) => setEditedBio(e.target.value)}
              placeholder={`Tell others about your ${profileType} profile...`}
              className="mt-1"
              rows={3}
            />
          )}
        </div>

        {isEditing && (
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave}>Save Changes</Button>
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          </div>
        )}

        {profileType === "private" && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-orange-800 text-sm">
              <strong>Privacy Note:</strong> Your private profile uses a separate identity. 
              Visitors cannot link this to your public profile.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileIdentityManager;
