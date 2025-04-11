
import { useState, ChangeEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Send, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";

const CreatePostCard = () => {
  const [postText, setPostText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setPostText(e.target.value);
  };
  
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
    setImagePreview(null);
  };
  
  const handleSubmit = async () => {
    if (!postText.trim() && !imagePreview) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setPostText("");
      setImagePreview(null);
      
      toast({
        title: "Post created",
        description: "Your post has been published successfully",
      });
    }, 1000);
  };
  
  return (
    <div className="social-card p-4 mb-4">
      <div className="flex items-start gap-3">
        <Avatar>
          <AvatarImage src="/placeholder.svg" alt="User" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="What's on your mind?"
            className="resize-none min-h-[80px] border-none bg-social-gray focus-visible:ring-0 p-3"
            value={postText}
            onChange={handleTextChange}
          />
          
          {imagePreview && (
            <div className="relative mt-2 rounded-lg overflow-hidden">
              <img src={imagePreview} alt="Post preview" className="w-full max-h-80 object-cover" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 w-8 h-8 rounded-full"
                onClick={removeImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-3">
            <div>
              <Button variant="ghost" size="sm" className="text-social-textSecondary" asChild>
                <label>
                  <Camera className="w-5 h-5 mr-1" />
                  <span>Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </Button>
            </div>
            <Button 
              onClick={handleSubmit} 
              disabled={(!postText.trim() && !imagePreview) || isSubmitting}
              className="bg-social-blue hover:bg-social-darkblue"
            >
              {isSubmitting ? "Posting..." : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Post
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostCard;
