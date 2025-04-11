import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Home, Menu, MessageSquare, Search, Users, X } from "lucide-react";
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

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

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

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
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
          </nav>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full" size="icon">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
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
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
