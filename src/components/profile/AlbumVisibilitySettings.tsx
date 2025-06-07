
import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Album } from "@/types/profile";

type AlbumVisibilitySettingsProps = {
  album: Album;
  onSave: (albumId: number, visibleOnPublic: boolean, visibleOnPrivate: boolean) => void;
};

const AlbumVisibilitySettings = ({ album, onSave }: AlbumVisibilitySettingsProps) => {
  const [visibleOnPublic, setVisibleOnPublic] = useState(album.visibleOnPublicProfile ?? true);
  const [visibleOnPrivate, setVisibleOnPrivate] = useState(album.visibleOnPrivateProfile ?? true);
  const { toast } = useToast();

  const handleSave = () => {
    onSave(album.id, visibleOnPublic, visibleOnPrivate);
    toast({
      title: "Album visibility updated",
      description: `"${album.name}" visibility settings have been updated.`,
    });
  };

  // Photo Safe album is always private and shouldn't have visibility controls
  if (album.isPhotoSafe) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          Profile Visibility
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Album Profile Visibility</SheetTitle>
          <SheetDescription>
            Choose which profile types show the "{album.name}" album
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="public-profile" 
              checked={visibleOnPublic}
              onCheckedChange={(checked) => setVisibleOnPublic(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="public-profile" className="font-medium">
                Show on Public Profile
              </Label>
              <p className="text-sm text-social-textSecondary">
                Anyone viewing your public profile can see this album
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="private-profile" 
              checked={visibleOnPrivate}
              onCheckedChange={(checked) => setVisibleOnPrivate(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="private-profile" className="font-medium">
                Show on Private Profile
              </Label>
              <p className="text-sm text-social-textSecondary">
                Friends viewing your private profile can see this album
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AlbumVisibilitySettings;
