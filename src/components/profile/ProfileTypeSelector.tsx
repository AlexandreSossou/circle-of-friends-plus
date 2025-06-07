
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileType } from "@/types/profile";

type ProfileTypeSelectorProps = {
  currentType: ProfileType;
  onTypeChange: (type: ProfileType) => void;
  publicEnabled: boolean;
  privateEnabled: boolean;
};

const ProfileTypeSelector = ({ 
  currentType, 
  onTypeChange, 
  publicEnabled, 
  privateEnabled 
}: ProfileTypeSelectorProps) => {
  // If both profiles are disabled, don't show selector
  if (!publicEnabled && !privateEnabled) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-yellow-800 text-sm">
          Both profile types are disabled. Enable at least one profile type in settings.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <Tabs value={currentType} onValueChange={(value) => onTypeChange(value as ProfileType)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger 
            value="public" 
            disabled={!publicEnabled}
            className={!publicEnabled ? "opacity-50" : ""}
          >
            Public Profile
          </TabsTrigger>
          <TabsTrigger 
            value="private" 
            disabled={!privateEnabled}
            className={!privateEnabled ? "opacity-50" : ""}
          >
            Private Profile
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default ProfileTypeSelector;
