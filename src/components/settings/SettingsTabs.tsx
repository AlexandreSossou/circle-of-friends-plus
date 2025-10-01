
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bell, Lock, Shield, Globe, AlertTriangle, CreditCard, Eye } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useUserRole } from "@/hooks/useUserRole";
import ProfileTab from "./ProfileTab";
import NotificationsTab from "./NotificationsTab";
import PrivacyTab from "./PrivacyTab";
import SecurityTab from "./SecurityTab";
import LanguageTab from "./LanguageTab";
import LocalAlertTab from "./LocalAlertTab";
import SubscriptionTab from "./SubscriptionTab";

const SettingsTabs = () => {
  const { t } = useLanguage();
  const { isAdmin } = useUserRole();

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="w-full flex flex-nowrap overflow-x-auto gap-1 md:grid md:grid-cols-6 md:gap-2">
        <TabsTrigger value="profile" className="flex items-center shrink-0">
          <User className="mr-2 h-4 w-4" />
          <span className="hidden md:inline">{t("settings.profile")}</span>
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center shrink-0">
          <Bell className="mr-2 h-4 w-4" />
          <span className="hidden md:inline">{t("settings.notifications")}</span>
        </TabsTrigger>
        <TabsTrigger value="privacy" className="flex items-center shrink-0">
          <Eye className="mr-2 h-4 w-4" />
          <span className="hidden md:inline">{t("settings.privacy")}</span>
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center shrink-0">
          <Shield className="mr-2 h-4 w-4" />
          <span className="hidden md:inline">{t("settings.security")}</span>
        </TabsTrigger>
        <TabsTrigger value="subscription" className="flex items-center shrink-0">
          <CreditCard className="mr-2 h-4 w-4" />
          <span className="hidden md:inline">{t("settings.subscription.title")}</span>
        </TabsTrigger>
        <TabsTrigger value="language" className="flex items-center shrink-0">
          <Globe className="mr-2 h-4 w-4" />
          <span className="hidden md:inline">{t("settings.language")}</span>
        </TabsTrigger>
        {isAdmin && (
          <TabsTrigger value="local-alerts" className="flex items-center shrink-0">
            <AlertTriangle className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">{t("settings.localAlerts.title")}</span>
          </TabsTrigger>
        )}
      </TabsList>
      
      <TabsContent value="profile" className="mt-6 space-y-4">
        <ProfileTab />
      </TabsContent>
      
      <TabsContent value="notifications" className="mt-6 space-y-4">
        <NotificationsTab />
      </TabsContent>
      
      <TabsContent value="privacy" className="mt-6 space-y-4">
        <PrivacyTab />
      </TabsContent>
      
      <TabsContent value="security" className="mt-6 space-y-4">
        <SecurityTab />
      </TabsContent>
      
      <TabsContent value="subscription" className="mt-6 space-y-4">
        <SubscriptionTab />
      </TabsContent>
      
      <TabsContent value="language" className="mt-6 space-y-4">
        <LanguageTab />
      </TabsContent>
      
      {isAdmin && (
        <TabsContent value="local-alerts" className="mt-6 space-y-4">
          <LocalAlertTab />
        </TabsContent>
      )}
    </Tabs>
  );
};

export default SettingsTabs;
