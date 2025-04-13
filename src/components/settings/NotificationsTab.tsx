
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const NotificationsTab = () => {
  const { toast } = useToast();
  // Notifications state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [friendRequestNotifications, setFriendRequestNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [eventNotifications, setEventNotifications] = useState(true);
  
  const handleNotificationsUpdate = () => {
    toast({
      title: "Notification settings saved",
      description: "Your notification preferences have been updated.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-medium">Email Notifications</h4>
            <p className="text-sm text-social-textSecondary">
              Receive email notifications about activity on your account
            </p>
          </div>
          <Switch 
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-medium">Friend Requests</h4>
            <p className="text-sm text-social-textSecondary">
              Get notified when someone sends you a friend request
            </p>
          </div>
          <Switch 
            checked={friendRequestNotifications}
            onCheckedChange={setFriendRequestNotifications}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-medium">Messages</h4>
            <p className="text-sm text-social-textSecondary">
              Get notified when you receive new messages
            </p>
          </div>
          <Switch 
            checked={messageNotifications}
            onCheckedChange={setMessageNotifications}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-medium">Event Reminders</h4>
            <p className="text-sm text-social-textSecondary">
              Get reminders about upcoming events
            </p>
          </div>
          <Switch 
            checked={eventNotifications}
            onCheckedChange={setEventNotifications}
          />
        </div>
        
        <Button onClick={handleNotificationsUpdate}>
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationsTab;
