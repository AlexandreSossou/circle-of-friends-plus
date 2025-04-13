
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

const SettingsHeader = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
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
  );
};

export default SettingsHeader;
