
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRelationshipStatus } from "@/hooks/useRelationshipStatus";
import RelationshipStatusSelector from "./relationship/RelationshipStatusSelector";
import PartnerSelector from "./relationship/PartnerSelector";

const RelationshipStatusUpdater = () => {
  const {
    status,
    setStatus,
    partner,
    setPartner,
    isUpdating,
    potentialPartners,
    handleUpdateStatus
  } = useRelationshipStatus();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Update Relationship Status</CardTitle>
        <CardDescription>
          Set your relationship status to test the safety review functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RelationshipStatusSelector 
          status={status} 
          onStatusChange={setStatus} 
        />
        
        {status !== "Single" && (
          <PartnerSelector
            partner={partner}
            onPartnerChange={setPartner}
            potentialPartners={potentialPartners}
          />
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
