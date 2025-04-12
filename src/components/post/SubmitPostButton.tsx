
import React from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface SubmitPostButtonProps {
  isSubmitting: boolean;
  isDisabled: boolean;
  onSubmit: () => void;
}

const SubmitPostButton: React.FC<SubmitPostButtonProps> = ({ 
  isSubmitting, 
  isDisabled, 
  onSubmit 
}) => {
  return (
    <Button 
      onClick={onSubmit} 
      disabled={isDisabled || isSubmitting}
      className="bg-social-blue hover:bg-social-darkblue"
    >
      {isSubmitting ? "Posting..." : (
        <>
          <Send className="w-4 h-4 mr-2" />
          Post
        </>
      )}
    </Button>
  );
};

export default SubmitPostButton;
