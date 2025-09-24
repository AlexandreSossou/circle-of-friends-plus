import MainLayout from "@/components/layout/MainLayout";
import { Bell, Check, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

const Notifications = () => {
  // Mock notifications data
  const mockNotifications = [
    {
      id: "1",
      type: "relationship_update",
      title: "Relationship Status Updated",
      message: "Your public relationship status has been updated to \"Couple / Married\" with your partner.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      avatar: "https://zbsxyvclylkclixwsytr.supabase.co/storage/v1/object/public/avatars/41c30af0-4f21-4db1-b3a6-ab025f4795f8/1756575951074.png",
      senderName: "Alex tester 1"
    },
    {
      id: "2", 
      type: "friend_request",
      title: "New Friend Request",
      message: "Burcu Konuralp sent you a friend request",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      avatar: "https://zbsxyvclylkclixwsytr.supabase.co/storage/v1/object/public/avatars/477818e0-3e29-412f-9c9f-f90bb4d1afe7/1755789650401.jpeg",
      senderName: "Burcu Konuralp"
    },
    {
      id: "3",
      type: "message",
      title: "New Message",
      message: "You have a new message from Shams",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      read: true,
      avatar: "/placeholder.svg",
      senderName: "Shams"
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "relationship_update":
        return <AlertCircle className="h-4 w-4 text-pink-500" />;
      case "friend_request":
        return <Bell className="h-4 w-4 text-blue-500" />;
      case "message":
        return <Clock className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const markAsRead = (notificationId: string) => {
    // TODO: Implement mark as read functionality
    console.log(`Marking notification ${notificationId} as read`);
  };

  const markAllAsRead = () => {
    // TODO: Implement mark all as read functionality
    console.log("Marking all notifications as read");
  };

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-social-primary" />
            <h1 className="text-2xl font-bold text-social-textPrimary">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </div>
          
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={markAllAsRead}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {mockNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-social-textSecondary mb-4" />
                <h2 className="text-xl font-semibold text-social-textPrimary mb-2">
                  No notifications yet
                </h2>
                <p className="text-social-textSecondary text-center max-w-md">
                  When someone interacts with you or there are updates to your account, 
                  you'll see them here.
                </p>
              </CardContent>
            </Card>
          ) : (
            mockNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-all hover:shadow-md ${
                  !notification.read ? 'bg-blue-50/50 border-blue-200' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={notification.avatar} 
                        alt={notification.senderName} 
                      />
                      <AvatarFallback>
                        {notification.senderName?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {getNotificationIcon(notification.type)}
                          <h3 className="font-semibold text-social-textPrimary text-sm">
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <time className="text-xs text-social-textSecondary">
                          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                        </time>
                      </div>
                      
                      <p className="text-social-textSecondary text-sm mb-2">
                        {notification.message}
                      </p>
                      
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs h-auto p-1 text-blue-600 hover:text-blue-700"
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Notifications;