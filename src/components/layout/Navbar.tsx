
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Home, Menu, MessageSquare, Plane, Search, Users, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, isAfter, isBefore, parseISO } from "date-fns";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Fetch current user travels
  const { data: isCurrentlyTraveling } = useQuery({
    queryKey: ["currentlyTraveling", user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const now = new Date();
      
      const { data, error } = await supabase
        .from("travels")
        .select("arrival_date, departure_date")
        .eq("user_id", user.id);
      
      if (error) {
        console.error("Error fetching travels:", error);
        return false;
      }
      
      // Check if user is currently traveling
      return data.some(travel => {
        const arrival = parseISO(travel.arrival_date);
        const departure = parseISO(travel.departure_date);
        return isAfter(now, arrival) && isBefore(now, departure);
      });
    },
    enabled: !!user,
  });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

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
    <header
      className={`fixed top-0 left-0 right-0 bg-white z-50 ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4 flex-1">
            <Link to="/" className="font-bold text-social-blue text-2xl">
              CircleHub
            </Link>
            <div className="hidden md:flex relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-social-textSecondary" />
              </div>
              <Input
                type="search"
                placeholder="Search CircleHub..."
                className="pl-10 bg-social-gray rounded-full border-none"
              />
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            <Link to="/" className="p-2 text-social-blue hover:bg-social-lightblue rounded-full">
              <Home className="w-6 h-6" />
            </Link>
            <Link to="/friends" className="p-2 text-social-textSecondary hover:bg-social-gray rounded-full">
              <Users className="w-6 h-6" />
            </Link>
            <Link to="/messages" className="p-2 text-social-textSecondary hover:bg-social-gray rounded-full">
              <MessageSquare className="w-6 h-6" />
            </Link>
            <Link to="/notifications" className="p-2 text-social-textSecondary hover:bg-social-gray rounded-full">
              <Bell className="w-6 h-6" />
            </Link>
            {isCurrentlyTraveling && (
              <Link 
                to="/travels" 
                className="p-2 text-green-500 hover:bg-social-gray rounded-full relative"
                title="You are currently traveling!"
              >
                <Plane className="w-6 h-6" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full"></span>
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full" size="icon">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg" alt={user.user_metadata?.full_name || user.email || "User"} />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  className="text-social-blue"
                  onClick={() => navigate('/login')}
                >
                  Log In
                </Button>
                <Button 
                  className="bg-social-blue hover:bg-social-darkblue"
                  onClick={() => navigate('/register')}
                >
                  Sign Up
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t py-2">
          <div className="container px-4">
            <div className="flex items-center mb-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-social-textSecondary" />
                </div>
                <Input
                  type="search"
                  placeholder="Search CircleHub..."
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
              <Link to="/messages" className="flex items-center p-3 hover:bg-social-gray rounded-md">
                <MessageSquare className="w-5 h-5 mr-3" />
                <span>Messages</span>
              </Link>
              <Link to="/notifications" className="flex items-center p-3 hover:bg-social-gray rounded-md">
                <Bell className="w-5 h-5 mr-3" />
                <span>Notifications</span>
              </Link>
              
              {isCurrentlyTraveling && (
                <Link to="/travels" className="flex items-center p-3 hover:bg-social-gray rounded-md text-green-500">
                  <Plane className="w-5 h-5 mr-3" />
                  <span>Currently Traveling!</span>
                </Link>
              )}
              
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
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
