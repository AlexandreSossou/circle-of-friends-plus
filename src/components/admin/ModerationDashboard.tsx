import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type ModerationRecord = {
  id: string;
  user_id: string;
  flagged_content: string;
  violation_type: string;
  severity_level: string;
  ai_confidence: number;
  moderator_reviewed: boolean;
  moderator_action: string | null;
  created_at: string;
  profiles?: {
    full_name: string;
  } | null;
};

type ModerationNotification = {
  id: string;
  message: string;
  read: boolean;
  created_at: string;
  chat_moderation: {
    flagged_content: string;
    violation_type: string;
    severity_level: string;
    profiles: {
      full_name: string;
    };
  };
};

const ModerationDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("pending");

  // Fetch moderation records
  const { data: moderationRecords, refetch: refetchRecords } = useQuery({
    queryKey: ["moderation-records", selectedTab],
    queryFn: async () => {
      const query = supabase
        .from('chat_moderation')
        .select(`
          *
        `)
        .order('created_at', { ascending: false });

      if (selectedTab === "pending") {
        query.eq('moderator_reviewed', false);
      } else if (selectedTab === "reviewed") {
        query.eq('moderator_reviewed', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch notifications
  const { data: notifications, refetch: refetchNotifications } = useQuery({
    queryKey: ["moderation-notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('moderation_notifications')
        .select(`
          *,
          chat_moderation (
            flagged_content,
            violation_type,
            severity_level
          )
        `)
        .eq('recipient_id', user.id)
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const handleModerationAction = async (recordId: string, action: string) => {
    try {
      const { error } = await supabase
        .from('chat_moderation')
        .update({
          moderator_reviewed: true,
          moderator_id: user?.id,
          moderator_action: action
        })
        .eq('id', recordId);

      if (error) throw error;

      toast({
        title: "Action taken",
        description: `Record has been marked as ${action}.`,
      });

      refetchRecords();
    } catch (error) {
      console.error('Error updating moderation record:', error);
      toast({
        title: "Error",
        description: "Failed to update record. Please try again.",
        variant: "destructive",
      });
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      await supabase
        .from('moderation_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      refetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getViolationTypeLabel = (type: string) => {
    switch (type) {
      case 'abusive_language': return 'Abusive Language';
      case 'dangerous_content': return 'Dangerous Content';
      case 'spam': return 'Spam';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Moderation</h2>
          <p className="text-muted-foreground">Manage flagged content and user warnings</p>
        </div>
        {notifications && notifications.length > 0 && (
          <Badge variant="destructive" className="animate-pulse">
            {notifications.length} New Alert{notifications.length > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Notifications */}
      {notifications && notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.slice(0, 3).map((notification) => (
                <div
                  key={notification.id}
                  className="p-3 border rounded-lg bg-amber-50 dark:bg-amber-950/20"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markNotificationRead(notification.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Moderation Records */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Review
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Reviewed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {moderationRecords?.map((record) => (
            <Card key={record.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {getViolationTypeLabel(record.violation_type)}
                    </CardTitle>
                    <CardDescription>
                      User ID: {record.user_id}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getSeverityColor(record.severity_level)}>
                      {record.severity_level.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">
                      {Math.round(record.ai_confidence * 100)}% confidence
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Flagged Content:</h4>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">{record.flagged_content}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleModerationAction(record.id, 'approved')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleModerationAction(record.id, 'removed')}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleModerationAction(record.id, 'warned')}
                    >
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Warn User
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Reported: {format(new Date(record.created_at), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {moderationRecords?.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-medium mb-2">All caught up!</h3>
                <p className="text-muted-foreground">No pending moderation items to review.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-4">
          {moderationRecords?.map((record) => (
            <Card key={record.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {getViolationTypeLabel(record.violation_type)}
                    </CardTitle>
                    <CardDescription>
                      User ID: {record.user_id}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getSeverityColor(record.severity_level)}>
                      {record.severity_level.toUpperCase()}
                    </Badge>
                    {record.moderator_action && (
                      <Badge variant="outline">
                        {record.moderator_action.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <h4 className="font-medium mb-1">Content:</h4>
                    <p className="text-sm text-muted-foreground">{record.flagged_content}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Reviewed: {format(new Date(record.created_at), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModerationDashboard;