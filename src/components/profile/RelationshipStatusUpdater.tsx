
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useRelationshipStatus } from "@/hooks/useRelationshipStatus";
import RelationshipStatusSelector from "./relationship/RelationshipStatusSelector";
import PartnerSelector from "./relationship/PartnerSelector";
import MultiPartnerSelector from "./relationship/MultiPartnerSelector";
import RelationshipStatusDisplay from "./relationship/RelationshipStatusDisplay";
import LookingForSelector from "./relationship/LookingForSelector";
import { ProfileType } from "@/types/profile";

interface RelationshipStatusUpdaterProps {
  profileType?: ProfileType;
}

const RelationshipStatusUpdater = ({ profileType = "public" }: RelationshipStatusUpdaterProps) => {
  const {
    status,
    setStatus,
    partner,
    setPartner,
    partners,
    setPartners,
    privateStatus,
    setPrivateStatus,
    privatePartner,
    setPrivatePartner,
    privatePartners,
    setPrivatePartners,
    lookingFor,
    setLookingFor,
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

  // Use the appropriate status and partners based on profile type
  const currentStatus = profileType === "private" ? privateStatus : status;
  const currentPartner = profileType === "private" ? privatePartner : partner;
  const currentPartners = profileType === "private" ? privatePartners : partners;
  
  const setCurrentStatus = profileType === "private" ? setPrivateStatus : setStatus;
  const setCurrentPartner = profileType === "private" ? setPrivatePartner : setPartner;
  const setCurrentPartners = profileType === "private" ? setPrivatePartners : setPartners;

  // Find partner names
  const getPartnerNames = () => {
    if (currentStatus === "Polyamorous" && currentPartners.length > 0) {
      return currentPartners.map(id => {
        const partner = potentialPartners.find(p => p.id === id);
        return partner ? partner.full_name : undefined;
      }).filter(Boolean);
    } else if (currentPartner) {
      const foundPartner = potentialPartners.find(p => p.id === currentPartner);
      return foundPartner ? [foundPartner.full_name] : [];
    }
    return [];
  };

  const partnerNames = getPartnerNames();
  const isPolyamorous = currentStatus === "Polyamorous";

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Update {profileType === "private" ? "Private" : "Public"} Relationship Status</CardTitle>
        <CardDescription>
          {profileType === "private" 
            ? "Set your private relationship status and what you're looking for"
            : "Set your public relationship status to test the safety review functionality"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {currentStatus && (currentPartner || currentPartners.length > 0) && currentStatus !== "Single" && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm font-medium mb-2">Current Status:</p>
            <RelationshipStatusDisplay 
              status={currentStatus} 
              partnerId={currentPartner}
              partnerIds={isPolyamorous ? currentPartners : undefined}
              partnerNames={partnerNames}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Note: Changing your relationship status will notify your partner(s) and update their status accordingly.
            </p>
          </div>
        )}
        
        <RelationshipStatusSelector 
          status={currentStatus} 
          onStatusChange={(newStatus) => {
            setCurrentStatus(newStatus);
            resetError();
            // Reset partner if changing to Single
            if (newStatus === "Single") {
              setCurrentPartner("");
              setCurrentPartners([]);
            } 
            // Clear partners array if changing from Polyamorous to something else
            else if (newStatus !== "Polyamorous" && currentStatus === "Polyamorous") {
              setCurrentPartners([]);
            }
            // Clear partner if changing from something else to Polyamorous
            else if (newStatus === "Polyamorous" && currentStatus !== "Polyamorous") {
              const currentPartnerValue = currentPartner ? [currentPartner] : [];
              setCurrentPartners(currentPartnerValue);
              setCurrentPartner("");
            }
          }} 
        />
        
        {currentStatus === "Polyamorous" ? (
          <MultiPartnerSelector
            partners={currentPartners}
            onPartnersChange={(newPartners) => {
              setCurrentPartners(newPartners);
              resetError();
            }}
            potentialPartners={potentialPartners}
            maxPartners={10}
            profileType={profileType}
          />
        ) : currentStatus !== "Single" ? (
          <PartnerSelector
            partner={currentPartner}
            onPartnerChange={(newPartner) => {
              setCurrentPartner(newPartner);
              resetError();
            }}
            potentialPartners={potentialPartners}
            profileType={profileType}
          />
        ) : null}
        
        {profileType === "private" && (
          <LookingForSelector 
            lookingFor={lookingFor}
            onLookingForChange={setLookingFor}
          />
        )}
        
        <Button 
          onClick={() => handleUpdateStatus(profileType)} 
          disabled={isUpdating || (currentStatus !== "Single" && !currentPartner && currentPartners.length === 0)}
          className="w-full"
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            `Update ${profileType === "private" ? "Private" : "Public"} Relationship Status`
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RelationshipStatusUpdater;
