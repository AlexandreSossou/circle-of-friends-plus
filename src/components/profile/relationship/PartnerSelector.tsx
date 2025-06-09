
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Partner } from "@/hooks/useRelationshipStatus";
import { AlertCircle } from "lucide-react";
import { ProfileType } from "@/types/profile";

interface PartnerSelectorProps {
  partner: string;
  onPartnerChange: (value: string) => void;
  potentialPartners: Partner[];
  profileType?: ProfileType;
}

const PartnerSelector = ({ 
  partner, 
  onPartnerChange, 
  potentialPartners,
  profileType = "public"
}: PartnerSelectorProps) => {
  const noPartnersAvailable = potentialPartners.length === 0;
  const labelText = profileType === "private" ? "Private Profile Partner" : "Partner";
  const placeholderText = profileType === "private" 
    ? "Select partner's private profile" 
    : "Select partner";

  return (
    <div className="space-y-2">
      <Label htmlFor="partner">{labelText}</Label>
      <Select 
        value={partner} 
        onValueChange={onPartnerChange}
        disabled={noPartnersAvailable}
      >
        <SelectTrigger id="partner">
          <SelectValue placeholder={placeholderText} />
        </SelectTrigger>
        <SelectContent>
          {potentialPartners.length > 0 ? (
            potentialPartners.map(profile => (
              <SelectItem key={profile.id} value={profile.id}>
                {profile.full_name}
                {profileType === "private" && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (Private Profile)
                  </span>
                )}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-partner-found" disabled>No potential partners found</SelectItem>
          )}
        </SelectContent>
      </Select>
      {noPartnersAvailable && (
        <div className="flex items-center gap-2 text-sm text-amber-600 mt-2">
          <AlertCircle className="h-4 w-4" />
          <p>No profiles found. Please check the console logs for details.</p>
        </div>
      )}
      {profileType === "private" && (
        <p className="text-xs text-muted-foreground">
          This will link to your partner's private profile identity.
        </p>
      )}
    </div>
  );
};

export default PartnerSelector;
