
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type Contact = {
  id: string;
  full_name: string;
  avatar_url: string | null;
};

interface ContactListProps {
  contacts: Contact[] | undefined;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  searchResults: Contact[] | undefined;
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact) => void;
}

const ContactList = ({
  contacts,
  searchTerm,
  setSearchTerm,
  searchResults,
  selectedContact,
  onSelectContact,
}: ContactListProps) => {
  const filteredContacts = contacts?.filter((contact) =>
    contact.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="border-r border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-social-textSecondary h-4 w-4" />
          <Input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {searchTerm && searchResults && searchResults.length > 0 ? (
          <div className="p-2 bg-gray-100">
            <h3 className="text-xs font-medium text-social-textSecondary px-2 py-1">SEARCH RESULTS</h3>
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="flex items-center gap-3 p-2 hover:bg-social-gray rounded-lg cursor-pointer"
                onClick={() => onSelectContact(result)}
              >
                <Avatar>
                  <AvatarImage src={result.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>
                    {result.full_name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{result.full_name}</p>
                  <p className="text-xs text-social-textSecondary">Start a new conversation</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          filteredContacts && filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className={`flex items-center gap-3 p-3 cursor-pointer ${
                selectedContact?.id === contact.id ? "bg-social-lightblue" : "hover:bg-social-gray"
              }`}
              onClick={() => onSelectContact(contact)}
            >
              <Avatar>
                <AvatarImage src={contact.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>
                  {contact.full_name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{contact.full_name}</p>
              </div>
            </div>
          ))
        )}

        {!searchTerm && (!contacts || contacts.length === 0) && (
          <div className="p-6 text-center text-social-textSecondary">
            <p>No conversations yet</p>
            <p className="text-sm mt-1">Search for friends to start messaging</p>
          </div>
        )}

        {searchTerm && (!searchResults || searchResults.length === 0) && (
          <div className="p-6 text-center text-social-textSecondary">
            <p>No users found</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactList;
