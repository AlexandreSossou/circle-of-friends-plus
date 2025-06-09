
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RelationshipPreference } from "@/types/profile";
import { fetchRelationshipPreferences } from "@/services/relationshipPreferences";

interface LookingForSelectorProps {
  lookingFor: string[];
  onLookingForChange: (values: string[]) => void;
}

const LookingForSelector = ({ 
  lookingFor, 
  onLookingForChange 
}: LookingForSelectorProps) => {
  const [preferences, setPreferences] = useState<RelationshipPreference[]>([]);
  const [selectedPreference, setSelectedPreference] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPreferences = async () => {
      setIsLoading(true);
      try {
        const prefs = await fetchRelationshipPreferences();
        setPreferences(prefs);
      } catch (error) {
        console.error("Error loading preferences:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPreferences();
  }, []);

  const availablePreferences = preferences.filter(
    p => !lookingFor.includes(p.name)
  );

  const handleAddPreference = () => {
    if (selectedPreference && !lookingFor.includes(selectedPreference)) {
      onLookingForChange([...lookingFor, selectedPreference]);
      setSelectedPreference("");
    }
  };

  const handleRemovePreference = (prefName: string) => {
    onLookingForChange(lookingFor.filter(name => name !== prefName));
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>What are you looking for?</Label>
        <div className="text-sm text-muted-foreground">Loading preferences...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label>What are you looking for?</Label>
      
      {lookingFor.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {lookingFor.map(prefName => {
            const pref = preferences.find(p => p.name === prefName);
            return (
              <Badge key={prefName} variant="secondary" className="px-2 py-1 flex items-center gap-1">
                <span>{prefName}</span>
                {pref?.description && (
                  <span className="text-xs opacity-70">- {pref.description}</span>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 p-0 ml-1" 
                  onClick={() => handleRemovePreference(prefName)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}
      
      <div className="flex gap-2">
        <div className="flex-1">
          <Select 
            value={selectedPreference} 
            onValueChange={setSelectedPreference}
            disabled={availablePreferences.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select what you're looking for" />
            </SelectTrigger>
            <SelectContent>
              {availablePreferences.length > 0 ? (
                availablePreferences.map(pref => (
                  <SelectItem key={pref.id} value={pref.name}>
                    <div>
                      <div className="font-medium">{pref.name}</div>
                      {pref.description && (
                        <div className="text-xs text-muted-foreground">{pref.description}</div>
                      )}
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-preferences" disabled>
                  All preferences selected
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          type="button" 
          size="sm" 
          variant="outline" 
          disabled={!selectedPreference}
          onClick={handleAddPreference}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Select what you're looking for in your private connections. This helps others find you based on shared interests.
      </p>
    </div>
  );
};

export default LookingForSelector;
