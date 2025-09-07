import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Save, AlertTriangle } from "lucide-react";

interface LocalAlertLimit {
  id: string;
  gender: string;
  monthly_limit: number;
  is_active: boolean;
  updated_at: string;
}

const LocalAlertTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editedLimits, setEditedLimits] = useState<Record<string, { limit: number; active: boolean }>>({});

  // Fetch local alert limits
  const { data: limits = [], isLoading } = useQuery({
    queryKey: ["localAlertLimits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("local_alert_limits")
        .select("*")
        .order("gender");

      if (error) throw error;
      return data as LocalAlertLimit[];
    },
  });

  // Update limits mutation
  const updateLimitsMutation = useMutation({
    mutationFn: async (limitsToUpdate: { id: string; monthly_limit: number; is_active: boolean }[]) => {
      const user = await supabase.auth.getUser();
      const promises = limitsToUpdate.map(limit =>
        supabase
          .from("local_alert_limits")
          .update({
            monthly_limit: limit.monthly_limit,
            is_active: limit.is_active,
            updated_by: user.data.user?.id
          })
          .eq("id", limit.id)
      );

      const results = await Promise.all(promises);
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} limit(s)`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["localAlertLimits"] });
      setEditedLimits({});
      toast({
        title: "Success",
        description: "Local alert limits updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update limits",
        variant: "destructive",
      });
    },
  });

  const handleLimitChange = (limitId: string, field: 'limit' | 'active', value: number | boolean) => {
    setEditedLimits(prev => ({
      ...prev,
      [limitId]: {
        limit: field === 'limit' ? (value as number) : (prev[limitId]?.limit ?? 0),
        active: field === 'active' ? (value as boolean) : (prev[limitId]?.active ?? true),
      }
    }));
  };

  const getCurrentValue = (limit: LocalAlertLimit, field: 'limit' | 'active') => {
    const edited = editedLimits[limit.id];
    if (!edited) return field === 'limit' ? limit.monthly_limit : limit.is_active;
    return field === 'limit' ? (edited.limit ?? limit.monthly_limit) : (edited.active ?? limit.is_active);
  };

  const hasChanges = Object.keys(editedLimits).length > 0;

  const handleSave = () => {
    const limitsToUpdate = Object.entries(editedLimits).map(([limitId, changes]) => {
      const originalLimit = limits.find(l => l.id === limitId)!;
      return {
        id: limitId,
        monthly_limit: changes.limit ?? originalLimit.monthly_limit,
        is_active: changes.active ?? originalLimit.is_active,
      };
    });

    updateLimitsMutation.mutate(limitsToUpdate);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Local Alert Limits by Gender
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure how many local alerts each gender can create per month. Set to 0 for unlimited.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {limits.map((limit) => (
              <div key={limit.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4 flex-1">
                  <div className="min-w-[120px]">
                    <Label className="font-medium capitalize">{limit.gender}</Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`limit-${limit.id}`} className="text-sm">
                      Monthly Limit:
                    </Label>
                    <Input
                      id={`limit-${limit.id}`}
                      type="number"
                      min="0"
                      max="100"
                      value={getCurrentValue(limit, 'limit').toString()}
                      onChange={(e) => handleLimitChange(limit.id, 'limit', parseInt(e.target.value) || 0)}
                      className="w-20"
                    />
                    <span className="text-xs text-muted-foreground">
                      (0 = unlimited)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor={`active-${limit.id}`} className="text-sm">
                    Active:
                  </Label>
                  <Switch
                    id={`active-${limit.id}`}
                    checked={getCurrentValue(limit, 'active') as boolean}
                    onCheckedChange={(checked) => handleLimitChange(limit.id, 'active', checked)}
                  />
                </div>
              </div>
            ))}
          </div>

          {hasChanges && (
            <div className="flex justify-end pt-4 border-t">
              <Button 
                onClick={handleSave}
                disabled={updateLimitsMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {updateLimitsMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LocalAlertTab;