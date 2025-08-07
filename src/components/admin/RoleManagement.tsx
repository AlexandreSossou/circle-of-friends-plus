import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, UserCheck, Shield, Crown } from 'lucide-react';

interface UserWithRole {
  id: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  created_at: string;
  user_roles: Array<{
    id: string;
    role: 'admin' | 'moderator' | 'user';
    assigned_at: string;
  }>;
}

const RoleManagement = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch roles separately for each user
      const usersWithRoles = await Promise.all(
        (data || []).map(async (user) => {
          const { data: rolesData } = await supabase
            .from('user_roles')
            .select('id, role, assigned_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          return {
            ...user,
            user_roles: rolesData || []
          };
        })
      );
      
      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'moderator' | 'user') => {
    try {
      // First, remove existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Then assign new role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: newRole
        });

      if (error) throw error;

      // Log admin activity
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('admin_activities')
          .insert({
            admin_id: user.id,
            action: 'assign_role',
            target_type: 'user',
            target_id: userId,
            details: { role: newRole }
          });
      }

      toast({
        title: "Role updated",
        description: `User role updated to ${newRole}`
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive"
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4" />;
      case 'moderator':
        return <Shield className="w-4 h-4" />;
      default:
        return <UserCheck className="w-4 h-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'moderator':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredUsers.map((user) => {
          const currentRole = user.user_roles?.[0]?.role || 'user';
          
          return (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>
                        {user.full_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {user.full_name || user.username || 'Anonymous'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={getRoleBadgeVariant(currentRole)}
                          className="flex items-center gap-1"
                        >
                          {getRoleIcon(currentRole)}
                          {currentRole}
                        </Badge>
                        {user.user_roles?.[0]?.assigned_at && (
                          <span className="text-xs text-muted-foreground">
                            Assigned {new Date(user.user_roles[0].assigned_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={currentRole}
                      onValueChange={(newRole: 'admin' | 'moderator' | 'user') => 
                        updateUserRole(user.id, newRole)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4" />
                            User
                          </div>
                        </SelectItem>
                        <SelectItem value="moderator">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Moderator
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Crown className="w-4 h-4" />
                            Admin
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RoleManagement;