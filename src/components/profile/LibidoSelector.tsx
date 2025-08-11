import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

interface LibidoSelectorProps {
  libido: string | null;
  onLibidoChange: (value: string | null) => void;
}

const libidoOptions = [
  { value: "🚫", label: "🚫 Asexual – Human", description: "Not my thing." },
  { value: "🐼", label: "🐼 Very Low Libido – Panda", description: "Once in a blue moon." },
  { value: "🦥", label: "🦥 Low Libido – Sloth", description: "Slowly and infrequently, even during breeding season." },
  { value: "🦉", label: "🦉 Mild Libido – Barn Owl", description: "Monogamous and seasonal." },
  { value: "🐐", label: "🐐 Moderate Libido – Goat", description: "Seasonal breeders, but noticeably active when in heat." },
  { value: "🦌", label: "🦌 High Libido – White-tailed Deer", description: "All in during the season." },
  { value: "🐬", label: "🐬 Very High Libido – Bottlenose Dolphin", description: "ALL THE TIME" },
  { value: "🦘", label: "🦘 Death-Drive Libido – Antechinus", description: "Go out with a bang — literally." },
];

export const LibidoSelector: React.FC<LibidoSelectorProps> = ({
  libido,
  onLibidoChange
}) => {
  const [selectedLibido, setSelectedLibido] = useState<string>("");

  const handleAddLibido = () => {
    if (selectedLibido) {
      onLibidoChange(selectedLibido);
      setSelectedLibido("");
    }
  };

  const handleRemoveLibido = () => {
    onLibidoChange(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground">
          Libido Level
        </label>
        
        {libido && (
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge 
              variant="secondary" 
              className="flex items-center gap-1 px-3 py-1"
            >
              {libido}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={handleRemoveLibido}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          </div>
        )}

        {!libido && (
          <div className="flex items-center gap-2 mt-2">
            <Select value={selectedLibido} onValueChange={setSelectedLibido}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select your libido level..." />
              </SelectTrigger>
              <SelectContent>
                {libidoOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground italic">
                        "{option.description}"
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleAddLibido}
              disabled={!selectedLibido}
              size="sm"
            >
              Add
            </Button>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground mt-2">
          Share your comfort level with physical intimacy using our animal-inspired scale.
        </p>
      </div>
    </div>
  );
};