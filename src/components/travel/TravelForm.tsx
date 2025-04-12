
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

export interface TravelFormData {
  city: string;
  country: string;
  arrival_date: string;
  departure_date: string;
  looking_for: "locals" | "tourists" | "both";
  description: string;
  shareAsPost: boolean;
}

interface TravelFormProps {
  travelData: Omit<TravelFormData, "shareAsPost">;
  shareAsPost: boolean;
  isPending: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onLookingForChange: (value: string) => void;
  onShareAsPostChange: (checked: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const TravelForm = ({
  travelData,
  shareAsPost,
  isPending,
  onInputChange,
  onLookingForChange,
  onShareAsPostChange,
  onSubmit
}: TravelFormProps) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={travelData.city}
              onChange={onInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              name="country"
              value={travelData.country}
              onChange={onInputChange}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
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
          <div className="space-y-2">
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
        </div>
        <div className="space-y-2">
          <Label htmlFor="looking_for">Looking to meet</Label>
          <Select
            name="looking_for"
            value={travelData.looking_for}
            onValueChange={onLookingForChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Who do you want to meet?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="locals">Locals</SelectItem>
              <SelectItem value="tourists">Other Travelers</SelectItem>
              <SelectItem value="both">Both Locals and Travelers</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Tell others about your trip and what you're interested in..."
            value={travelData.description}
            onChange={onInputChange}
            className="h-24"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="shareAsPost" 
            checked={shareAsPost} 
            onCheckedChange={(checked) => onShareAsPostChange(checked as boolean)}
          />
          <label
            htmlFor="shareAsPost"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Share as post on my feed
          </label>
        </div>
      </div>
      <DialogFooter className="mt-6">
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button 
          type="submit" 
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Save Travel Plan"}
        </Button>
      </DialogFooter>
    </form>
  );
};
