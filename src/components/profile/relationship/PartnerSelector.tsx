
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Partner } from "@/hooks/useRelationshipStatus";
import { AlertCircle } from "lucide-react";

interface PartnerSelectorProps {
  partner: string;
  onPartnerChange: (value: string) => void;
  potentialPartners: Partner[];
}

const PartnerSelector = ({ 
  partner, 
  onPartnerChange, 
  potentialPartners 
}: PartnerSelectorProps) => {
  const noPartnersAvailable = potentialPartners.length === 0;

  return (
    <div className="space-y-2">
      <Label htmlFor="partner">Partner</Label>
      <Select 
        value={partner} 
        onValueChange={onPartnerChange}
        disabled={noPartnersAvailable}
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
    </div>
  );
};

export default PartnerSelector;
