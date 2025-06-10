
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Globe, Users } from "lucide-react";

interface VisibilityToggleProps {
  isGlobal: boolean;
  onVisibilityChange: (value: boolean) => void;
  disabled?: boolean;
}

const VisibilityToggle: React.FC<VisibilityToggleProps> = ({ isGlobal, onVisibilityChange, disabled = false }) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch 
        id="visibility-mode" 
        checked={isGlobal} 
        onCheckedChange={onVisibilityChange}
        disabled={disabled}
      />
      <div className="flex items-center">
        {isGlobal ? (
          <>
            <Globe className="w-4 h-4 mr-1 text-social-blue" />
            <span className="text-sm text-social-blue">Global</span>
          </>
        ) : (
          <>
            <Users className="w-4 h-4 mr-1 text-social-textSecondary" />
            <span className="text-sm text-social-textSecondary">Connections Only</span>
          </>
        )}
      </div>
    </div>
  );
};

export default VisibilityToggle;
