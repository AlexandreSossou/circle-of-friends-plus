
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UnreadMessage {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

interface NavbarMessagesDropdownProps {
  unreadMessages: UnreadMessage[];
}

const NavbarMessagesDropdown = ({ unreadMessages }: NavbarMessagesDropdownProps) => {
  const queryClient = useQueryClient();

  const handleMessageClick = async (messageId: string) => {
    try {
      // Mark message as read
      const { error } = await supabase
        .from("messages")
        .update({ read: true })
        .eq("id", messageId);

      if (error) {
        console.error("Error marking message as read:", error);
        return;
      }
      
      // Invalidate all unread message queries to update UI
      queryClient.invalidateQueries({ queryKey: ["unreadMessages"] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    } catch (error) {
      console.error("Failed to mark message as read:", error);
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 text-social-textSecondary hover:bg-social-gray rounded-full relative">
          <MessageCircle className="w-6 h-6" />
          {unreadMessages && unreadMessages.length > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {unreadMessages.length}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Messages</span>
          <Link 
            to="/messages" 
            className="text-social-blue text-xs hover:underline"
          >
            See all
          </Link>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {unreadMessages && unreadMessages.length > 0 ? (
          unreadMessages.map((message) => (
            <DropdownMenuItem key={message.id} asChild>
              <Link 
                to={`/messages?contact=${message.sender_id}`}
                className="flex items-start gap-3 cursor-pointer p-3 hover:bg-social-gray"
                onClick={() => handleMessageClick(message.id)}
              >
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarImage 
                    src={(message.profiles as any)?.avatar_url || "/placeholder.svg"} 
                    alt={(message.profiles as any)?.full_name || "User"} 
                  />
                  <AvatarFallback>
                    {((message.profiles as any)?.full_name || "?").substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="font-medium text-sm">
                    {(message.profiles as any)?.full_name || "User"}
                  </p>
                  <p className="text-xs text-social-textSecondary truncate">
                    {message.content}
                  </p>
                  <p className="text-xs text-social-textSecondary mt-1">
                    {format(new Date(message.created_at), "h:mm a")}
                  </p>
                </div>
              </Link>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="py-4 text-center text-social-textSecondary">
            <p>No unread messages</p>
          </div>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link 
            to="/message-preferences" 
            className="text-center text-social-blue w-full justify-center"
          >
            Message Preferences
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NavbarMessagesDropdown;
