import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

type UserWarning = {
  id: string;
  warning_message: string;
  warning_type: string;
  created_at: string;
  acknowledged: boolean;
};

const UserWarningDialog = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [warnings, setWarnings] = useState<UserWarning[]>([]);
  const [currentWarning, setCurrentWarning] = useState<UserWarning | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchWarnings = async () => {
      const { data, error } = await supabase
        .from('user_warnings')
        .select('*')
        .eq('user_id', user.id)
        .eq('acknowledged', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching warnings:', error);
        return;
      }

      if (data && data.length > 0) {
        setWarnings(data);
        setCurrentWarning(data[0]);
      }
    };

    fetchWarnings();

    // Listen for new warnings
    const channel = supabase
      .channel('user-warnings')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_warnings',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        const newWarning = payload.new as UserWarning;
        setWarnings(prev => [newWarning, ...prev]);
        setCurrentWarning(newWarning);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const acknowledgeWarning = async () => {
    if (!currentWarning) return;

    try {
      const { error } = await supabase
        .from('user_warnings')
        .update({ acknowledged: true })
        .eq('id', currentWarning.id);

      if (error) throw error;

      // Remove from warnings and show next if any
      const remainingWarnings = warnings.filter(w => w.id !== currentWarning.id);
      setWarnings(remainingWarnings);
      setCurrentWarning(remainingWarnings.length > 0 ? remainingWarnings[0] : null);

      toast({
        title: "Warning acknowledged",
        description: "Please keep our community guidelines in mind.",
      });
    } catch (error) {
      console.error('Error acknowledging warning:', error);
      toast({
        title: "Error",
        description: "Failed to acknowledge warning. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!currentWarning) return null;

  const getWarningTitle = (type: string) => {
    switch (type) {
      case 'abusive_language':
        return 'Language Warning';
      case 'dangerous_content':
        return 'Content Safety Warning';
      default:
        return 'Community Guidelines Warning';
    }
  };

  const getWarningColor = (type: string) => {
    switch (type) {
      case 'dangerous_content':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={!!currentWarning} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {getWarningTitle(currentWarning.warning_type)}
          </DialogTitle>
          <DialogDescription>
            We've detected content that may not align with our community guidelines.
          </DialogDescription>
        </DialogHeader>

        <Alert variant={getWarningColor(currentWarning.warning_type)}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="mt-1">
            {currentWarning.warning_message}
          </AlertDescription>
        </Alert>

        <div className="text-sm text-muted-foreground">
          <p className="mb-2">
            <strong>What this means:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Your message has been flagged for review</li>
            <li>Repeated violations may result in account restrictions</li>
            <li>Please review our community guidelines</li>
          </ul>
        </div>

        <DialogFooter className="flex-col sm:flex-col space-y-2">
          <Button onClick={acknowledgeWarning} className="w-full">
            I understand - Continue
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            By continuing, you acknowledge this warning and agree to follow our community guidelines.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserWarningDialog;