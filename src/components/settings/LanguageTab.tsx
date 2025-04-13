
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSelector from "@/components/language/LanguageSelector";

const LanguageTab = () => {
  const { t } = useLanguage();

  return (
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
  );
};

export default LanguageTab;
