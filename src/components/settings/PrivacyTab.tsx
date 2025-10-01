
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";

const PrivacyTab = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  // Privacy state
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showLastSeen, setShowLastSeen] = useState(true);
  
  const handlePrivacyUpdate = () => {
    toast({
      title: t("toast.privacySaved"),
      description: t("toast.privacyDesc"),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.privacy.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="profile-visibility">{t("settings.privacy.profileVisibility")}</Label>
          <select
            id="profile-visibility"
            value={profileVisibility}
            onChange={(e) => setProfileVisibility(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="public">{t("settings.privacy.public")}</option>
            <option value="friends">{t("settings.privacy.friendsOnly")}</option>
            <option value="private">{t("settings.privacy.private")}</option>
          </select>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-medium">{t("settings.privacy.showOnlineStatus")}</h4>
            <p className="text-sm text-social-textSecondary">
              {t("settings.privacy.showOnlineStatusDesc")}
            </p>
          </div>
          <Switch 
            checked={showOnlineStatus}
            onCheckedChange={setShowOnlineStatus}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-medium">{t("settings.privacy.allowTagging")}</h4>
            <p className="text-sm text-social-textSecondary">
              {t("settings.privacy.allowTaggingDesc")}
            </p>
          </div>
          <Switch 
            checked={showLastSeen}
            onCheckedChange={setShowLastSeen}
          />
        </div>
        
        <Button onClick={handlePrivacyUpdate}>
          {t("settings.privacy.save")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PrivacyTab;
