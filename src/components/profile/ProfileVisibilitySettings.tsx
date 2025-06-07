
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ProfileData } from "@/types/profile";

type ProfileVisibilitySettingsProps = {
  profileData: ProfileData;
  onSave: (settings: { publicEnabled: boolean; privateEnabled: boolean }) => void;
};

const ProfileVisibilitySettings = ({ profileData, onSave }: ProfileVisibilitySettingsProps) => {
  const [publicEnabled, setPublicEnabled] = useState(profileData.public_profile_enabled ?? true);
  const [privateEnabled, setPrivateEnabled] = useState(profileData.private_profile_enabled ?? true);
  const { toast } = useToast();

  const handleSave = () => {
    onSave({ publicEnabled, privateEnabled });
    toast({
      title: "Profile visibility updated",
      description: "Your profile visibility settings have been saved.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Visibility</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-medium">Public Profile</h4>
            <p className="text-sm text-social-textSecondary">
              Anyone can view your public profile
            </p>
          </div>
          <Switch 
            checked={publicEnabled}
            onCheckedChange={setPublicEnabled}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-medium">Private Profile</h4>
            <p className="text-sm text-social-textSecondary">
              Only friends can view your private profile
            </p>
          </div>
          <Switch 
            checked={privateEnabled}
            onCheckedChange={setPrivateEnabled}
          />
        </div>
        
        <Button onClick={handleSave}>
          Save Visibility Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileVisibilitySettings;
