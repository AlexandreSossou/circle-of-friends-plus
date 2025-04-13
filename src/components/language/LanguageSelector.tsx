
import React from "react";
import { Language, useLanguage } from "@/context/LanguageContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

interface LanguageSelectorProps {
  variant?: "minimal" | "full";
}

const LanguageSelector = ({ variant = "full" }: LanguageSelectorProps) => {
  const { language, setLanguage, t } = useLanguage();

  const languages: { value: Language; label: string }[] = [
    { value: "en", label: t("language.en") },
    { value: "es", label: t("language.es") },
    { value: "fr", label: t("language.fr") },
    { value: "de", label: t("language.de") },
  ];

  return (
    <div className={`flex items-center ${variant === "minimal" ? "w-auto" : "w-full"}`}>
      {variant === "full" && (
        <div className="mr-2">
          <Globe className="h-4 w-4 text-social-textSecondary" />
        </div>
      )}
      <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
        <SelectTrigger className={variant === "minimal" ? "w-[100px]" : "w-full"}>
          <SelectValue placeholder={t("settings.language")} />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.value} value={lang.value}>
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
