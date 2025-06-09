
import { supabase } from "@/integrations/supabase/client";

export const sendNotificationMessage = async (
  senderId: string, 
  recipientId: string, 
  content: string
): Promise<void> => {
  try {
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        recipient_id: recipientId,
        content: content,
      });
      
    if (messageError) {
      console.error("Error sending notification message:", messageError);
    } else {
      console.log("Notification message sent to partner");
    }
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};
