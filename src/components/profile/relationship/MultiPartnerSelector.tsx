
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, X, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Partner } from "@/hooks/useRelationshipStatus";
import { Badge } from "@/components/ui/badge";

interface MultiPartnerSelectorProps {
  partners: string[];
  onPartnersChange: (values: string[]) => void;
  potentialPartners: Partner[];
  maxPartners?: number;
}

const MultiPartnerSelector = ({ 
  partners, 
  onPartnersChange, 
  potentialPartners,
  maxPartners = 10
}: MultiPartnerSelectorProps) => {
  const [selectedPartner, setSelectedPartner] = useState<string>("");
  const noPartnersAvailable = potentialPartners.length === 0;
  
  // Filter out partners that are already selected
  const availablePartners = potentialPartners.filter(
    p => !partners.includes(p.id)
  );

  const handleAddPartner = () => {
    if (selectedPartner && !partners.includes(selectedPartner) && partners.length < maxPartners) {
      onPartnersChange([...partners, selectedPartner]);
      setSelectedPartner("");
    }
  };

  const handleRemovePartner = (partnerId: string) => {
    onPartnersChange(partners.filter(id => id !== partnerId));
  };

  const getPartnerName = (partnerId: string) => {
    const partner = potentialPartners.find(p => p.id === partnerId);
    return partner ? partner.full_name : "Unknown Partner";
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="partners">Partners (Max {maxPartners})</Label>
      
      {partners.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {partners.map(partnerId => (
            <Badge key={partnerId} variant="secondary" className="px-2 py-1 flex items-center gap-1">
              {getPartnerName(partnerId)}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 ml-1" 
                onClick={() => handleRemovePartner(partnerId)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
      
      <div className="flex gap-2">
        <Select 
          value={selectedPartner} 
          onValueChange={setSelectedPartner}
          disabled={noPartnersAvailable || partners.length >= maxPartners || availablePartners.length === 0}
          className="flex-1"
        >
          <SelectTrigger id="partner-select">
            <SelectValue placeholder="Select partner to add" />
          </SelectTrigger>
          <SelectContent>
            {availablePartners.length > 0 ? (
              availablePartners.map(profile => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.full_name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-partner-found" disabled>
                {partners.length >= maxPartners 
                  ? "Maximum partners reached" 
                  : "No more partners available"}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        
        <Button 
          type="button" 
          size="sm" 
          variant="outline" 
          disabled={!selectedPartner || partners.length >= maxPartners}
          onClick={handleAddPartner}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
      
      {noPartnersAvailable && (
        <div className="flex items-center gap-2 text-sm text-amber-600 mt-2">
          <AlertCircle className="h-4 w-4" />
          <p>No profiles found. Please check the console logs for details.</p>
        </div>
      )}
      
      {partners.length >= maxPartners && (
        <div className="flex items-center gap-2 text-sm text-amber-600 mt-2">
          <AlertCircle className="h-4 w-4" />
          <p>Maximum number of partners ({maxPartners}) reached.</p>
        </div>
      )}
    </div>
  );
};

export default MultiPartnerSelector;
