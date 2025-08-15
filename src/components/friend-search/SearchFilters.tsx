
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { SearchIcon, MapPin, Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  gender: string | undefined;
  setGender: (gender: string) => void;
  maritalStatus: string | undefined;
  setMaritalStatus: (status: string) => void;
  ageRange: [number, number];
  setAgeRange: (range: [number, number]) => void;
  location: string;
  setLocation: (location: string) => void;
  usaSearch: boolean;
  setUsaSearch: (usa: boolean) => void;
  usaState: string;
  setUsaState: (state: string) => void;
  milesRange: number;
  setMilesRange: (miles: number) => void;
}

const SearchFilters = ({
  searchTerm,
  setSearchTerm,
  gender,
  setGender,
  maritalStatus,
  setMaritalStatus,
  ageRange,
  setAgeRange,
  location,
  setLocation,
  usaSearch,
  setUsaSearch,
  usaState,
  setUsaState,
  milesRange,
  setMilesRange
}: SearchFiltersProps) => {
  const [currentUserAge, setCurrentUserAge] = useState<number | null>(null);
  const { toast } = useToast();

  // US States list
  const usStates = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
    "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
    "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
    "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
    "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
    "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
    "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
  ];

  // Fetch current user's age when component mounts
  useEffect(() => {
    const fetchCurrentUserAge = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("age")
          .eq("id", user.id)
          .single();
        
        if (data) {
          setCurrentUserAge(data.age);
          
          // If user is over 40, enforce minimum age restriction
          if (data.age && data.age > 40 && ageRange[0] < 22) {
            setAgeRange([22, ageRange[1]]);
            toast({
              title: "Age Restriction Applied",
              description: "Users over 40 cannot search for users under 22.",
            });
          }
        }
      }
    };
    
    fetchCurrentUserAge();
  }, []);

  // Enforce age restriction when user attempts to change age range
  const handleAgeRangeChange = (value: [number, number]) => {
    if (currentUserAge && currentUserAge > 40 && value[0] < 22) {
      const newRange: [number, number] = [22, value[1]];
      setAgeRange(newRange);
      toast({
        title: "Age Restriction Applied",
        description: "Users over 40 cannot search for users under 22.",
      });
    } else {
      setAgeRange(value);
    }
  };

  return (
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-social-textSecondary h-5 w-5" />
          <Input
            type="text"
            placeholder="Search by city or location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-10"
            disabled={usaSearch}
          />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="usa-search"
              checked={usaSearch}
              onCheckedChange={(checked) => {
                setUsaSearch(checked as boolean);
                if (checked) {
                  setLocation("");
                } else {
                  setUsaState("");
                }
              }}
            />
            <div className="flex items-center space-x-1">
              <Flag className="h-4 w-4 text-social-textSecondary" />
              <Label htmlFor="usa-search" className="text-sm font-medium">
                Search in USA
              </Label>
            </div>
          </div>
          
          {usaSearch && (
            <div className="space-y-2">
              <Label htmlFor="usa-state">State</Label>
              <Select value={usaState} onValueChange={setUsaState}>
                <SelectTrigger id="usa-state">
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  {usStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {usaState && (
                <div className="space-y-2 mt-4">
                  <Label htmlFor="miles-range">
                    Distance Range: {milesRange} miles
                  </Label>
                  <Slider
                    id="miles-range"
                    value={[milesRange]}
                    min={5}
                    max={500}
                    step={5}
                    onValueChange={([value]) => setMilesRange(value)}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-social-textSecondary">
                    <span>5 miles</span>
                    <span>500 miles</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
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
            onValueChange={handleAgeRangeChange}
            className="mt-6"
          />
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
