
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyEventStateProps {
  onAddClick: () => void;
}

export const EmptyEventState = ({ onAddClick }: EmptyEventStateProps) => {
  return (
    <div className="text-center p-8 border border-dashed rounded-lg">
      <CalendarPlus className="w-12 h-12 mx-auto text-gray-400 mb-3" />
      <h3 className="font-medium mb-1">No events found</h3>
      <p className="text-sm text-social-textSecondary mb-4">
        Create your first event and invite your Lovarinos
      </p>
      <Button onClick={onAddClick}>
        <CalendarPlus className="w-4 h-4 mr-1" /> Create Event
      </Button>
    </div>
  );
};
