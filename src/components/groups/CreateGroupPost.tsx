import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send } from "lucide-react";

interface CreateGroupPostProps {
  onSubmit: (content: string) => void;
  isSubmitting?: boolean;
}

const CreateGroupPost = ({ onSubmit, isSubmitting }: CreateGroupPostProps) => {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content);
      setContent("");
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <Textarea
          placeholder="Share something with the group..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="resize-none"
        />
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CreateGroupPost;