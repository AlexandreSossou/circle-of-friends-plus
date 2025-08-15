import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Announcement } from "@/types/announcement";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AnnouncementCarouselProps {
  userLocation?: string;
}

export const AnnouncementCarousel = ({ userLocation }: AnnouncementCarouselProps) => {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch regional announcements
  const { data: announcements = [] } = useQuery({
    queryKey: ["regional-announcements", userLocation],
    queryFn: async () => {
      if (!userLocation) return [];

      const { data: announcementData, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("visibility", "public")
        .ilike("location", `%${userLocation}%`)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching regional announcements:", error);
        return [];
      }

      // Fetch profile data for each announcement
      const announcementsWithProfiles = await Promise.all(
        announcementData.map(async (announcement) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .eq("id", announcement.user_id)
            .single();

          return {
            ...announcement,
            profiles: profileData || { id: announcement.user_id, full_name: null, avatar_url: null }
          };
        })
      );

      return announcementsWithProfiles as Announcement[];
    },
    enabled: !!user && !!userLocation,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Auto-rotate carousel every 2.5 seconds
  useEffect(() => {
    if (announcements.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [announcements.length]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? announcements.length - 1 : prevIndex - 1
    );
  };

  const getUserInitials = (name: string | null) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (announcements.length === 0) {
    return null;
  }

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div className="social-card p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Local Announcements</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={prevSlide}
            className="p-1 hover:bg-social-gray rounded-full transition-colors"
            aria-label="Previous announcement"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button
            onClick={nextSlide}
            className="p-1 hover:bg-social-gray rounded-full transition-colors"
            aria-label="Next announcement"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div className="transition-transform duration-300 ease-in-out">
          <div className="flex items-start gap-3">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage 
                src={currentAnnouncement.profiles.avatar_url || "/placeholder.svg"} 
                alt={currentAnnouncement.profiles.full_name || "User"} 
              />
              <AvatarFallback className="text-xs">
                {getUserInitials(currentAnnouncement.profiles.full_name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">
                {currentAnnouncement.title}
              </h4>
              
              <p className="text-xs text-social-textSecondary mb-1">
                by {currentAnnouncement.profiles.full_name || "Anonymous"}
              </p>
              
              {currentAnnouncement.description && (
                <p className="text-xs text-social-textPrimary line-clamp-2 mb-2">
                  {currentAnnouncement.description}
                </p>
              )}
              
              <div className="flex items-center gap-2 text-xs text-social-textSecondary">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{currentAnnouncement.location}</span>
                </div>
                <div className="px-1.5 py-0.5 bg-social-lightblue text-social-blue rounded-full text-xs font-medium">
                  {currentAnnouncement.category}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress indicators */}
        {announcements.length > 1 && (
          <div className="flex justify-center gap-1 mt-3">
            {announcements.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  index === currentIndex ? "bg-social-blue" : "bg-social-gray"
                }`}
                aria-label={`Go to announcement ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};