
import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type WinkButtonProps = {
  recipientId: string;
}

const WinkButton = ({ recipientId }: WinkButtonProps) => {
  const [winkSent, setWinkSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSendWink = async () => {
    if (!user || winkSent || isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Create a post on the recipient's profile to notify them of the wink
      await supabase.from('posts').insert({
        user_id: recipientId,
        content: `${user.email} sent you a wink! 😉`,
      });
      
      setWinkSent(true);
      setDialogOpen(false);
      
      toast({
        title: "Wink sent!",
        description: "Your wink has been sent successfully",
      });
    } catch (error) {
      console.error("Error sending wink:", error);
      toast({
        title: "Error",
        description: "Failed to send wink. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWinkButtonClick = () => {
    if (winkSent || isLoading) return;
    setDialogOpen(true);
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={handleWinkButtonClick} 
        disabled={winkSent || isLoading}
        className={winkSent ? "bg-pink-100" : ""}
      >
        <Heart className={`w-4 h-4 mr-2 ${winkSent ? "text-pink-500 fill-pink-500" : ""}`} />
        {isLoading ? "Sending..." : winkSent ? "Winked" : "Wink"}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send a Wink</DialogTitle>
            <DialogDescription>
              Are you sure you want to send a wink to this user? They will be notified.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendWink} disabled={isLoading}>
              {isLoading ? "Sending..." : "Yes, Send Wink"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WinkButton;
