
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import NavbarLogo from "./NavbarLogo";
import NavbarSearch from "./NavbarSearch";
import NavbarDesktopNav from "./NavbarDesktopNav";
import NavbarMobileMenu from "./NavbarMobileMenu";
import NavbarUserMenu from "./NavbarUserMenu";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  // Fetch unread messages for mobile menu
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

  return (
    <header
      className={`fixed top-0 left-0 right-0 bg-white z-50 ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4 flex-1">
            <NavbarLogo />
            <NavbarSearch />
          </div>

          <NavbarDesktopNav />

          <div className="flex items-center gap-2">
            <NavbarUserMenu />

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

      {mobileMenuOpen && <NavbarMobileMenu user={user} unreadMessages={unreadMessages || []} />}
    </header>
  );
};

export default Navbar;
