import { createContext, useContext, useState, ReactNode } from "react";
import { ProfileType } from "@/types/profile";

type ProfileTypeContextType = {
  currentProfileType: ProfileType;
  setCurrentProfileType: (type: ProfileType) => void;
  toggleProfileType: () => void;
};

const ProfileTypeContext = createContext<ProfileTypeContextType | undefined>(undefined);

export function ProfileTypeProvider({ children }: { children: ReactNode }) {
  const [currentProfileType, setCurrentProfileType] = useState<ProfileType>("public");

  const toggleProfileType = () => {
    setCurrentProfileType(prev => prev === "public" ? "private" : "public");
  };

  return (
    <ProfileTypeContext.Provider 
      value={{ 
        currentProfileType, 
        setCurrentProfileType, 
        toggleProfileType 
      }}
    >
      {children}
    </ProfileTypeContext.Provider>
  );
}

export function useProfileType() {
  const context = useContext(ProfileTypeContext);
  if (!context) {
    throw new Error("useProfileType must be used within a ProfileTypeProvider");
  }
  return context;
}