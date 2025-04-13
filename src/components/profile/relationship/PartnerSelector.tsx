
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Partner } from "@/hooks/useRelationshipStatus";

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
  return (
    <div className="space-y-2">
      <Label htmlFor="partner">Partner</Label>
      <Select 
        value={partner} 
        onValueChange={onPartnerChange}
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
      {potentialPartners.length === 0 && (
        <p className="text-sm text-muted-foreground mt-2">
          No profiles found. Check console logs for details.
        </p>
      )}
    </div>
  );
};

export default PartnerSelector;
