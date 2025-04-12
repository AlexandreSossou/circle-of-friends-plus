
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { EventFormData } from "@/types/event";

interface EventFormProps {
  eventData: EventFormData;
  isPending: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onVisibilityChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const EventForm = ({
  eventData,
  isPending,
  onInputChange,
  onVisibilityChange,
  onSubmit
}: EventFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Event Title</Label>
        <Input
          id="title"
          name="title"
          value={eventData.title}
          onChange={onInputChange}
          placeholder="Give your event a title"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={eventData.description}
          onChange={onInputChange}
          placeholder="What's this event about?"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            value={eventData.start_date}
            onChange={onInputChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="end_date">End Date (Optional)</Label>
          <Input
            id="end_date"
            name="end_date"
            type="date"
            value={eventData.end_date || ""}
            onChange={onInputChange}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="time">Time (Optional)</Label>
        <Input
          id="time"
          name="time"
          value={eventData.time || ""}
          onChange={onInputChange}
          placeholder="e.g. 3:00 PM - 5:00 PM"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location">Location (Optional)</Label>
        <Input
          id="location"
          name="location"
          value={eventData.location || ""}
          onChange={onInputChange}
          placeholder="Where is this event happening?"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="visibility">Visibility</Label>
        <Select 
          value={eventData.visibility} 
          onValueChange={onVisibilityChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="friends">Friends Only</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating..." : "Create Event"}
      </Button>
    </form>
  );
};
