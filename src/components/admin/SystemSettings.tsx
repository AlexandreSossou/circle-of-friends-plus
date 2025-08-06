import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Save, Settings } from 'lucide-react';

interface PostLimit {
  id: string;
  daily_limit: number;
  is_active: boolean;
  updated_at: string;
}

const SystemSettings = () => {
  const [postLimits, setPostLimits] = useState<PostLimit | null>(null);
  const [dailyLimit, setDailyLimit] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('post_limits')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPostLimits(data);
        setDailyLimit(data.daily_limit);
        setIsActive(data.is_active);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);

      if (postLimits) {
        // Update existing settings
        const { error } = await supabase
          .from('post_limits')
          .update({
            daily_limit: dailyLimit,
            is_active: isActive,
            updated_at: new Date().toISOString()
          })
          .eq('id', postLimits.id);

        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from('post_limits')
          .insert({
            daily_limit: dailyLimit,
            is_active: isActive
          });

        if (error) throw error;
      }

      // Log admin activity
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('admin_activities')
          .insert({
            admin_id: user.id,
            action: 'update_settings',
            target_type: 'setting',
            target_id: null,
            details: {
              daily_limit: dailyLimit,
              is_active: isActive
            }
          });
      }

      toast({
        title: "Settings saved",
        description: "System settings have been updated successfully"
      });

      fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Post Limits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="daily-limit">Daily Post Limit</Label>
              <Input
                id="daily-limit"
                type="number"
                min="1"
                max="100"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(parseInt(e.target.value) || 1)}
                placeholder="Enter daily post limit"
              />
              <p className="text-sm text-muted-foreground">
                Maximum number of posts a user can create per day
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="post-limits-active">Enable Post Limits</Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, users will be limited to the daily post limit
                </p>
              </div>
              <Switch
                id="post-limits-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button 
              onClick={saveSettings} 
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>

          {postLimits && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date(postLimits.updated_at).toLocaleString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platform Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform Version:</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Database Status:</span>
              <span className="font-medium text-green-600">Online</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Admin Panel:</span>
              <span className="font-medium">Active</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;