import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useProfileType } from "@/context/ProfileTypeContext";
import { useAuth } from "@/context/AuthContext";

const ProfileTypeSwitch = () => {
  const { user } = useAuth();
  const { currentProfileType, toggleProfileType } = useProfileType();

  // Don't show if user is not authenticated
  if (!user) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleProfileType}
      className="hidden md:flex items-center gap-2 text-sm"
      title={`Switch to ${currentProfileType === "public" ? "private" : "public"} profile`}
    >
      {currentProfileType === "public" ? (
        <>
          <Eye className="w-4 h-4" />
          <span>Public</span>
        </>
      ) : (
        <>
          <EyeOff className="w-4 h-4" />
          <span>Private</span>
        </>
      )}
    </Button>
  );
};

export default ProfileTypeSwitch;