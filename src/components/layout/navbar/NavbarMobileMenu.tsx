import { Link } from "react-router-dom";
import { Bell, Home, MessageCircle, Plane, Search, Users, Video } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface UnreadMessage {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface NavbarMobileMenuProps {
  user: any;
  unreadMessages: UnreadMessage[];
}

const NavbarMobileMenu = ({ user, unreadMessages }: NavbarMobileMenuProps) => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/login";
  };

  return (
    <div className="md:hidden bg-white border-t py-2">
      <div className="container px-4">
        <div className="flex items-center mb-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-social-textSecondary" />
            </div>
            <Input
              type="search"
              placeholder="Search Lovaville..."
              className="pl-10 bg-social-gray rounded-full border-none"
            />
          </div>
        </div>
        <nav className="flex flex-col space-y-1">
          <Link to="/" className="flex items-center p-3 text-social-blue rounded-md bg-social-lightblue">
            <Home className="w-5 h-5 mr-3" />
            <span>Home</span>
          </Link>
          <Link to="/friends" className="flex items-center p-3 hover:bg-social-gray rounded-md">
            <Users className="w-5 h-5 mr-3" />
            <span>Friends</span>
          </Link>
          <Link to="/friend-search" className="flex items-center p-3 hover:bg-social-gray rounded-md">
            <Search className="w-5 h-5 mr-3" />
            <span>Find Friends</span>
          </Link>
          <Link to="/messages" className="flex items-center p-3 hover:bg-social-gray rounded-md">
            <MessageCircle className="w-5 h-5 mr-3" />
            <span>Messages</span>
            {unreadMessages && unreadMessages.length > 0 && (
              <span className="ml-auto bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {unreadMessages.length}
              </span>
            )}
          </Link>
          <Link to="/notifications" className="flex items-center p-3 hover:bg-social-gray rounded-md">
            <Bell className="w-5 h-5 mr-3" />
            <span>Notifications</span>
          </Link>
          
          <Link to="/travels" className="flex items-center p-3 hover:bg-social-gray rounded-md text-green-500">
            <Plane className="w-5 h-5 mr-3" />
            <span>Travels</span>
          </Link>
          
          <Link to="/news" className="flex items-center p-3 hover:bg-social-gray rounded-md">
            <span>News</span>
          </Link>
          
          <Link to="/live-sessions" className="flex items-center p-3 hover:bg-social-gray rounded-md">
            <Video className="w-5 h-5 mr-3" />
            <span>Live Sessions</span>
          </Link>
          
          {!user && (
            <>
              <Link to="/login" className="flex items-center p-3 hover:bg-social-gray rounded-md text-social-blue">
                <span>Log In</span>
              </Link>
              <Link to="/register" className="flex items-center p-3 bg-social-blue text-white rounded-md">
                <span>Sign Up</span>
              </Link>
            </>
          )}
          
          {user && (
            <Button
              variant="ghost"
              className="flex items-center justify-start p-3 hover:bg-social-gray rounded-md w-full"
              onClick={handleLogout}
            >
              <span>Log out</span>
            </Button>
          )}
          
          <Link to="/message-preferences" className="flex items-center p-3 hover:bg-social-gray rounded-md">
            <span>Message Preferences</span>
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default NavbarMobileMenu;
