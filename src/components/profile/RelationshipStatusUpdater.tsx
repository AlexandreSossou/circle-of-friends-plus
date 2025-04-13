
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateRelationshipStatus } from "@/services/safetyReviews";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { mockProfiles } from "@/services/mocks/mockProfiles";

const RelationshipStatusUpdater = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<string>("Single");
  const [partner, setPartner] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Get potential partners from our mock profiles
  const potentialPartners = Object.values(mockProfiles).filter(profile => 
    profile.id !== user?.id
  );

  const handleUpdateStatus = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    
    try {
      const result = await updateRelationshipStatus({
        userId: user.id,
        maritalStatus: status,
        partnerId: partner || undefined
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
                {potentialPartners.map(profile => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <Button 
          onClick={handleUpdateStatus} 
          disabled={isUpdating}
          className="w-full"
        >
          {isUpdating ? "Updating..." : "Update Relationship Status"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RelationshipStatusUpdater;
