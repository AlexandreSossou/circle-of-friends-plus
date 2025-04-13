
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useRelationshipStatus } from "@/hooks/useRelationshipStatus";
import RelationshipStatusSelector from "./relationship/RelationshipStatusSelector";
import PartnerSelector from "./relationship/PartnerSelector";
import MultiPartnerSelector from "./relationship/MultiPartnerSelector";
import RelationshipStatusDisplay from "./relationship/RelationshipStatusDisplay";

const RelationshipStatusUpdater = () => {
  const {
    status,
    setStatus,
    partner,
    setPartner,
    partners,
    setPartners,
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

  // Find partner names
  const getPartnerNames = () => {
    if (status === "Polyamorous" && partners.length > 0) {
      return partners.map(id => {
        const partner = potentialPartners.find(p => p.id === id);
        return partner ? partner.full_name : undefined;
      }).filter(Boolean);
    } else if (partner) {
      const foundPartner = potentialPartners.find(p => p.id === partner);
      return foundPartner ? [foundPartner.full_name] : [];
    }
    return [];
  };

  const partnerNames = getPartnerNames();
  const isPolyamorous = status === "Polyamorous";

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
        
        {status && (partner || partners.length > 0) && status !== "Single" && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm font-medium mb-2">Current Status:</p>
            <RelationshipStatusDisplay 
              status={status} 
              partnerId={partner}
              partnerIds={isPolyamorous ? partners : undefined}
              partnerNames={partnerNames}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Note: Changing your relationship status will notify your partner(s) and update their status accordingly.
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
              setPartners([]);
            } 
            // Clear partners array if changing from Polyamorous to something else
            else if (newStatus !== "Polyamorous" && status === "Polyamorous") {
              setPartners([]);
            }
            // Clear partner if changing from something else to Polyamorous
            else if (newStatus === "Polyamorous" && status !== "Polyamorous") {
              const currentPartner = partner ? [partner] : [];
              setPartners(currentPartner);
              setPartner("");
            }
          }} 
        />
        
        {status === "Polyamorous" ? (
          <MultiPartnerSelector
            partners={partners}
            onPartnersChange={(newPartners) => {
              setPartners(newPartners);
              resetError();
            }}
            potentialPartners={potentialPartners}
            maxPartners={10}
          />
        ) : status !== "Single" ? (
          <PartnerSelector
            partner={partner}
            onPartnerChange={(newPartner) => {
              setPartner(newPartner);
              resetError();
            }}
            potentialPartners={potentialPartners}
          />
        ) : null}
        
        <Button 
          onClick={handleUpdateStatus} 
          disabled={isUpdating || (status !== "Single" && !partner && partners.length === 0)}
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
