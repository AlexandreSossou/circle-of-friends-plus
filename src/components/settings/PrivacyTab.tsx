
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const PrivacyTab = () => {
  const { toast } = useToast();
  // Privacy state
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showLastSeen, setShowLastSeen] = useState(true);
  
  const handlePrivacyUpdate = () => {
    toast({
      title: "Privacy settings saved",
      description: "Your privacy preferences have been updated.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="profile-visibility">Profile Visibility</Label>
          <select
            id="profile-visibility"
            value={profileVisibility}
            onChange={(e) => setProfileVisibility(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="public">Public - Everyone can see your profile</option>
            <option value="friends">Friends Only - Only friends can see your profile</option>
            <option value="private">Private - Only you can see your profile</option>
          </select>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-medium">Show Online Status</h4>
            <p className="text-sm text-social-textSecondary">
              Allow others to see when you're online
            </p>
          </div>
          <Switch 
            checked={showOnlineStatus}
            onCheckedChange={setShowOnlineStatus}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-medium">Show Last Seen</h4>
            <p className="text-sm text-social-textSecondary">
              Allow others to see when you were last active
            </p>
          </div>
          <Switch 
            checked={showLastSeen}
            onCheckedChange={setShowLastSeen}
          />
        </div>
        
        <Button onClick={handlePrivacyUpdate}>
          Save Privacy Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default PrivacyTab;
