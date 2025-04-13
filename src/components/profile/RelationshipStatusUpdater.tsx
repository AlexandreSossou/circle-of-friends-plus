
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useRelationshipStatus } from "@/hooks/useRelationshipStatus";
import RelationshipStatusSelector from "./relationship/RelationshipStatusSelector";
import PartnerSelector from "./relationship/PartnerSelector";
import RelationshipStatusDisplay from "./relationship/RelationshipStatusDisplay";

const RelationshipStatusUpdater = () => {
  const {
    status,
    setStatus,
    partner,
    setPartner,
    isUpdating,
    isLoading,
    error,
    resetError,
    potentialPartners,
    handleUpdateStatus
  } = useRelationshipStatus();

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Update Relationship Status</CardTitle>
          <CardDescription>
            Loading your relationship data...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Find partner name if available
  const partnerName = partner ? 
    potentialPartners.find(p => p.id === partner)?.full_name : 
    undefined;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Update Relationship Status</CardTitle>
        <CardDescription>
          Set your relationship status to test the safety review functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {status && partner && status !== "Single" && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm font-medium mb-2">Current Status:</p>
            <RelationshipStatusDisplay 
              status={status} 
              partnerId={partner} 
              partnerName={partnerName}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Note: Changing your relationship status will notify your partner and update their status accordingly.
            </p>
          </div>
        )}
        
        <RelationshipStatusSelector 
          status={status} 
          onStatusChange={(newStatus) => {
            setStatus(newStatus);
            resetError();
            // Reset partner if changing to Single
            if (newStatus === "Single") {
              setPartner("");
            }
          }} 
        />
        
        {status !== "Single" && (
          <PartnerSelector
            partner={partner}
            onPartnerChange={(newPartner) => {
              setPartner(newPartner);
              resetError();
            }}
            potentialPartners={potentialPartners}
          />
        )}
        
        <Button 
          onClick={handleUpdateStatus} 
          disabled={isUpdating || (status !== "Single" && !partner)}
          className="w-full"
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Relationship Status"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RelationshipStatusUpdater;
