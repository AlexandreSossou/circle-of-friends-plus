
import { MessageCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFriends } from "@/hooks/useFriends";
import { useChat } from "@/hooks/useChat";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import FriendSelector from "./FriendSelector";
import ModeratorChatSelector from "./ModeratorChatSelector";
import GroupChatCreator from "./GroupChatCreator";

const ChatBubble = () => {
  const { 
    isOpen, 
    toggleChat, 
    messages, 
    selectedFriend,
    selectedGroupChat, 
    showFriendSelector,
    showGroupCreator,
    showModeratorSelector,
    isChatWithModerator,
    groupMembers,
    groupName,
    setGroupName,
    handleSelectFriend,
    handleCloseFriendSelector,
    handleToggleModeratorSelector,
    handleToggleGroupCreator,
    handleAddGroupMember,
    handleRemoveGroupMember,
    handleCreateGroupChat,
    sendMessage,
    resetChat
  } = useChat();
  
  const { allFriends } = useFriends();

  // Show all friends (both friends and acquaintances can chat)
  const availableFriends = allFriends;

  const handleBackToFriendSelector = () => {
    resetChat();
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <Card className="w-80 md:w-96 shadow-lg">
          <ChatHeader 
            selectedFriend={selectedFriend}
            selectedGroupChat={selectedGroupChat}
            isChatWithModerator={isChatWithModerator}
            onClose={toggleChat}
            onBack={(selectedFriend || isChatWithModerator || selectedGroupChat) ? handleBackToFriendSelector : undefined}
          />
          
          {showFriendSelector ? (
            <FriendSelector 
              closeFriends={availableFriends}
              onSelectFriend={handleSelectFriend}
              onClose={handleCloseFriendSelector}
              onModeratorChat={handleToggleModeratorSelector}
              onCreateGroupChat={handleToggleGroupCreator}
            />
          ) : showGroupCreator ? (
            <GroupChatCreator
              closeFriends={availableFriends}
              selectedMembers={groupMembers}
              groupName={groupName}
              setGroupName={setGroupName}
              onAddMember={handleAddGroupMember}
              onRemoveMember={handleRemoveGroupMember}
              onCreateGroup={handleCreateGroupChat}
              onCancel={handleToggleGroupCreator}
            />
          ) : showModeratorSelector ? (
            <ModeratorChatSelector
              onStartModeratorChat={handleToggleModeratorSelector}
              onCancel={handleCloseFriendSelector}
            />
          ) : (
            <>
              <ChatMessages 
                messages={messages}
                selectedFriend={selectedFriend}
                selectedGroupChat={selectedGroupChat}
                isChatWithModerator={isChatWithModerator}
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
