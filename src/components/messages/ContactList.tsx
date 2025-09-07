
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";

type Contact = {
  id: string;
  full_name: string;
  avatar_url: string | null;
};

type PartnerGroup = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  isPartnerGroup: true;
  partners: Contact[];
};

interface ContactListProps {
  contacts: Contact[] | undefined;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  searchResults: Contact[] | undefined;
  selectedContact: Contact | PartnerGroup | null;
  onSelectContact: (contact: Contact | PartnerGroup) => void;
  partnerGroup?: PartnerGroup;
}

const ContactList = ({
  contacts,
  searchTerm,
  setSearchTerm,
  searchResults,
  selectedContact,
  onSelectContact,
  partnerGroup,
}: ContactListProps) => {
  // We'll display either search results when searching or contacts when not searching
  const displayContacts = searchTerm && searchResults ? searchResults : contacts;

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
          <div>
            <h3 className="text-xs font-medium text-social-textSecondary px-4 py-2 bg-gray-50">SEARCH RESULTS</h3>
            {searchResults.map((result) => (
              <div
                key={result.id}
                className={`flex items-center gap-3 p-3 cursor-pointer ${
                  selectedContact?.id === result.id ? "bg-social-lightblue" : "hover:bg-social-gray"
                }`}
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
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Partner Group Option */}
            {partnerGroup && (
              <>
                <div className="px-4 py-2 bg-gray-50">
                  <h3 className="text-xs font-medium text-social-textSecondary">PARTNERS</h3>
                </div>
                <div
                  className={`flex items-center gap-3 p-3 cursor-pointer ${
                    selectedContact?.id === partnerGroup.id ? "bg-social-lightblue" : "hover:bg-social-gray"
                  }`}
                  onClick={() => onSelectContact(partnerGroup)}
                >
                  <div className="relative">
                    <Users className="h-8 w-8 p-1 bg-primary text-primary-foreground rounded-full" />
                  </div>
                  <div>
                    <p className="font-medium">{partnerGroup.full_name}</p>
                    <p className="text-sm text-social-textSecondary">
                      {partnerGroup.partners.length} partners
                    </p>
                  </div>
                </div>
              </>
            )}
            
            {/* Contacts Section */}
            {displayContacts && displayContacts.length > 0 && (
              <div className="px-4 py-2 bg-gray-50">
                <h3 className="text-xs font-medium text-social-textSecondary">CONTACTS</h3>
              </div>
            )}
            
            {displayContacts && displayContacts.length > 0 ? (
              displayContacts.map((contact) => (
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
            ) : !partnerGroup ? (
              <div className="p-6 text-center text-social-textSecondary">
                <p>No conversations yet</p>
                <p className="text-sm mt-1">Search for friends to start messaging</p>
              </div>
            ) : null}
          </>
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
