
import { Link } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSelector from "@/components/language/LanguageSelector";
import { useCalmMode } from "@/context/CalmModeContext";
import { CalmModeToggle } from "@/components/ui/calm-mode-toggle";

const Login = () => {
  const { t } = useLanguage();
  const { calmMode } = useCalmMode();

  return (
    <div className={`min-h-screen bg-background ${calmMode ? 'calm' : ''} flex flex-col`}>
      <div className="py-8">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-heading-lg text-primary hover:text-primary/90 transition-colors">{t("app.name")}</h1>
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="flex justify-end mb-4 gap-2 items-center">
            <CalmModeToggle />
            <LanguageSelector variant="minimal" />
          </div>
          <LoginForm />
        </div>
      </div>

      <footer className="py-6 text-center text-sm text-social-textSecondary">
        <div className="container mx-auto">
          <div className="flex justify-center space-x-4">
            <Link to="/about" className="hover:underline">About</Link>
            <Link to="/privacy" className="hover:underline">Privacy</Link>
            <Link to="/terms" className="hover:underline">Terms</Link>
            <Link to="/help" className="hover:underline">Help</Link>
          </div>
          <p className="mt-4">© 2025 CircleHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Login;
