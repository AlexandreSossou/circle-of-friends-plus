
import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

type WinkButtonProps = {
  recipientId: string;
}

const WinkButton = ({ recipientId }: WinkButtonProps) => {
  const [winkSent, setWinkSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  return (
    <Button 
      variant="outline" 
      onClick={handleSendWink} 
      disabled={winkSent || isLoading}
      className={winkSent ? "bg-pink-100" : ""}
    >
      <Heart className={`w-4 h-4 mr-2 ${winkSent ? "text-pink-500 fill-pink-500" : ""}`} />
      {isLoading ? "Sending..." : winkSent ? "Winked" : "Wink"}
    </Button>
  );
};

export default WinkButton;
