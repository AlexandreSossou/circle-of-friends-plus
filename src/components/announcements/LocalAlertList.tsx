import { LocalAlertCard } from "./LocalAlertCard";
import { LocalAlert } from "@/types/localAlert";

interface LocalAlertListProps {
  localAlerts: LocalAlert[];
  onDelete: (id: string) => void;
}

export const LocalAlertList = ({ localAlerts, onDelete }: LocalAlertListProps) => {
  return (
    <div className="space-y-4">
      {localAlerts.map((localAlert) => (
        <LocalAlertCard 
          key={localAlert.id} 
          localAlert={localAlert} 
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};