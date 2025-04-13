
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SharePhotosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientId: string;
}

const SharePhotosDialog = ({ open, onOpenChange, recipientId }: SharePhotosDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedAlbums, setSelectedAlbums] = useState<number[]>([]);
  const [accessDuration, setAccessDuration] = useState("24");
  const [isLoading, setIsLoading] = useState(false);

  const handleShareRequest = async () => {
    if (!user || selectedAlbums.length === 0) return;
    
    setIsLoading(true);
    
    try {
      // In a real implementation, we would store this request in the database
      // and notify the other user to respond
      
      // Simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Share request sent!",
        description: `Your share request has been sent. They will see your albums if they accept.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending share request:", error);
      toast({
        title: "Error",
        description: "Failed to send share request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAlbumToggle = (albumId: number) => {
    setSelectedAlbums(prev => 
      prev.includes(albumId)
        ? prev.filter(id => id !== albumId)
        : [...prev, albumId]
    );
  };

  // Mock albums - in a real implementation, these would be fetched from the database
  const myAlbums = [
    { id: 1, name: "Default Album" },
    { id: 2, name: "Vacation" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Photo Albums</DialogTitle>
          <DialogDescription>
            Select albums to share with this person. They will only see your photos if they also share their albums with you.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="access-duration">Access Duration</Label>
              <Select value={accessDuration} onValueChange={setAccessDuration}>
                <SelectTrigger id="access-duration" className="w-full">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="6">6 hours</SelectItem>
                  <SelectItem value="12">12 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="48">48 hours</SelectItem>
                  <SelectItem value="168">1 week</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Select Albums to Share</Label>
              <div className="space-y-2 mt-2">
                {myAlbums.map(album => (
                  <div key={album.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`album-${album.id}`} 
                      checked={selectedAlbums.includes(album.id)}
                      onCheckedChange={() => handleAlbumToggle(album.id)}
                    />
                    <Label htmlFor={`album-${album.id}`} className="font-normal">
                      {album.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="sm:mr-2"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleShareRequest} 
            disabled={isLoading || selectedAlbums.length === 0}
            className="bg-purple-500 hover:bg-purple-600"
          >
            {isLoading ? "Sending..." : "Send Share Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SharePhotosDialog;
