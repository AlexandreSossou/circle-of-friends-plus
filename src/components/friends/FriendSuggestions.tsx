
import FriendSuggestion from "./FriendSuggestion";
import { Friend } from "@/types/friends";

interface FriendSuggestionsProps {
  suggestions: Friend[];
  onAddFriend: (id: string, name: string) => void;
}

const FriendSuggestions = ({ suggestions, onAddFriend }: FriendSuggestionsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {suggestions.map((suggestion) => (
        <FriendSuggestion
          key={suggestion.id}
          suggestion={suggestion}
          onAddFriend={onAddFriend}
        />
      ))}
    </div>
  );
};

export default FriendSuggestions;
