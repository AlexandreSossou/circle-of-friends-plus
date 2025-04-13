import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSelector from "@/components/language/LanguageSelector";
import { Loader2, Save, Shield, Bell, User, Eye, Lock, LogOut, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile state
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  
  // Notifications state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [friendRequestNotifications, setFriendRequestNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [eventNotifications, setEventNotifications] = useState(true);
  
  // Privacy state
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showLastSeen, setShowLastSeen] = useState(true);
  
  // Security state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Load user profile data
  useState(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }
      
      if (data) {
        setBio(data.bio || "");
        setLocation(data.location || "");
      }
    };
    
    fetchProfile();
  });
  
  const handleProfileUpdate = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      
      if (metadataError) throw metadataError;
      
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          bio,
          location
        })
        .eq("id", user.id);
      
      if (profileError) throw profileError;
      
      toast({
        title: "Profile updated!",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Update error:", error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordUpdate = async () => {
    if (!user) return;
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "Password updated!",
        description: "Your password has been changed successfully.",
      });
      
      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Password update error:", error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNotificationsUpdate = () => {
    toast({
      title: "Notification settings saved",
      description: "Your notification preferences have been updated.",
    });
  };
  
  const handlePrivacyUpdate = () => {
    toast({
      title: "Privacy settings saved",
      description: "Your privacy preferences have been updated.",
    });
  };
  
  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };
  
  return (
    <MainLayout>
      <div className="space-y-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("settings.title")}</h1>
            <p className="text-social-textSecondary mt-1">
              {t("settings.subtitle")}
            </p>
          </div>
          <Button 
            variant="outline" 
            className="mt-4 md:mt-0"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t("settings.logout")}
          </Button>
        </div>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 w-full">
            <TabsTrigger value="profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">{t("settings.profile")}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">{t("settings.notifications")}</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center">
              <Eye className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">{t("settings.privacy")}</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">{t("settings.security")}</span>
            </TabsTrigger>
            <TabsTrigger value="language" className="flex items-center">
              <Globe className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">{t("settings.language")}</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("settings.profileInfo")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full-name">{t("settings.fullName")}</Label>
                  <Input 
                    id="full-name" 
                    placeholder={t("settings.fullName")}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">{t("settings.bio")}</Label>
                  <Textarea 
                    id="bio" 
                    placeholder={t("settings.bio")}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">{t("settings.location")}</Label>
                  <Input 
                    id="location" 
                    placeholder={t("settings.location")}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleProfileUpdate} 
                  disabled={isLoading}
                  className="flex items-center"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {t("settings.saveChanges")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-6 space-y-4">
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
          </TabsContent>
          
          <TabsContent value="privacy" className="mt-6 space-y-4">
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
          </TabsContent>
          
          <TabsContent value="security" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input 
                    id="current-password" 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input 
                    id="new-password" 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input 
                    id="confirm-password" 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handlePasswordUpdate}
                  disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                  className="flex items-center"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="mr-2 h-4 w-4" />
                  )}
                  Update Password
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Deactivate Account</h3>
                  <p className="text-sm text-social-textSecondary">
                    Temporarily disable your account. You can reactivate it anytime.
                  </p>
                  <Button variant="outline" className="mt-2">
                    Deactivate Account
                  </Button>
                </div>
                
                <div className="space-y-2 pt-4 border-t">
                  <h3 className="font-medium text-destructive">Delete Account</h3>
                  <p className="text-sm text-social-textSecondary">
                    Permanently delete your account and all your data. This action cannot be undone.
                  </p>
                  <Button variant="destructive" className="mt-2">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="language" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("settings.language")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-social-textSecondary">
                    Choose your preferred language for the application interface.
                  </p>
                  <div className="w-full max-w-xs">
                    <LanguageSelector />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
