
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  age: number | null;
  gender: string | null;
  marital_status: string | null;
  location: string | null;
}

interface SearchResultsProps {
  searchResults: Profile[] | null;
  isLoading: boolean;
  searchTerm: string;
  gender: string | undefined;
  maritalStatus: string | undefined;
  ageRange: [number, number];
  location: string;
}

const SearchResults = ({ 
  searchResults, 
  isLoading, 
  searchTerm, 
  gender, 
  maritalStatus, 
  ageRange,
  location
}: SearchResultsProps) => {
  const { toast } = useToast();

  const handleSendFriendRequest = async (userId: string) => {
    const { error } = await supabase
      .from("friends")
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        friend_id: userId,
        status: "pending"
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send Lovarino request.",
        variant: "destructive",
      });
      console.error(error);
    } else {
      toast({
        title: "Success",
        description: "Lovarino request sent!",
      });
    }
  };

  return (
    <div className="social-card p-6">
      <h2 className="text-xl font-semibold mb-4">Search Results</h2>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : searchResults && searchResults.length > 0 ? (
        <div className="divide-y">
          {searchResults.map((profile) => (
            <div 
              key={profile.id} 
              className="py-4 flex items-center justify-between"
            >
              <div className="flex items-center">
                <Avatar className="mr-4">
                  <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.full_name || ""} />
                  <AvatarFallback>
                    {profile.full_name?.split(" ").map(name => name[0]).join("") || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">
                    <Link to={`/profile/${profile.id}`} className="hover:underline">
                      {profile.full_name}
                    </Link>
                  </h3>
                  <div className="text-sm text-social-textSecondary space-x-2">
                    {profile.age && <span>{profile.age} years</span>}
                    {profile.gender && <span>• {profile.gender}</span>}
                    {profile.marital_status && <span>• {profile.marital_status}</span>}
                    {profile.location && <span>• {profile.location}</span>}
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => handleSendFriendRequest(profile.id)}
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Lovarino</span>
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-social-textSecondary">
          {searchTerm || gender || maritalStatus || ageRange[0] > 18 || ageRange[1] < 80 || location
            ? "No users found matching your search criteria."
            : "Use the search filters above to find Lovarinos."}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
