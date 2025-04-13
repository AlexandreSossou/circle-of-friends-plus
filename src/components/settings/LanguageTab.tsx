
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSelector from "@/components/language/LanguageSelector";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

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
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-sm text-blue-700">
              While we support multiple languages, using English may enhance your experience as it's the most widely used language on CircleHub, making it easier to connect with friends globally.
            </AlertDescription>
          </Alert>
          <div className="w-full max-w-xs">
            <LanguageSelector />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LanguageTab;
