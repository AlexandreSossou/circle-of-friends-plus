
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const LanguageAlert = () => {
  const { language } = useLanguage();
  
  if (language === "en") return null;
  
  return (
    <Alert className="bg-blue-50 border-blue-200">
      <Info className="h-4 w-4 text-blue-500" />
      <AlertDescription className="text-sm text-blue-700">
        For the best experience connecting with our global community, consider using CircleHub in English. You can change your language preference anytime in settings.
      </AlertDescription>
    </Alert>
  );
};

export default LanguageAlert;
