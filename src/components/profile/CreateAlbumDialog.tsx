import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CameraIcon } from "lucide-react";

interface CreateAlbumDialogProps {
  onCreateAlbum: (name: string, isPrivate: boolean) => void;
  isCreating: boolean;
}

const CreateAlbumDialog = ({ onCreateAlbum, isCreating }: CreateAlbumDialogProps) => {
  const [open, setOpen] = useState(false);
  const [albumName, setAlbumName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSubmit = () => {
    if (albumName.trim()) {
      onCreateAlbum(albumName.trim(), isPrivate);
      setAlbumName("");
      setIsPrivate(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-4">
          <CameraIcon className="w-4 h-4 mr-2" />
          Create New Album
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Album</DialogTitle>
          <DialogDescription>
            Create a new photo album to organize your photos.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="album-name">Album Name</Label>
            <Input
              id="album-name"
              placeholder="Enter album name"
              value={albumName}
              onChange={(e) => setAlbumName(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is-private">Private Album</Label>
              <div className="text-sm text-muted-foreground">
                Only you and selected friends can view this album
              </div>
            </div>
            <Switch
              id="is-private"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!albumName.trim() || isCreating}
          >
            {isCreating ? "Creating..." : "Create Album"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAlbumDialog;
