import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnnouncementFormData } from "@/types/announcement";

interface AnnouncementFormProps {
  data: AnnouncementFormData;
  onInputChange: (field: keyof AnnouncementFormData, value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export const AnnouncementForm = ({ data, onInputChange, onSubmit, isLoading }: AnnouncementFormProps) => {
  const categories = [
    { value: "general", label: "General" },
    { value: "sports", label: "Sports" },
    { value: "gaming", label: "Gaming" },
    { value: "social", label: "Social" },
    { value: "travel", label: "Travel" },
    { value: "food", label: "Food & Dining" },
    { value: "fitness", label: "Fitness" },
    { value: "music", label: "Music" },
    { value: "business", label: "Business" },
    { value: "hobby", label: "Hobby" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={data.title}
          onChange={(e) => onInputChange("title", e.target.value)}
          placeholder="e.g., Looking for football partners"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => onInputChange("description", e.target.value)}
          placeholder="Provide more details about what you're looking for..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="location">Location *</Label>
        <Input
          id="location"
          value={data.location}
          onChange={(e) => onInputChange("location", e.target.value)}
          placeholder="e.g., New York, NY or Los Angeles area"
          required
        />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={data.category} onValueChange={(value) => onInputChange("category", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="duration">Duration</Label>
        <Select value={data.duration} onValueChange={(value) => onInputChange("duration", value)}>
          <SelectTrigger>
            <SelectValue placeholder="How long should this be active?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30 minutes</SelectItem>
            <SelectItem value="60">1 hour</SelectItem>
            <SelectItem value="120">2 hours</SelectItem>
            <SelectItem value="240">4 hours</SelectItem>
            <SelectItem value="480">8 hours</SelectItem>
            <SelectItem value="720">12 hours (Max)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="visibility">Visibility</Label>
        <Select value={data.visibility} onValueChange={(value) => onInputChange("visibility", value as "public" | "friends")}>
          <SelectTrigger>
            <SelectValue placeholder="Select visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public - Everyone can see</SelectItem>
            <SelectItem value="friends">Lovarinos - Only Lovarinos can see</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onSubmit} className="w-full" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Announcement"}
      </Button>
    </div>
  );
};