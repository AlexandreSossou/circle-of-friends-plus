
import { Button } from "@/components/ui/button";
import { useCalmMode } from "@/context/CalmModeContext";
import { Moon, Sun, Sparkles } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export function CalmModeToggle({ className }: { className?: string }) {
  const { calmMode, toggleCalmMode } = useCalmMode();

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleCalmMode}
          className={`h-8 w-8 bg-transparent ${className}`}
        >
          {calmMode ? (
            <Sparkles className="h-4 w-4 text-purple-400" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle calm mode</span>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent align="end" className="w-56">
        <div className="text-sm">
          {calmMode ? "Exit Calm Mode" : "Enter Calm Mode"}
          <p className="text-xs text-muted-foreground">
            {calmMode 
              ? "Return to standard colors" 
              : "Switch to soothing, calming colors"
            }
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
