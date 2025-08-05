import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  full_name: string;
  avatar_url: string;
}

interface UserMentionInputProps {
  value: string;
  onChange: (value: string, taggedUsers: User[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const UserMentionInput: React.FC<UserMentionInputProps> = ({
  value,
  onChange,
  placeholder = "What's on your mind?",
  disabled = false,
  className
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStartPos, setMentionStartPos] = useState(-1);
  const [taggedUsers, setTaggedUsers] = useState<User[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch users for mentions
  const { data: users = [] } = useQuery({
    queryKey: ["users", mentionQuery],
    queryFn: async () => {
      if (!mentionQuery) return [];
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .ilike("full_name", `%${mentionQuery}%`)
        .limit(5);
      
      if (error) throw error;
      return data as User[];
    },
    enabled: mentionQuery.length > 0
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    // Check for @ mentions
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    
    if (lastAtIndex !== -1 && lastAtIndex < cursorPos) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      
      // Check if there's a space between @ and cursor (end mention)
      if (textAfterAt.includes(" ") || textAfterAt.includes("\n")) {
        setShowSuggestions(false);
        setMentionQuery("");
        setMentionStartPos(-1);
      } else {
        setShowSuggestions(true);
        setMentionQuery(textAfterAt);
        setMentionStartPos(lastAtIndex);
      }
    } else {
      setShowSuggestions(false);
      setMentionQuery("");
      setMentionStartPos(-1);
    }
    
    onChange(newValue, taggedUsers);
  };

  const handleUserSelect = (user: User) => {
    if (mentionStartPos === -1) return;
    
    const beforeMention = value.substring(0, mentionStartPos);
    const afterMention = value.substring(mentionStartPos + mentionQuery.length + 1);
    const newValue = `${beforeMention}@${user.full_name} ${afterMention}`;
    
    // Add user to tagged users if not already present
    const newTaggedUsers = taggedUsers.find(u => u.id === user.id) 
      ? taggedUsers 
      : [...taggedUsers, user];
    
    setTaggedUsers(newTaggedUsers);
    onChange(newValue, newTaggedUsers);
    setShowSuggestions(false);
    setMentionQuery("");
    setMentionStartPos(-1);
    
    // Focus back to textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
      const newCursorPos = beforeMention.length + user.full_name.length + 2;
      textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowSuggestions(false);
      setMentionQuery("");
      setMentionStartPos(-1);
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "resize-none min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      />
      
      {showSuggestions && users.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-md z-50 max-h-40 overflow-y-auto">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => handleUserSelect(user)}
              className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
            >
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-6 h-6 rounded-full"
              />
              <span>{user.full_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};