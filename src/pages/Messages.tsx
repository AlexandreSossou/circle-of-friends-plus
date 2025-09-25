
import MainLayout from "@/components/layout/MainLayout";
import ContactList from "@/components/messages/ContactList";
import ChatInterface from "@/components/messages/ChatInterface";
import UserWarningDialog from "@/components/messages/UserWarningDialog";
import GenderBlockingControls from "@/components/messages/GenderBlockingControls";
import { useMessages } from "@/hooks/useMessages";
import { useEffect } from "react";

const Messages = () => {
  const {
    contacts,
    messages,
    searchResults,
    selectedContact,
    setSelectedContact,
    searchTerm,
    setSearchTerm,
    sendMessage,
    partnerGroup,
  } = useMessages();
  
  // Clear URL parameters after initial load to prevent conflicts
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('couple') || urlParams.has('recipient')) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [selectedContact]);

  return (
    <MainLayout>
      <UserWarningDialog />
      <div className="space-y-4">
        <GenderBlockingControls />
        <div className="social-card p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-200px)]">
          {/* Contacts sidebar */}
          <ContactList
            contacts={contacts}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchResults={searchResults}
            selectedContact={selectedContact}
            onSelectContact={setSelectedContact}
            partnerGroup={partnerGroup}
          />

          {/* Messages area */}
          <div className="col-span-2 flex flex-col h-full">
            <ChatInterface
              selectedContact={selectedContact}
              messages={messages}
              onSendMessage={sendMessage}
            />
          </div>
        </div>
      </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
