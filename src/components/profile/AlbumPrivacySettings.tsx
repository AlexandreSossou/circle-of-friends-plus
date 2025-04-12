
import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type Friend = {
  id: string;
  name: string;
  avatar: string;
  initials: string;
};

type AlbumPrivacySettingsProps = {
  albumId: number;
  albumName: string;
  isPrivate: boolean;
  allowedUsers: string[];
  friends: Friend[];
  onSave: (albumId: number, isPrivate: boolean, allowedUsers: string[]) => void;
};

const AlbumPrivacySettings = ({
  albumId,
  albumName,
  isPrivate,
  allowedUsers: initialAllowedUsers,
  friends,
  onSave,
}: AlbumPrivacySettingsProps) => {
  const [localIsPrivate, setLocalIsPrivate] = useState(isPrivate);
  const [localAllowedUsers, setLocalAllowedUsers] = useState<string[]>(initialAllowedUsers);
  const { toast } = useToast();

  const handleToggleUser = (userId: string) => {
    setLocalAllowedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSave = () => {
    onSave(albumId, localIsPrivate, localAllowedUsers);
    toast({
      title: "Privacy settings updated",
      description: `Album "${albumName}" privacy settings have been updated.`,
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          {isPrivate ? "Privacy Settings" : "Make Private"}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Album Privacy Settings</SheetTitle>
          <SheetDescription>
            Control who can see your "{albumName}" album
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-4">
          <div className="flex items-center space-x-2 mb-6">
            <Checkbox 
              id="album-privacy" 
              checked={localIsPrivate}
              onCheckedChange={() => setLocalIsPrivate(!localIsPrivate)}
            />
            <Label htmlFor="album-privacy">Make this album private</Label>
          </div>
          
          {localIsPrivate && (
            <div className="space-y-4">
              <p className="text-sm text-social-textSecondary">Select friends who can view this album:</p>
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                {friends.map((friend) => (
                  <div key={friend.id} className="flex items-center space-x-2 py-2 border-b border-gray-100">
                    <Checkbox 
                      id={`friend-${friend.id}`} 
                      checked={localAllowedUsers.includes(friend.id)}
                      onCheckedChange={() => handleToggleUser(friend.id)}
                    />
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                        <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                      </div>
                      <Label htmlFor={`friend-${friend.id}`}>{friend.name}</Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end mt-4">
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AlbumPrivacySettings;
