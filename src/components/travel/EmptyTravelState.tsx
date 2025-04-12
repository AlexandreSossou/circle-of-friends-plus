
import { Plane, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyTravelStateProps {
  onAddClick: () => void;
}

export const EmptyTravelState = ({ onAddClick }: EmptyTravelStateProps) => {
  return (
    <div className="text-center py-10">
      <Plane className="w-16 h-16 mx-auto mb-4 text-social-textSecondary" />
      <h3 className="text-xl font-medium mb-2">No travel plans yet</h3>
      <p className="text-social-textSecondary mb-6">
        Add your travel plans to connect with locals and other tourists
      </p>
      <Button onClick={onAddClick}>
        <Plus className="w-4 h-4 mr-1" /> Add Your First Travel Plan
      </Button>
    </div>
  );
};
