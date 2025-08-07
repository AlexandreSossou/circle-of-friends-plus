
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Travel } from "@/types/travel";

interface TravelFormProps {
  travelData: Omit<Travel, "id" | "user_id" | "created_at" | "updated_at" | "profiles">;
  shareAsPost: boolean;
  isPending: boolean;
  travelingWithPartner: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onLookingForChange: (value: "locals" | "tourists" | "both") => void;
  onShareAsPostChange: (checked: boolean) => void;
  onTravelingWithPartnerChange: (checked: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const TravelForm = ({
  travelData,
  shareAsPost,
  isPending,
  travelingWithPartner,
  onInputChange,
  onLookingForChange,
  onShareAsPostChange,
  onTravelingWithPartnerChange,
  onSubmit,
}: TravelFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          name="city"
          value={travelData.city}
          onChange={onInputChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="country">Country</Label>
        <Input
          id="country"
          name="country"
          value={travelData.country}
          onChange={onInputChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="arrival_date">Arrival Date</Label>
        <Input
          id="arrival_date"
          name="arrival_date"
          type="date"
          value={travelData.arrival_date}
          onChange={onInputChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="departure_date">Departure Date</Label>
        <Input
          id="departure_date"
          name="departure_date"
          type="date"
          value={travelData.departure_date}
          onChange={onInputChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="looking_for">Looking to meet</Label>
        <Select value={travelData.looking_for} onValueChange={onLookingForChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="locals">Locals</SelectItem>
            <SelectItem value="tourists">Other travelers</SelectItem>
            <SelectItem value="both">Both locals and travelers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="traveling_with_partner"
          checked={travelingWithPartner}
          onCheckedChange={onTravelingWithPartnerChange}
        />
        <Label htmlFor="traveling_with_partner">Traveling with my partner</Label>
      </div>

      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          name="description"
          value={travelData.description || ""}
          onChange={onInputChange}
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="share_as_post"
          checked={shareAsPost}
          onCheckedChange={onShareAsPostChange}
        />
        <Label htmlFor="share_as_post">Share as post on timeline</Label>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Adding..." : "Add Travel Plan"}
      </Button>
    </form>
  );
};
