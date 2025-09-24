import { Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface EmptyLocalAlertStateProps {
  onAddClick: () => void;
}

export const EmptyLocalAlertState = ({ onAddClick }: EmptyLocalAlertStateProps) => {
  return (
    <div className="text-center p-8 border border-dashed rounded-lg">
      <Megaphone className="w-12 h-12 mx-auto text-gray-400 mb-3" />
      <h3 className="font-medium mb-1">No local alerts found</h3>
      <p className="text-sm text-social-textSecondary mb-4">
        Create alerts for immediate desires or events (next 12 hours max). For longer-term planning, use{" "}
        <Link to="/travels" className="text-primary underline hover:no-underline">
          Travels
        </Link>{" "}
        or{" "}
        <Link to="/events" className="text-primary underline hover:no-underline">
          Events
        </Link>
        .
      </p>
      <Button onClick={onAddClick}>
        <Megaphone className="w-4 h-4 mr-1" /> Create Local Alert
      </Button>
    </div>
  );
};