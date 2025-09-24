
import { CalendarDays, Check, Clock, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

type ProfileVerificationProps = {
  profileId: string;
  isOwnProfile: boolean;
  lastConnection?: string;
  photoVerificationDate?: string;
  moderatorVerificationDate?: string;
  consentVerificationDate?: string;
}

const ProfileVerification = ({
  profileId,
  isOwnProfile,
  lastConnection,
  photoVerificationDate,
  moderatorVerificationDate,
  consentVerificationDate
}: ProfileVerificationProps) => {
  // Format dates if they exist
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not verified yet";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Shield className="h-5 w-5 mr-2 text-blue-500" />
          Verification Info
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0 text-sm">
        <div className="flex items-start">
          <Clock className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
          <div>
            <p className="font-medium">Last Connection</p>
            <p className="text-gray-600">{formatDate(lastConnection)}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <Check className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
          <div>
            <p className="font-medium">Photos Verified</p>
            <p className="text-gray-600">{formatDate(photoVerificationDate)}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <CalendarDays className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
          <div>
            <p className="font-medium">Profile Moderation</p>
            <p className="text-gray-600">{formatDate(moderatorVerificationDate)}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <Shield className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
          <div>
            <p className="font-medium">Consent Verified</p>
            <p className="text-gray-600">{formatDate(consentVerificationDate)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileVerification;
