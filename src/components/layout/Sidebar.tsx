
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Group, Home, Newspaper, Settings, Users, Plane, Search, MessageCircle, Video, Megaphone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useGroups } from "@/hooks/useGroups";
import { useLanguage } from "@/context/LanguageContext";

const Sidebar = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { userGroups = [], isLoadingUserGroups } = useGroups();
  
  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user) return "?";
    
    const name = user.user_metadata?.full_name || "";
    if (!name) return user.email?.substring(0, 2).toUpperCase() || "?";
    
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="social-card p-4">
          <Link to="/profile" className="flex items-center gap-3 hover:bg-social-gray p-2 rounded-lg transition">
            <Avatar>
              <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} alt={user?.user_metadata?.full_name || "User"} />
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{user?.user_metadata?.full_name || "Guest"}</span>
          </Link>
          
          <nav className="mt-4 space-y-1">
            <Link to="/" className="flex items-center p-2 text-social-blue rounded-lg bg-social-lightblue">
              <Home className="w-5 h-5 mr-3" />
              <span>{t("nav.home")}</span>
            </Link>
            <Link to="/friends" className="flex items-center p-2 hover:bg-social-gray rounded-lg">
              <Users className="w-5 h-5 mr-3" />
              <span>{t("nav.lovarinos")}</span>
            </Link>
            <Link to="/friend-search" className="flex items-center p-2 hover:bg-social-gray rounded-lg">
              <Search className="w-5 h-5 mr-3" />
              <span>{t("nav.findLovarinos")}</span>
            </Link>
            <Link to="/messages" className="flex items-center p-2 hover:bg-social-gray rounded-lg">
              <MessageCircle className="w-5 h-5 mr-3" />
              <span>{t("nav.messages")}</span>
            </Link>
            <Link to="/groups" className="flex items-center p-2 hover:bg-social-gray rounded-lg">
              <Group className="w-5 h-5 mr-3" />
              <span>{t("nav.groups")}</span>
            </Link>
            <Link to="/travels" className="flex items-center p-2 hover:bg-social-gray rounded-lg">
              <Plane className="w-5 h-5 mr-3" />
              <span>{t("nav.travels")}</span>
            </Link>
            <Link to="/events" className="flex items-center p-2 hover:bg-social-gray rounded-lg">
              <Calendar className="w-5 h-5 mr-3" />
              <span>{t("nav.events")}</span>
            </Link>
            <Link to="/announcements" className="flex items-center p-2 hover:bg-social-gray rounded-lg">
              <Megaphone className="w-5 h-5 mr-3" />
              <span>{t("nav.localAlerts")}</span>
            </Link>
            <Link to="/news" className="flex items-center p-2 hover:bg-social-gray rounded-lg">
              <Newspaper className="w-5 h-5 mr-3" />
              <span>{t("nav.news")}</span>
            </Link>
            <Link to="/live-sessions" className="flex items-center p-2 hover:bg-social-gray rounded-lg">
              <Video className="w-5 h-5 mr-3" />
              <span>{t("nav.liveSessions")}</span>
            </Link>
            <Link to="/settings" className="flex items-center p-2 hover:bg-social-gray rounded-lg">
              <Settings className="w-5 h-5 mr-3" />
              <span>{t("nav.settings")}</span>
            </Link>
          </nav>
        </div>
      </div>
      
      <div className="social-card p-4">
        <h3 className="font-semibold mb-3">{t("sidebar.yourGroups")}</h3>
        {isLoadingUserGroups ? (
          <div className="text-sm text-social-textSecondary">{t("common.loading")}</div>
        ) : userGroups.length > 0 ? (
          <>
            <div className="space-y-2">
              {userGroups.slice(0, 3).map((group) => (
                <Link key={group.id} to={`/groups/${group.id}`} className="flex items-center p-2 hover:bg-social-gray rounded-lg">
                  <Avatar className="w-8 h-8 mr-3">
                    <AvatarImage src={group.avatar_url || "/placeholder.svg"} alt={`${group.name} group`} />
                    <AvatarFallback>{group.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span>{group.name}</span>
                </Link>
              ))}
            </div>
            <Link to="/groups" className="block mt-3 text-social-blue text-sm font-medium">
              {t("sidebar.seeAllGroups")}
            </Link>
          </>
        ) : (
          <>
            <div className="text-sm text-social-textSecondary">{t("sidebar.noGroups")}</div>
            <Link to="/groups" className="block mt-3 text-social-blue text-sm font-medium">
              {t("sidebar.discoverGroups")}
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
