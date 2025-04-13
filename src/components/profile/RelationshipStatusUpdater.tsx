
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateRelationshipStatus } from "@/services/safetyReviews";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { mockProfiles } from "@/services/mocks/mockProfiles";

const RelationshipStatusUpdater = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<string>("Single");
  const [partner, setPartner] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [potentialPartners, setPotentialPartners] = useState<{id: string, full_name: string}[]>([]);
  
  // Fetch potential partners from real profiles table or use mock data as fallback
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user) return;
      
      try {
        console.log("Fetching profiles from database...");
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name')
          .neq('id', user.id);
        
        if (error) {
          console.error("Error fetching profiles:", error);
          // Fall back to mock data if database query fails
          useMockProfiles();
          return;
        }
        
        if (data && data.length > 0) {
          console.log("Got profiles from database:", data.length);
          // Don't filter out profiles without full_name, just use a fallback display name
          setPotentialPartners(data.map(profile => ({
            id: profile.id,
            full_name: profile.full_name || `User ${profile.id.substring(0, 8)}`
          })));
        } else {
          // If no database profiles, use mock profiles
          console.log("No profiles found in database, using mock data");
          useMockProfiles();
        }
      } catch (err) {
        console.error("Exception when fetching profiles:", err);
        useMockProfiles();
      }
    };
    
    const useMockProfiles = () => {
      console.log("Using mock profiles as partners");
      // Use mock profiles as fallback, excluding the current user
      const mockPartners = Object.values(mockProfiles)
        .filter(profile => profile.id !== user?.id)
        .map(profile => ({
          id: profile.id,
          full_name: profile.full_name || `User ${profile.id.substring(0, 8)}`
        }));
      
      setPotentialPartners(mockPartners);
      console.log("Available mock partners:", mockPartners.length);
    };
    
    fetchProfiles();
  }, [user]);
  
  // Fetch current relationship status
  useEffect(() => {
    const fetchCurrentStatus = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('marital_status, partner_id')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error("Error fetching current status:", error);
          // Try using mock data for current user
          if (mockProfiles[user.id]) {
            const mockUser = mockProfiles[user.id];
            if (mockUser.marital_status) {
              setStatus(mockUser.marital_status);
            }
            if (mockUser.partner_id) {
              setPartner(mockUser.partner_id);
            }
          }
          return;
        }
        
        if (data) {
          if (data.marital_status) {
            setStatus(data.marital_status);
          }
          if (data.partner_id) {
            setPartner(data.partner_id);
          }
        }
      } catch (err) {
        console.error("Exception when fetching current status:", err);
      }
    };
    
    fetchCurrentStatus();
  }, [user]);

  const handleUpdateStatus = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    
    try {
      // Verify partner exists in our potential partners list
      if (status !== "Single" && partner) {
        const partnerExists = potentialPartners.some(p => p.id === partner);
        if (!partnerExists) {
          console.error("Selected partner not found in potential partners list");
          toast({
            title: "Update failed",
            description: "The selected partner doesn't exist or is no longer available",
            variant: "destructive"
          });
          setIsUpdating(false);
          return;
        }
      }
      
      const result = await updateRelationshipStatus({
        userId: user.id,
        maritalStatus: status,
        partnerId: status === "Single" ? undefined : partner || undefined
      });
      
      if (result.success) {
        const partnerName = status !== "Single" && partner 
          ? potentialPartners.find(p => p.id === partner)?.full_name || "your partner"
          : "";
          
        toast({
          title: "Status updated",
          description: status === "Single" 
            ? "Your relationship status has been updated to Single."
            : `Your relationship status has been updated to ${status} with ${partnerName}.`
        });
      } else {
        toast({
          title: "Update failed",
          description: result.error || "Failed to update relationship status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error updating relationship status:", error);
      toast({
        title: "Update failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Update Relationship Status</CardTitle>
        <CardDescription>
          Set your relationship status to test the safety review functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="status">Relationship Status</Label>
          <Select 
            value={status} 
            onValueChange={setStatus}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Single">Single</SelectItem>
              <SelectItem value="In a relationship">In a relationship</SelectItem>
              <SelectItem value="Engaged">Engaged</SelectItem>
              <SelectItem value="Married">Married</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {status !== "Single" && (
          <div className="space-y-2">
            <Label htmlFor="partner">Partner</Label>
            <Select 
              value={partner} 
              onValueChange={setPartner}
            >
              <SelectTrigger id="partner">
                <SelectValue placeholder="Select partner" />
              </SelectTrigger>
              <SelectContent>
                {potentialPartners.length > 0 ? (
                  potentialPartners.map(profile => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.full_name}
                    </SelectItem>
                  ))
                ) : (
                  // Using a non-empty string value for the disabled placeholder item
                  <SelectItem value="no-partner-found" disabled>No potential partners found</SelectItem>
                )}
              </SelectContent>
            </Select>
            {potentialPartners.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                No profiles found. Check console logs for details.
              </p>
            )}
          </div>
        )}
        
        <Button 
          onClick={handleUpdateStatus} 
          disabled={isUpdating || (status !== "Single" && !partner)}
          className="w-full"
        >
          {isUpdating ? "Updating..." : "Update Relationship Status"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RelationshipStatusUpdater;
