import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Loader2 } from "lucide-react";
import { useGroupJoinRequests } from "@/hooks/useGroupJoinRequests";
import { formatDistanceToNow } from "date-fns";

interface GroupJoinRequestsListProps {
  groupId: string;
}

export const GroupJoinRequestsList = ({ groupId }: GroupJoinRequestsListProps) => {
  const { requests, isLoading, approveRequestMutation, rejectRequestMutation } = useGroupJoinRequests(groupId);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-10 text-social-textSecondary">
        <p>No pending join requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={request.profile?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>
                  {request.profile?.full_name?.charAt(0) || request.profile?.username?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-base">
                  {request.profile?.full_name || request.profile?.username || "Anonymous User"}
                </CardTitle>
                <CardDescription>
                  {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-social-textSecondary mb-4">{request.message}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => approveRequestMutation.mutate(request.id)}
                disabled={approveRequestMutation.isPending || rejectRequestMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {approveRequestMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => rejectRequestMutation.mutate(request.id)}
                disabled={approveRequestMutation.isPending || rejectRequestMutation.isPending}
              >
                {rejectRequestMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
