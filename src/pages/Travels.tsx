
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import { Calendar, MapPin, Plane, User, Plus, Trash2, Edit, Users } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";

interface Travel {
  id: string;
  user_id: string;
  city: string;
  country: string;
  arrival_date: string;
  departure_date: string;
  looking_for: "locals" | "tourists" | "both";
  description: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

const Travels = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [shareAsPost, setShareAsPost] = useState(true);
  const [travelData, setTravelData] = useState({
    city: "",
    country: "",
    arrival_date: "",
    departure_date: "",
    looking_for: "both" as "locals" | "tourists" | "both",
    description: "",
  });

  // Fetch travels
  const { data: travels, isLoading } = useQuery({
    queryKey: ["travels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("travels")
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .order("arrival_date", { ascending: true });

      if (error) {
        throw error;
      }
      
      return data as Travel[];
    },
  });

  // Add travel mutation
  const addTravelMutation = useMutation({
    mutationFn: async (data: typeof travelData & { shareAsPost: boolean }) => {
      if (!user) throw new Error("You must be logged in to add travel plans");
      
      // Insert travel plan
      const { data: travelData, error } = await supabase.from("travels").insert({
        user_id: user.id,
        city: data.city,
        country: data.country,
        arrival_date: data.arrival_date,
        departure_date: data.departure_date,
        looking_for: data.looking_for,
        description: data.description,
      }).select().single();

      if (error) throw error;

      // If shareAsPost is true, create a post
      if (data.shareAsPost) {
        const arrivalDate = new Date(data.arrival_date);
        const departureDate = new Date(data.departure_date);
        
        const formattedArrival = format(arrivalDate, "MMM d, yyyy");
        const formattedDeparture = format(departureDate, "MMM d, yyyy");
        
        const lookingForText = {
          locals: "locals",
          tourists: "other travelers",
          both: "locals and travelers"
        }[data.looking_for];
        
        // Create post content
        const postContent = `I'm traveling to ${data.city}, ${data.country} from ${formattedArrival} to ${formattedDeparture}. Looking to meet ${lookingForText}!${data.description ? `\n\n${data.description}` : ''}`;
        
        const { error: postError } = await supabase.from("posts").insert({
          user_id: user.id,
          content: postContent,
        });
        
        if (postError) {
          console.error("Error creating post:", postError);
          // We don't throw here to avoid failing the whole operation
          // Instead we'll show a toast about the partial success
        }
      }
      
      return travelData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["travels"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setTravelData({
        city: "",
        country: "",
        arrival_date: "",
        departure_date: "",
        looking_for: "both",
        description: "",
      });
      setShareAsPost(true);
      setIsAddDialogOpen(false);
      toast({
        title: "Success!",
        description: "Your travel plan has been added.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add travel plan",
        variant: "destructive",
      });
    },
  });

  // Delete travel mutation
  const deleteTravelMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("travels").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["travels"] });
      toast({
        title: "Success!",
        description: "Travel plan deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete travel plan",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTravelData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTravelMutation.mutate({...travelData, shareAsPost});
  };

  const groupTravelsByLocation = (travels: Travel[]) => {
    return travels.reduce((acc, travel) => {
      const key = `${travel.city}, ${travel.country}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(travel);
      return acc;
    }, {} as Record<string, Travel[]>);
  };

  const isCurrentlyTraveling = (travel: Travel) => {
    const now = new Date();
    const arrival = parseISO(travel.arrival_date);
    const departure = parseISO(travel.departure_date);
    return isAfter(now, arrival) && isBefore(now, departure);
  };

  const isFutureTraveling = (travel: Travel) => {
    const now = new Date();
    const arrival = parseISO(travel.arrival_date);
    return isAfter(arrival, now);
  };

  const renderLookingForText = (lookingFor: "locals" | "tourists" | "both") => {
    switch (lookingFor) {
      case "locals":
        return "Looking to meet locals";
      case "tourists":
        return "Looking to meet other travelers";
      case "both":
        return "Looking to meet locals and travelers";
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Travel Plans</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-1" /> Add Travel Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Travel Plan</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={travelData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        value={travelData.country}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="arrival_date">Arrival Date</Label>
                      <Input
                        id="arrival_date"
                        name="arrival_date"
                        type="date"
                        value={travelData.arrival_date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="departure_date">Departure Date</Label>
                      <Input
                        id="departure_date"
                        name="departure_date"
                        type="date"
                        value={travelData.departure_date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="looking_for">Looking to meet</Label>
                    <Select
                      name="looking_for"
                      value={travelData.looking_for}
                      onValueChange={(value) => setTravelData((prev) => ({ ...prev, looking_for: value as "locals" | "tourists" | "both" }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Who do you want to meet?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="locals">Locals</SelectItem>
                        <SelectItem value="tourists">Other Travelers</SelectItem>
                        <SelectItem value="both">Both Locals and Travelers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Tell others about your trip and what you're interested in..."
                      value={travelData.description}
                      onChange={handleInputChange}
                      className="h-24"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="shareAsPost" 
                      checked={shareAsPost} 
                      onCheckedChange={(checked) => setShareAsPost(checked as boolean)}
                    />
                    <label
                      htmlFor="shareAsPost"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Share as post on my feed
                    </label>
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button 
                    type="submit" 
                    disabled={addTravelMutation.isPending}
                  >
                    {addTravelMutation.isPending ? "Saving..." : "Save Travel Plan"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <p>Loading travel plans...</p>
          </div>
        ) : travels && travels.length > 0 ? (
          <div className="space-y-8">
            {/* Currently Traveling Section */}
            {travels.some(isCurrentlyTraveling) && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Currently Traveling</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {travels.filter(isCurrentlyTraveling).map((travel) => (
                    <TravelCard 
                      key={travel.id} 
                      travel={travel} 
                      currentUser={user}
                      onDelete={() => deleteTravelMutation.mutate(travel.id)}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Upcoming Travels Section */}
            {travels.some(isFutureTraveling) && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Upcoming Travels</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {travels.filter(isFutureTraveling).map((travel) => (
                    <TravelCard 
                      key={travel.id} 
                      travel={travel} 
                      currentUser={user}
                      onDelete={() => deleteTravelMutation.mutate(travel.id)}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Travel by Location Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Travel Destinations</h2>
              {Object.entries(groupTravelsByLocation(travels)).map(([location, travels]) => (
                <div key={location} className="mb-6">
                  <h3 className="font-medium text-lg flex items-center mb-3">
                    <MapPin className="w-5 h-5 mr-1 text-social-blue" />
                    {location}
                    <span className="ml-2 text-sm text-social-textSecondary">
                      ({travels.length} {travels.length === 1 ? "traveler" : "travelers"})
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {travels.map((travel) => (
                      <TravelCard 
                        key={travel.id} 
                        travel={travel} 
                        currentUser={user}
                        onDelete={() => deleteTravelMutation.mutate(travel.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <Plane className="w-16 h-16 mx-auto mb-4 text-social-textSecondary" />
            <h3 className="text-xl font-medium mb-2">No travel plans yet</h3>
            <p className="text-social-textSecondary mb-6">
              Add your travel plans to connect with locals and other tourists
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add Your First Travel Plan
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

interface TravelCardProps {
  travel: Travel;
  currentUser: any;
  onDelete: () => void;
}

const TravelCard = ({ travel, currentUser, onDelete }: TravelCardProps) => {
  const isCurrentUserTravel = currentUser && travel.user_id === currentUser.id;
  const isCurrentlyTraveling = () => {
    const now = new Date();
    const arrival = parseISO(travel.arrival_date);
    const departure = parseISO(travel.departure_date);
    return isAfter(now, arrival) && isBefore(now, departure);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-0">
        <div className="flex items-center">
          <Avatar className="mr-3">
            <AvatarImage src={travel.profiles.avatar_url || "/placeholder.svg"} alt={travel.profiles.full_name || "User"} />
            <AvatarFallback>
              {travel.profiles.full_name?.split(" ").map(n => n[0]).join("") || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{travel.profiles.full_name || "User"}</CardTitle>
            <div className="flex items-center text-sm text-social-textSecondary">
              <MapPin className="w-3 h-3 mr-1" />
              {travel.city}, {travel.country}
            </div>
          </div>
        </div>
        {isCurrentlyTraveling() && (
          <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Currently there</div>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center text-social-textSecondary">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="text-sm">
              {format(parseISO(travel.arrival_date), "MMM d, yyyy")} - {format(parseISO(travel.departure_date), "MMM d, yyyy")}
            </span>
          </div>
          <div className="flex items-center text-social-textSecondary">
            <Users className="w-4 h-4 mr-2" />
            <span className="text-sm">{renderLookingForText(travel.looking_for)}</span>
          </div>
          {travel.description && (
            <p className="text-sm mt-2">{travel.description}</p>
          )}
        </div>
      </CardContent>
      {isCurrentUserTravel && (
        <CardFooter className="p-4 pt-0 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4 mr-1" /> Delete
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

function renderLookingForText(lookingFor: "locals" | "tourists" | "both") {
  switch (lookingFor) {
    case "locals":
      return "Looking to meet locals";
    case "tourists":
      return "Looking to meet other travelers";
    case "both":
      return "Looking to meet locals and travelers";
  }
}

export default Travels;
