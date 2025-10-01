import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Heart, Users, MapPin, Calendar } from "lucide-react";
import LanguageSelector from "@/components/language/LanguageSelector";
import { CalmModeToggle } from "@/components/ui/calm-mode-toggle";
import { useLanguage } from "@/context/LanguageContext";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, { username: username, full_name: fullName });
      }
    } catch (error) {
      // Error handling is done in the auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/10 flex flex-col">
      <div className="py-4 px-4">
        <div className="container mx-auto flex justify-end gap-2">
          <CalmModeToggle />
          <LanguageSelector variant="minimal" />
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left side - Branding and Features */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-accent-yellow to-accent bg-clip-text text-transparent">
              Lovaville
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg">
              {t("auth.tagline")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 max-w-md mx-auto lg:mx-0">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto lg:mx-0">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">{t("auth.meetPeople")}</h3>
              <p className="text-sm text-muted-foreground">{t("auth.meetPeopleDesc")}</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto lg:mx-0">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">{t("auth.travelTogether")}</h3>
              <p className="text-sm text-muted-foreground">{t("auth.travelTogetherDesc")}</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto lg:mx-0">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">{t("auth.joinEvents")}</h3>
              <p className="text-sm text-muted-foreground">{t("auth.joinEventsDesc")}</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto lg:mx-0">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">{t("auth.buildRelationships")}</h3>
              <p className="text-sm text-muted-foreground">{t("auth.buildRelationshipsDesc")}</p>
            </div>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <Card className="w-full max-w-md mx-auto shadow-2xl border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {isLogin ? t("auth.welcomeBack") : t("auth.joinCommunity")}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin 
                ? t("auth.signInSubtitle")
                : t("auth.createAccountSubtitle")
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="username">{t("auth.nickname")}</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder={t("auth.nicknamePlaceholder")}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required={!isLogin}
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">{t("auth.nicknameHint")}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t("auth.fullName")}</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder={t("auth.fullNamePlaceholder")}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={!isLogin}
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">{t("auth.fullNameHint")}</p>
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("auth.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-11 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>{isLogin ? t("auth.signingIn") : t("auth.creatingAccount")}</span>
                  </div>
                ) : (
                  isLogin ? t("auth.signIn") : t("auth.createAccount")
                )}
              </Button>
            </form>
            
            <Separator />
            
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:text-primary/80"
              >
                {isLogin 
                  ? t("auth.noAccountSignUp")
                  : t("auth.hasAccountSignIn")
                }
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

      <footer className="py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          <p>
            {t("footer.moderatedBy")}{" "}
            <a 
              href="https://moderering.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              moderering
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Auth;