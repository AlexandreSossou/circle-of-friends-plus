
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";

const NotificationsTab = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  // Notifications state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [friendRequestNotifications, setFriendRequestNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [eventNotifications, setEventNotifications] = useState(true);
  
  const handleNotificationsUpdate = () => {
    toast({
      title: t("toast.notificationsSaved"),
      description: t("toast.notificationsDesc"),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.notifications")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-medium">{t("settings.notifications.email")}</h4>
            <p className="text-sm text-social-textSecondary">
              {t("settings.notifications.emailDesc")}
            </p>
          </div>
          <Switch 
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-medium">{t("settings.notifications.friendRequest")}</h4>
            <p className="text-sm text-social-textSecondary">
              {t("settings.notifications.friendRequestDesc")}
            </p>
          </div>
          <Switch 
            checked={friendRequestNotifications}
            onCheckedChange={setFriendRequestNotifications}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-medium">{t("settings.notifications.messages")}</h4>
            <p className="text-sm text-social-textSecondary">
              {t("settings.notifications.messagesDesc")}
            </p>
          </div>
          <Switch 
            checked={messageNotifications}
            onCheckedChange={setMessageNotifications}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-medium">{t("settings.notifications.events")}</h4>
            <p className="text-sm text-social-textSecondary">
              {t("settings.notifications.eventsDesc")}
            </p>
          </div>
          <Switch 
            checked={eventNotifications}
            onCheckedChange={setEventNotifications}
          />
        </div>
        
        <Button onClick={handleNotificationsUpdate}>
          {t("settings.saveChanges")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationsTab;
