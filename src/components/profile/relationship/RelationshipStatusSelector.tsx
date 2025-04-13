
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
          <SelectItem value="Single">Single</SelectItem>
          <SelectItem value="In a relationship">In a relationship</SelectItem>
          <SelectItem value="Engaged">Engaged</SelectItem>
          <SelectItem value="Married">Married</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default RelationshipStatusSelector;
