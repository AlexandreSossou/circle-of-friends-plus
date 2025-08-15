import { Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyAnnouncementStateProps {
  onAddClick: () => void;
}

export const EmptyAnnouncementState = ({ onAddClick }: EmptyAnnouncementStateProps) => {
  return (
    <div className="text-center p-8 border border-dashed rounded-lg">
      <Megaphone className="w-12 h-12 mx-auto text-gray-400 mb-3" />
      <h3 className="font-medium mb-1">No announcements found</h3>
      <p className="text-sm text-social-textSecondary mb-4">
        Create your first announcement to connect with people in your region
      </p>
      <Button onClick={onAddClick}>
        <Megaphone className="w-4 h-4 mr-1" /> Create Announcement
      </Button>
    </div>
  );
};