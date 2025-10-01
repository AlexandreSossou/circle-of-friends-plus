import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus } from "lucide-react";
import { useGroupJoinRequests } from "@/hooks/useGroupJoinRequests";

interface GroupJoinRequestDialogProps {
  groupId: string;
  groupName: string;
}

export const GroupJoinRequestDialog = ({ groupId, groupName }: GroupJoinRequestDialogProps) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const { createRequestMutation } = useGroupJoinRequests(groupId);

  const handleSubmit = () => {
    if (!message.trim()) return;

    createRequestMutation.mutate(
      { groupId, message },
      {
        onSuccess: () => {
          setMessage("");
          setOpen(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-social-blue hover:bg-social-darkblue">
          <UserPlus className="w-4 h-4 mr-2" />
          Request to Join
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request to Join {groupName}</DialogTitle>
          <DialogDescription>
            Send a message to the group admin explaining why you'd like to join.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="message">Your message</Label>
            <Textarea
              id="message"
              placeholder="Tell the admin why you want to join this group..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!message.trim() || createRequestMutation.isPending}
            className="bg-social-blue hover:bg-social-darkblue"
          >
            {createRequestMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Request"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
