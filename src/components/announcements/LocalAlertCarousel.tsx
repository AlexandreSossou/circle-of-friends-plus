import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LocalAlert } from "@/types/localAlert";
import { ChevronLeft, ChevronRight, MapPin, Trash2 } from "lucide-react";
import { formatDistance } from "date-fns";

interface LocalAlertCarouselProps {
  localAlerts: LocalAlert[];
  onDelete: (id: string) => void;
}

export const LocalAlertCarousel = ({ localAlerts, onDelete }: LocalAlertCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate carousel
  useEffect(() => {
    if (localAlerts.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % localAlerts.length);
      }, 4000); // Change every 4 seconds

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
    return null;
  }

  const currentLocalAlert = localAlerts[currentIndex];

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="relative">
            <div className="flex items-start gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage 
                  src={currentLocalAlert.profiles?.avatar_url || "/placeholder.svg"} 
                  alt={currentLocalAlert.profiles?.full_name || "User"} 
                />
                <AvatarFallback>
                  {getUserInitials(currentLocalAlert.profiles?.full_name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-lg leading-tight mb-2">
                    {currentLocalAlert.title}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(currentLocalAlert.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {currentLocalAlert.description && (
                  <p className="text-social-textSecondary mb-3 leading-relaxed">
                    {currentLocalAlert.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-social-textSecondary">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{currentLocalAlert.location}</span>
                  </div>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    {currentLocalAlert.category}
                  </span>
                  <span>
                    {formatDistance(new Date(currentLocalAlert.created_at), new Date(), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>

            {localAlerts.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 h-8 w-8 rounded-full bg-background shadow-md"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 h-8 w-8 rounded-full bg-background shadow-md"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {localAlerts.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {localAlerts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-primary" : "bg-muted hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {localAlerts.length > 1 && (
        <div className="text-center text-sm text-social-textSecondary">
          Showing {currentIndex + 1} of {localAlerts.length} local alerts
        </div>
      )}
    </div>
  );
};