import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JoinRequest {
  id: string;
  user_id: string;
  status: string;
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface EventJoinRequestsProps {
  eventId: string;
  requests: JoinRequest[];
}

export const EventJoinRequests = ({ eventId, requests }: EventJoinRequestsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleRequestMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: "attending" | "rejected" }) => {
      const { error } = await supabase
        .from("event_attendees")
        .update({ status })
        .eq("id", requestId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      toast({
        title: "Success!",
        description: variables.status === "attending" 
          ? "Join request approved" 
          : "Join request rejected",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update request",
        variant: "destructive",
      });
    },
  });

  if (requests.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Join Requests ({requests.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {requests.map((request) => (
            <div key={request.id} className="flex items-center justify-between p-3 bg-social-gray rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={request.profiles?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>
                    {request.profiles?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{request.profiles?.full_name || "Unknown User"}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRequestMutation.mutate({ 
                    requestId: request.id, 
                    status: "attending" 
                  })}
                  disabled={handleRequestMutation.isPending}
                >
                  <Check className="w-4 h-4 mr-1" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRequestMutation.mutate({ 
                    requestId: request.id, 
                    status: "rejected" 
                  })}
                  disabled={handleRequestMutation.isPending}
                >
                  <X className="w-4 h-4 mr-1" /> Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
