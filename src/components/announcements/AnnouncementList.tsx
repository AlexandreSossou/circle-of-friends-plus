import { AnnouncementCard } from "./AnnouncementCard";
import { Announcement } from "@/types/announcement";

interface AnnouncementListProps {
  announcements: Announcement[];
  onDelete: (id: string) => void;
}

export const AnnouncementList = ({ announcements, onDelete }: AnnouncementListProps) => {
  return (
    <div className="space-y-4">
      {announcements.map((announcement) => (
        <AnnouncementCard 
          key={announcement.id} 
          announcement={announcement} 
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};