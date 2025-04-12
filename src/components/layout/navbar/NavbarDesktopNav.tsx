
import { Link } from "react-router-dom";
import { Bell, Home, MessageCircle, Plane, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import NavbarMessagesDropdown from "./NavbarMessagesDropdown";

const NavbarDesktopNav = () => {
  const { user } = useAuth();

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

  return (
    <nav className="hidden md:flex items-center space-x-1">
      <Link to="/" className="p-2 text-social-blue hover:bg-social-lightblue rounded-full">
        <Home className="w-6 h-6" />
      </Link>
      <Link to="/friends" className="p-2 text-social-textSecondary hover:bg-social-gray rounded-full">
        <Users className="w-6 h-6" />
      </Link>
      
      <NavbarMessagesDropdown unreadMessages={unreadMessages || []} />
      
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
  );
};

export default NavbarDesktopNav;
