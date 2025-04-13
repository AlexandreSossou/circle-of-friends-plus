
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RelationshipStatus } from "@/types/relationship";

interface RelationshipStatusSelectorProps {
  status: string;
  onStatusChange: (value: string) => void;
}

const RelationshipStatusSelector = ({ 
  status, 
  onStatusChange 
}: RelationshipStatusSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="status">Relationship Status</Label>
      <Select 
        value={status} 
        onValueChange={onStatusChange}
      >
        <SelectTrigger id="status">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={RelationshipStatus.Single}>{RelationshipStatus.Single}</SelectItem>
          <SelectItem value={RelationshipStatus.InRelationship}>{RelationshipStatus.InRelationship}</SelectItem>
          <SelectItem value={RelationshipStatus.Engaged}>{RelationshipStatus.Engaged}</SelectItem>
          <SelectItem value={RelationshipStatus.Married}>{RelationshipStatus.Married}</SelectItem>
          <SelectItem value={RelationshipStatus.Complicated}>{RelationshipStatus.Complicated}</SelectItem>
          <SelectItem value={RelationshipStatus.OpenRelationship}>{RelationshipStatus.OpenRelationship}</SelectItem>
          <SelectItem value={RelationshipStatus.JustDating}>{RelationshipStatus.JustDating}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default RelationshipStatusSelector;
