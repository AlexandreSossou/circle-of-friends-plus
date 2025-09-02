import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LocalAlert } from "@/types/localAlert";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, MapPin } from "lucide-react";

interface LocalAlertCarouselProps {
  userLocation?: string;
}

export const LocalAlertCarousel = ({ userLocation }: LocalAlertCarouselProps) => {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Fetch regional local alerts
  const { data: localAlerts = [] } = useQuery({
    queryKey: ["regionalLocalAlerts", userLocation],
    queryFn: async () => {
      if (!user?.id || !userLocation) return [];

      let query = supabase
        .from("announcements")
        .select(`
          *,
          profiles:user_id(
            id,
            full_name,
            avatar_url
          )
        `)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(10);

      // Try different location matching strategies
      const locationVariations = [
        userLocation,
        userLocation.toLowerCase(),
        userLocation.split(',')[0], // First part of location
        userLocation.split(',')[0]?.trim().toLowerCase()
      ].filter(Boolean);

      // Use OR condition to match any of the location variations
      const { data, error } = await query
        .or(locationVariations.map(loc => `location.ilike.%${loc}%`).join(','));

      if (error) {
        console.error("Error fetching regional local alerts:", error);
        return [];
      }

      // Get profiles for each local alert
      const localAlertsWithProfiles = await Promise.all(
        (data || []).map(async (localAlert) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .eq("id", localAlert.user_id)
            .single();

          return {
            ...localAlert,
            profiles: profileData || { id: localAlert.user_id, full_name: null, avatar_url: null }
          };
        })
      );

      return localAlertsWithProfiles as LocalAlert[];
    },
    enabled: !!user && !!userLocation,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Auto-rotate carousel
  useEffect(() => {
    if (localAlerts.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % localAlerts.length);
      }, 2500); // Change every 2.5 seconds

      return () => clearInterval(interval);
    }
  }, [localAlerts.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % localAlerts.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + localAlerts.length) % localAlerts.length);
  };

  const getUserInitials = (name: string | null) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (localAlerts.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-social-textSecondary">
            No local alerts in your area right now
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentLocalAlert = localAlerts[currentIndex];

  return (
    <Card className="mb-6 overflow-hidden">
      <div className="flex items-center justify-between p-2 bg-social-lightblue border-b">
        <span className="text-xs font-medium text-social-blue">Local Alerts in Your Area</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-6 w-6 p-0"
        >
          {isCollapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
        </Button>
      </div>
      
      {!isCollapsed && (
        <CardContent className="p-4">
          <div className="relative">
            <div className="flex items-start gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage 
                  src={currentLocalAlert.profiles.avatar_url || "/placeholder.svg"} 
                  alt={currentLocalAlert.profiles.full_name || "User"} 
                />
                <AvatarFallback className="text-xs">
                  {getUserInitials(currentLocalAlert.profiles.full_name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm leading-tight mb-1">
                  {currentLocalAlert.title}
                </h4>
                
                {currentLocalAlert.description && (
                  <p className="text-xs text-social-textSecondary mb-2 line-clamp-2">
                    {currentLocalAlert.description}
                  </p>
                )}
                
                <div className="flex items-center gap-3 text-xs text-social-textSecondary">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{currentLocalAlert.location}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-social-lightblue text-social-blue rounded text-xs">
                    {currentLocalAlert.category}
                  </span>
                </div>
              </div>
            </div>

            {localAlerts.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 p-0 bg-white/80 hover:bg-white"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6 p-0 bg-white/80 hover:bg-white"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>

          {localAlerts.length > 1 && (
            <div className="flex justify-center gap-1 mt-3">
              {localAlerts.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    index === currentIndex ? "bg-social-blue" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};