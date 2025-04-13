
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type CalmModeContextType = {
  calmMode: boolean;
  toggleCalmMode: () => void;
};

const CalmModeContext = createContext<CalmModeContextType | undefined>(undefined);

export function CalmModeProvider({ children }: { children: ReactNode }) {
  const [calmMode, setCalmMode] = useState<boolean>(false);

  useEffect(() => {
    // Check if the user has previously set a preference
    const storedPreference = localStorage.getItem("calmMode");
    
    if (storedPreference) {
      setCalmMode(storedPreference === "true");
    }
  }, []);

  useEffect(() => {
    // Apply or remove the calm class based on state
    if (calmMode) {
      document.body.classList.add("calm");
    } else {
      document.body.classList.remove("calm");
    }
    
    // Save preference to localStorage
    localStorage.setItem("calmMode", calmMode.toString());
  }, [calmMode]);

  const toggleCalmMode = () => {
    setCalmMode(prev => !prev);
  };

  return (
    <CalmModeContext.Provider value={{ calmMode, toggleCalmMode }}>
      {children}
    </CalmModeContext.Provider>
  );
}

export function useCalmMode() {
  const context = useContext(CalmModeContext);
  
  if (context === undefined) {
    throw new Error("useCalmMode must be used within a CalmModeProvider");
  }
  
  return context;
}
