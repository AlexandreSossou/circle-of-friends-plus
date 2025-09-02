import { Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyLocalAlertStateProps {
  onAddClick: () => void;
}

export const EmptyLocalAlertState = ({ onAddClick }: EmptyLocalAlertStateProps) => {
  return (
    <div className="text-center p-8 border border-dashed rounded-lg">
      <Megaphone className="w-12 h-12 mx-auto text-gray-400 mb-3" />
      <h3 className="font-medium mb-1">No local alerts found</h3>
      <p className="text-sm text-social-textSecondary mb-4">
        Create your first local alert to connect with people in your region
      </p>
      <Button onClick={onAddClick}>
        <Megaphone className="w-4 h-4 mr-1" /> Create Local Alert
      </Button>
    </div>
  );
};