import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LocalAlertFormData } from "@/types/localAlert";

interface LocalAlertFormProps {
  data: LocalAlertFormData;
  onInputChange: (field: keyof LocalAlertFormData, value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export const LocalAlertForm = ({ data, onInputChange, onSubmit, isLoading }: LocalAlertFormProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={data.title}
          onChange={(e) => onInputChange("title", e.target.value)}
          placeholder="Enter local alert title"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => onInputChange("description", e.target.value)}
          placeholder="Describe your local alert"
        />
      </div>

      <div>
        <Label htmlFor="location">Location *</Label>
        <Input
          id="location"
          value={data.location}
          onChange={(e) => onInputChange("location", e.target.value)}
          placeholder="Enter location"
          required
        />
      </div>

      <div>
        <Label htmlFor="category">Category *</Label>
        <Select value={data.category} onValueChange={(value) => onInputChange("category", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="social">Social</SelectItem>
            <SelectItem value="meetup">Meetup</SelectItem>
            <SelectItem value="event">Event</SelectItem>
            <SelectItem value="activity">Activity</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="visibility">Visibility *</Label>
        <Select value={data.visibility} onValueChange={(value) => onInputChange("visibility", value as "public" | "friends")}>
          <SelectTrigger>
            <SelectValue placeholder="Select visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="friends">Friends Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="duration">Duration *</Label>
        <Select value={data.duration} onValueChange={(value) => onInputChange("duration", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30 minutes</SelectItem>
            <SelectItem value="60">1 hour</SelectItem>
            <SelectItem value="120">2 hours</SelectItem>
            <SelectItem value="240">4 hours</SelectItem>
            <SelectItem value="480">8 hours</SelectItem>
            <SelectItem value="720">12 hours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button 
        onClick={onSubmit} 
        disabled={isLoading || !data.title || !data.location || !data.category || !data.visibility || !data.duration}
      >
        {isLoading ? "Creating..." : "Create Local Alert"}
      </Button>
    </div>
  );
};