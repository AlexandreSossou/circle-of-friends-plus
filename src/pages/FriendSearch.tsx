
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Search as SearchIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Link } from "react-router-dom";

const FriendSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [gender, setGender] = useState<string | undefined>(undefined);
  const [maritalStatus, setMaritalStatus] = useState<string | undefined>(undefined);
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 80]);
  const { toast } = useToast();

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["friendSearch", searchTerm, gender, maritalStatus, ageRange],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("*")
        .order("full_name", { ascending: true });

      if (searchTerm) {
        query = query.ilike("full_name", `%${searchTerm}%`);
      }

      if (gender) {
        query = query.eq("gender", gender);
      }

      if (maritalStatus) {
        query = query.eq("marital_status", maritalStatus);
      }

      if (ageRange[0] > 18 || ageRange[1] < 80) {
        query = query.gte("age", ageRange[0]).lte("age", ageRange[1]);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching friends:", error);
        return [];
      }

      return data || [];
    },
    enabled: true,
  });

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
        description: "Failed to send friend request.",
        variant: "destructive",
      });
      console.error(error);
    } else {
      toast({
        title: "Success",
        description: "Friend request sent!",
      });
    }
  };

  return (
    <MainLayout>
      <div className="social-card p-6 mb-6">
        <h1 className="text-2xl font-bold mb-6">Find Friends</h1>
        
        <div className="space-y-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-social-textSecondary h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Any gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any gender</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maritalStatus">Marital Status</Label>
              <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                <SelectTrigger id="maritalStatus">
                  <SelectValue placeholder="Any status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any status</SelectItem>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                  <SelectItem value="divorced">Divorced</SelectItem>
                  <SelectItem value="widowed">Widowed</SelectItem>
                  <SelectItem value="complicated">It's complicated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Age Range: {ageRange[0]} - {ageRange[1]}</Label>
              <Slider
                value={ageRange}
                min={18}
                max={80}
                step={1}
                onValueChange={(value) => setAgeRange(value as [number, number])}
                className="mt-6"
              />
            </div>
          </div>
        </div>
      </div>
      
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
                  <span>Add Friend</span>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-social-textSecondary">
            {searchTerm || gender || maritalStatus || ageRange[0] > 18 || ageRange[1] < 80 
              ? "No users found matching your search criteria."
              : "Use the search filters above to find friends."}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default FriendSearch;
