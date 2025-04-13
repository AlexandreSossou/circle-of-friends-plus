
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

const ProfileTab = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile state
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  
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

  return (
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
  );
};

export default ProfileTab;
