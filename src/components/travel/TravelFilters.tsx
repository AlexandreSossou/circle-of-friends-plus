import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Calendar, MapPin, X } from "lucide-react";

interface TravelFiltersProps {
  onFilter: (city: string, date: string) => void;
  onClearFilters: () => void;
  isFiltering: boolean;
}

export const TravelFilters = ({ onFilter, onClearFilters, isFiltering }: TravelFiltersProps) => {
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim() && date) {
      onFilter(city.trim(), date);
    }
  };

  const handleClear = () => {
    setCity("");
    setDate("");
    onClearFilters();
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Search className="w-5 h-5 mr-2 text-social-blue" />
          Find Travelers by City & Date
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFilter} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="filter-city" className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                City
              </Label>
              <Input
                id="filter-city"
                placeholder="e.g. Paris"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="filter-date" className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Date
              </Label>
              <Input
                id="filter-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={!city.trim() || !date}
              className="flex-1"
            >
              <Search className="w-4 h-4 mr-2" />
              Search Travelers
            </Button>
            
            {isFiltering && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClear}
                className="flex items-center"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};