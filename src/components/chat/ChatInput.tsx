
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
}

const ChatInput = ({ onSendMessage }: ChatInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    onSendMessage(inputValue.trim());
    setInputValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 flex gap-2">
      <Input
        type="text"
        placeholder="Type your message..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" className="bg-social-blue hover:bg-social-darkblue">
        Send
      </Button>
    </form>
  );
};

export default ChatInput;
