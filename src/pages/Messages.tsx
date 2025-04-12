
import MainLayout from "@/components/layout/MainLayout";
import ContactList from "@/components/messages/ContactList";
import ChatInterface from "@/components/messages/ChatInterface";
import { useMessages } from "@/hooks/useMessages";

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
  } = useMessages();

  return (
    <MainLayout>
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
    </MainLayout>
  );
};

export default Messages;
