import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, Check, X } from "lucide-react";
import { useImageConsent } from "@/hooks/useImageConsent";

const ImageConsentNotification = () => {
  const { pendingRequests, approveConsent, denyConsent, isUpdating } = useImageConsent();

  if (pendingRequests.length === 0) {
    return null;
  }

  return (
    <Card className="mb-4 border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-600" />
          <h3 className="font-semibold text-orange-800">Image Consent Requests</h3>
          <Badge variant="secondary">{pendingRequests.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {pendingRequests.map((request) => (
          <div key={request.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={request.profiles?.avatar_url} />
                <AvatarFallback>
                  {request.profiles?.full_name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  <span className="font-semibold">{request.profiles?.full_name}</span> tagged you in an image
                </p>
                <p className="text-xs text-muted-foreground">
                  This image will only be visible after your consent
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => approveConsent(request.id)}
                disabled={isUpdating}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                <Check className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => denyConsent(request.id)}
                disabled={isUpdating}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-1" />
                Deny
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ImageConsentNotification;