import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, Shield } from "lucide-react";

const genderOptions = [
  { value: "Man", label: "Man" },
  { value: "Woman", label: "Woman" },
  { value: "Trans man", label: "Trans man" },
  { value: "Trans woman", label: "Trans woman" },
  { value: "Non-binary", label: "Non-binary" },
  { value: "Genderfluid", label: "Genderfluid" },
  { value: "Agender", label: "Agender" },
  { value: "Genderqueer", label: "Genderqueer" },
  { value: "Trav (Male Cross-Dresser)", label: "Trav (Male Cross-Dresser)" },
];

const GenderBlockingControls = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [allowedGenders, setAllowedGenders] = useState<string[]>([]);

  // Fetch user's message preferences
  const { data: preferences } = useQuery({
    queryKey: ["messagePreferences", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("message_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching message preferences:", error);
        return null;
      }

      // If no preferences found, create default ones
      if (!data) {
        const { data: newPrefs, error: insertError } = await supabase
          .from("message_preferences")
          .insert({
            user_id: user.id,
            allow_messages: true,
          })
          .select("*")
          .single();

        if (insertError) {
          console.error("Error creating message preferences:", insertError);
          return null;
        }

        return newPrefs;
      }

      return data;
    },
    enabled: !!user,
  });

  // Set allowed genders when preferences are loaded
  useEffect(() => {
    if (preferences) {
      setAllowedGenders(preferences.allow_gender || []);
    }
  }, [preferences]);

  const updateGenderPreferences = async (newAllowedGenders: string[]) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("message_preferences")
        .upsert({
          user_id: user.id,
          allow_messages: preferences?.allow_messages ?? true,
          allow_gender: newAllowedGenders.length ? newAllowedGenders : null,
          allow_marital_status: preferences?.allow_marital_status || null,
        });

      if (error) throw error;

      setAllowedGenders(newAllowedGenders);
      queryClient.invalidateQueries({ queryKey: ["messagePreferences", user.id] });

      toast({
        title: "Preferences Updated",
        description: "Your gender messaging preferences have been saved.",
      });
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenderToggle = (genderValue: string, checked: boolean) => {
    const newAllowedGenders = checked
      ? [...allowedGenders, genderValue]
      : allowedGenders.filter(g => g !== genderValue);
    
    updateGenderPreferences(newAllowedGenders);
  };

  const isBlocked = allowedGenders.length > 0;

  return (
    <Card className="mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <CardTitle className="text-sm">Message Filtering</CardTitle>
                {isBlocked && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {allowedGenders.length} allowed
                  </span>
                )}
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Control which genders can send you messages. If none are selected, all genders are allowed.
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                {genderOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`gender-${option.value}`}
                      checked={allowedGenders.includes(option.value)}
                      onCheckedChange={(checked) => {
                        handleGenderToggle(option.value, checked as boolean);
                      }}
                    />
                    <label 
                      htmlFor={`gender-${option.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>

              {isBlocked && (
                <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-800">
                    You're currently only receiving messages from: {allowedGenders.join(", ")}
                  </p>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => updateGenderPreferences([])}
                disabled={allowedGenders.length === 0}
                className="w-full mt-2"
              >
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default GenderBlockingControls;