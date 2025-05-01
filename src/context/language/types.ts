
// Define available languages
export type Language = "en" | "es" | "fr" | "de";

// Define the language context type
export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Translation record type
export type TranslationRecord = Record<Language, Record<string, string>>;
