
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFriends } from "@/hooks/useFriends";
import { useChat } from "@/hooks/useChat";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import FriendSelector from "./FriendSelector";

const ChatBubble = () => {
  const { 
    isOpen, 
    toggleChat, 
    messages, 
    selectedFriend, 
    showFriendSelector,
    handleSelectFriend,
    handleCloseFriendSelector,
    sendMessage
  } = useChat();
  
  const { allFriends } = useFriends();

  // Filter only close friends (relationship type is 'friend')
  const closeFriends = allFriends.filter(friend => friend.relationshipType === 'friend');

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <Card className="w-80 md:w-96 shadow-lg">
          <ChatHeader 
            selectedFriend={selectedFriend} 
            onClose={toggleChat} 
          />
          
          {showFriendSelector ? (
            <FriendSelector 
              closeFriends={closeFriends}
              onSelectFriend={handleSelectFriend}
              onClose={handleCloseFriendSelector}
            />
          ) : (
            <>
              <ChatMessages 
                messages={messages}
                selectedFriend={selectedFriend}
              />
              <ChatInput onSendMessage={sendMessage} />
            </>
          )}
        </Card>
      ) : (
        <Button
          onClick={toggleChat}
          className="h-14 w-14 rounded-full bg-social-blue hover:bg-social-darkblue shadow-lg flex items-center justify-center"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}
    </div>
  );
};

export default ChatBubble;
