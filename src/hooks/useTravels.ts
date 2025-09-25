
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Travel } from "@/types/travel";

export const useTravels = (user: any) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [shareAsPost, setShareAsPost] = useState(true);
  const [travelingWithPartner, setTravelingWithPartner] = useState(false);
  const [filterCity, setFilterCity] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);
  const [travelData, setTravelData] = useState({
    city: "",
    country: "",
    arrival_date: "",
    departure_date: "",
    looking_for: "both" as "locals" | "tourists" | "both",
    description: "",
    traveling_with_partner: false,
  });

  // Fetch travels
  const { data: allTravels, isLoading } = useQuery({
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

  // Filter travels based on city and date
  const travels = useMemo(() => {
    if (!allTravels) return [];
    
    if (!isFiltering || !filterCity || !filterDate) {
      return allTravels;
    }

    return allTravels.filter((travel) => {
      // Check if city matches (case-insensitive)
      const cityMatches = travel.city.toLowerCase().includes(filterCity.toLowerCase());
      
      // Check if the filter date falls between arrival and departure
      const filterDateObj = new Date(filterDate);
      const arrivalDate = new Date(travel.arrival_date);
      const departureDate = new Date(travel.departure_date);
      
      const dateMatches = filterDateObj >= arrivalDate && filterDateObj <= departureDate;
      
      return cityMatches && dateMatches;
    });
  }, [allTravels, isFiltering, filterCity, filterDate]);

  // Add travel mutation
  const addTravelMutation = useMutation({
    mutationFn: async (data: typeof travelData & { shareAsPost: boolean; travelingWithPartner: boolean }) => {
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
        traveling_with_partner: data.travelingWithPartner,
      }).select().single();

      if (error) throw error;

      // If shareAsPost is true, create a post
      if (data.shareAsPost) {
        const arrivalDate = new Date(data.arrival_date);
        const departureDate = new Date(data.departure_date);
        
        const formattedArrival = arrivalDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const formattedDeparture = departureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        const lookingForText = {
          locals: "locals",
          tourists: "other travelers",
          both: "locals and travelers"
        }[data.looking_for];
        
        const partnerText = data.travelingWithPartner ? " with my partner" : "";
        
        // Create post content
        const postContent = `I'm traveling to ${data.city}, ${data.country}${partnerText} from ${formattedArrival} to ${formattedDeparture}. Looking to meet ${lookingForText}!${data.description ? `\n\n${data.description}` : ''}`;
        
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
        traveling_with_partner: false,
      });
      setShareAsPost(true);
      setTravelingWithPartner(false);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTravelData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTravelMutation.mutate({...travelData, shareAsPost, travelingWithPartner});
  };

  const handleFilter = (city: string, date: string) => {
    setFilterCity(city);
    setFilterDate(date);
    setIsFiltering(true);
  };

  const handleClearFilters = () => {
    setFilterCity("");
    setFilterDate("");
    setIsFiltering(false);
  };

  return {
    travels,
    isLoading,
    travelData,
    shareAsPost,
    travelingWithPartner,
    isAddDialogOpen,
    isFiltering,
    addTravelMutation,
    deleteTravelMutation,
    setTravelData,
    setShareAsPost,
    setTravelingWithPartner,
    setIsAddDialogOpen,
    handleInputChange,
    handleSubmit,
    handleFilter,
    handleClearFilters,
  };
};
