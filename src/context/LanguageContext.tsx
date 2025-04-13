
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define available languages
export type Language = "en" | "es" | "fr" | "de";

// Define the language context type
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Create translations for each language
const translations: Record<Language, Record<string, string>> = {
  en: {
    // General
    "app.name": "CircleHub",
    "app.tagline": "Connect with friends and the world around you",
    
    // Auth
    "auth.login": "Log In",
    "auth.register": "Sign Up",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.forgotPassword": "Forgot password?",
    "auth.noAccount": "Don't have an account?",
    "auth.hasAccount": "Already have an account?",
    "auth.loggingIn": "Logging in...",
    
    // Settings
    "settings.title": "Settings",
    "settings.subtitle": "Manage your account settings and preferences",
    "settings.profile": "Profile",
    "settings.notifications": "Notifications",
    "settings.privacy": "Privacy",
    "settings.security": "Security",
    "settings.language": "Language",
    "settings.logout": "Log out",
    "settings.profileInfo": "Profile Information",
    "settings.fullName": "Full Name",
    "settings.bio": "Bio",
    "settings.location": "Location",
    "settings.saveChanges": "Save Changes",

    // Languages
    "language.en": "English",
    "language.es": "Spanish",
    "language.fr": "French",
    "language.de": "German",
  },
  es: {
    // General
    "app.name": "CircleHub",
    "app.tagline": "Conéctate con amigos y el mundo que te rodea",
    
    // Auth
    "auth.login": "Iniciar Sesión",
    "auth.register": "Registrarse",
    "auth.email": "Correo electrónico",
    "auth.password": "Contraseña",
    "auth.forgotPassword": "¿Olvidaste tu contraseña?",
    "auth.noAccount": "¿No tienes una cuenta?",
    "auth.hasAccount": "¿Ya tienes una cuenta?",
    "auth.loggingIn": "Iniciando sesión...",
    
    // Settings
    "settings.title": "Configuración",
    "settings.subtitle": "Administra la configuración y preferencias de tu cuenta",
    "settings.profile": "Perfil",
    "settings.notifications": "Notificaciones",
    "settings.privacy": "Privacidad",
    "settings.security": "Seguridad",
    "settings.language": "Idioma",
    "settings.logout": "Cerrar sesión",
    "settings.profileInfo": "Información del perfil",
    "settings.fullName": "Nombre completo",
    "settings.bio": "Biografía",
    "settings.location": "Ubicación",
    "settings.saveChanges": "Guardar cambios",

    // Languages
    "language.en": "Inglés",
    "language.es": "Español",
    "language.fr": "Francés",
    "language.de": "Alemán",
  },
  fr: {
    // General
    "app.name": "CircleHub",
    "app.tagline": "Connectez-vous avec vos amis et le monde qui vous entoure",
    
    // Auth
    "auth.login": "Se connecter",
    "auth.register": "S'inscrire",
    "auth.email": "Email",
    "auth.password": "Mot de passe",
    "auth.forgotPassword": "Mot de passe oublié ?",
    "auth.noAccount": "Vous n'avez pas de compte ?",
    "auth.hasAccount": "Vous avez déjà un compte ?",
    "auth.loggingIn": "Connexion en cours...",
    
    // Settings
    "settings.title": "Paramètres",
    "settings.subtitle": "Gérez les paramètres et préférences de votre compte",
    "settings.profile": "Profil",
    "settings.notifications": "Notifications",
    "settings.privacy": "Confidentialité",
    "settings.security": "Sécurité",
    "settings.language": "Langue",
    "settings.logout": "Déconnexion",
    "settings.profileInfo": "Informations du profil",
    "settings.fullName": "Nom complet",
    "settings.bio": "Biographie",
    "settings.location": "Localisation",
    "settings.saveChanges": "Enregistrer les modifications",

    // Languages
    "language.en": "Anglais",
    "language.es": "Espagnol",
    "language.fr": "Français",
    "language.de": "Allemand",
  },
  de: {
    // General
    "app.name": "CircleHub",
    "app.tagline": "Verbinde dich mit Freunden und der Welt um dich herum",
    
    // Auth
    "auth.login": "Anmelden",
    "auth.register": "Registrieren",
    "auth.email": "E-Mail",
    "auth.password": "Passwort",
    "auth.forgotPassword": "Passwort vergessen?",
    "auth.noAccount": "Noch kein Konto?",
    "auth.hasAccount": "Bereits ein Konto?",
    "auth.loggingIn": "Anmeldung läuft...",
    
    // Settings
    "settings.title": "Einstellungen",
    "settings.subtitle": "Verwalte deine Kontoeinstellungen und Präferenzen",
    "settings.profile": "Profil",
    "settings.notifications": "Benachrichtigungen",
    "settings.privacy": "Datenschutz",
    "settings.security": "Sicherheit",
    "settings.language": "Sprache",
    "settings.logout": "Abmelden",
    "settings.profileInfo": "Profilinformationen",
    "settings.fullName": "Vollständiger Name",
    "settings.bio": "Über mich",
    "settings.location": "Standort",
    "settings.saveChanges": "Änderungen speichern",

    // Languages
    "language.en": "Englisch",
    "language.es": "Spanisch",
    "language.fr": "Französisch",
    "language.de": "Deutsch",
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  // Initialize language from localStorage or default to 'en'
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem("language") as Language;
    return savedLanguage || "en";
  });

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem("language", language);
    // Optional: Update HTML lang attribute
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  // Function to change language
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Translation function
  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
