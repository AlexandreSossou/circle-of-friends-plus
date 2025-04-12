
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Home, Menu, MessageCircle, Plane, Search, Users, X } from "lucide-react";
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

  // Fetch unread messages
  const { data: unreadMessages } = useQuery({
    queryKey: ["unreadMessages", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("messages")
        .select("id, content, sender_id, created_at, profiles!messages_sender_id_fkey(full_name, avatar_url)")
        .eq("recipient_id", user.id)
        .eq("read", false)
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (error) {
        console.error("Error fetching unread messages:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
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

  // Subscribe to real-time messages
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('messages-channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `recipient_id=eq.${user.id}` 
      }, (payload) => {
        toast({
          title: "New Message",
          description: "You have received a new message",
        });
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 text-social-textSecondary hover:bg-social-gray rounded-full relative">
                  <MessageCircle className="w-6 h-6" />
                  {unreadMessages && unreadMessages.length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {unreadMessages.length}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex justify-between items-center">
                  <span>Messages</span>
                  <Link 
                    to="/messages" 
                    className="text-social-blue text-xs hover:underline"
                  >
                    See all
                  </Link>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {unreadMessages && unreadMessages.length > 0 ? (
                  unreadMessages.map((message) => (
                    <DropdownMenuItem key={message.id} asChild>
                      <Link 
                        to={`/messages?contact=${message.sender_id}`}
                        className="flex items-start gap-3 cursor-pointer p-3 hover:bg-social-gray"
                      >
                        <Avatar className="w-8 h-8 mt-1">
                          <AvatarImage 
                            src={(message.profiles as any)?.avatar_url || "/placeholder.svg"} 
                            alt={(message.profiles as any)?.full_name || "User"} 
                          />
                          <AvatarFallback>
                            {((message.profiles as any)?.full_name || "?").substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                          <p className="font-medium text-sm">
                            {(message.profiles as any)?.full_name || "User"}
                          </p>
                          <p className="text-xs text-social-textSecondary truncate">
                            {message.content}
                          </p>
                          <p className="text-xs text-social-textSecondary mt-1">
                            {format(new Date(message.created_at), "h:mm a")}
                          </p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="py-4 text-center text-social-textSecondary">
                    <p>No unread messages</p>
                  </div>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link 
                    to="/message-preferences" 
                    className="text-center text-social-blue w-full justify-center"
                  >
                    Message Preferences
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
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
                    <Link to="/message-preferences">Message Preferences</Link>
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
              
              <Link to="/message-preferences" className="flex items-center p-3 hover:bg-social-gray rounded-md">
                <span>Message Preferences</span>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
