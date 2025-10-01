
import { Link } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSelector from "@/components/language/LanguageSelector";
import { useCalmMode } from "@/context/CalmModeContext";

const Login = () => {
  const { t } = useLanguage();
  const { calmMode } = useCalmMode();

  return (
    <div className={`min-h-screen bg-background ${calmMode ? 'calm' : ''} flex flex-col`}>
      <div className="py-8 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex-1" />
          <Link to="/" className="flex-1 flex justify-center">
            <h1 className="text-heading-lg text-primary hover:text-primary/90 transition-colors">{t("app.name")}</h1>
          </Link>
          <div className="flex-1 flex justify-end">
            <LanguageSelector variant="minimal" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>

      <footer className="py-6 text-center text-sm text-social-textSecondary">
        <div className="container mx-auto">
          <div className="flex justify-center space-x-4">
            <Link to="/about" className="hover:underline">{t("footer.about")}</Link>
            <Link to="/privacy" className="hover:underline">{t("footer.privacy")}</Link>
            <Link to="/terms" className="hover:underline">{t("footer.terms")}</Link>
            <Link to="/help" className="hover:underline">{t("footer.help")}</Link>
          </div>
          <p className="mt-4">{t("footer.copyright")}</p>
          <div className="mt-4 flex flex-col items-center gap-2">
            <img 
              src="/src/assets/moderering-logo.png" 
              alt="Moderering" 
              className="h-8 w-auto"
            />
            <p className="text-xs">
              {t("footer.moderatedBy")} <a href="https://moderering.com" target="_blank" rel="noopener noreferrer" className="hover:underline">moderering</a> Cybersecurity
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
