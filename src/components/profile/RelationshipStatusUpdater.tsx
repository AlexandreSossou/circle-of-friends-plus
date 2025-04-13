
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateRelationshipStatus } from "@/services/safetyReviews";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const RelationshipStatusUpdater = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<string>("Single");
  const [partner, setPartner] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [potentialPartners, setPotentialPartners] = useState<{id: string, full_name: string}[]>([]);
  
  // Fetch potential partners from real profiles table
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .neq('id', user.id);
      
      if (error) {
        console.error("Error fetching profiles:", error);
        return;
      }
      
      if (data) {
        // Don't filter out profiles without full_name, just use a fallback display name
        setPotentialPartners(data.map(profile => ({
          id: profile.id,
          full_name: profile.full_name || `User ${profile.id.substring(0, 8)}`
        })));
        
        console.log("Available partners:", data);
      }
    };
    
    fetchProfiles();
  }, [user]);
  
  // Fetch current relationship status
  useEffect(() => {
    const fetchCurrentStatus = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('marital_status, partner_id')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error("Error fetching current status:", error);
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
    };
    
    fetchCurrentStatus();
  }, [user]);

  const handleUpdateStatus = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    
    try {
      const result = await updateRelationshipStatus({
        userId: user.id,
        maritalStatus: status,
        partnerId: status === "Single" ? undefined : partner || undefined
      });
      
      if (result.success) {
        toast({
          title: "Status updated",
          description: "Your relationship status has been updated successfully."
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
                  <SelectItem value="" disabled>No potential partners found</SelectItem>
                )}
              </SelectContent>
            </Select>
            {potentialPartners.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                No profiles found. You may need to create more users in your database.
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
