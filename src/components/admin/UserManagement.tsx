import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Ban, Search, MoreVertical, Unlock, Shield, ShieldOff, Trash2 } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';

interface User {
  id: string;
  full_name?: string;
  username?: string;
  email?: string;
  avatar_url?: string;
  is_banned?: boolean;
  banned_reason?: string;
  banned_until?: string;
  created_at: string;
  role?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [banReason, setBanReason] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Use secure RPC function instead of direct SELECT
      const { data, error } = await supabase
        .rpc('get_safe_profiles_list')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch roles and emails for each user
      const usersWithRolesAndEmails = await Promise.all(
        (data || []).map(async (user) => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Fetch email from auth.users via secure function (admin-only)
          const { data: emailData } = await supabase
            .rpc('get_user_email', { user_id: user.id });

          return {
            ...user,
            role: roleData?.role || 'user',
            email: emailData || null
          };
        })
      );

      setUsers(usersWithRolesAndEmails);
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

  const banUser = async (userId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_banned: true,
          banned_reason: reason,
          banned_until: null // Permanent ban
        })
        .eq('id', userId);

      if (error) throw error;

      // Log admin activity
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('admin_activities')
          .insert({
            admin_id: user.id,
            action: 'ban_user',
            target_type: 'user',
            target_id: userId,
            details: { reason }
          });
      }

      toast({
        title: "User banned",
        description: "User has been successfully banned"
      });

      fetchUsers();
      setBanReason('');
      setSelectedUser(null);
    } catch (error) {
      console.error('Error banning user:', error);
      toast({
        title: "Error",
        description: "Failed to ban user",
        variant: "destructive"
      });
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_banned: false,
          banned_reason: null,
          banned_until: null
        })
        .eq('id', userId);

      if (error) throw error;

      // Log admin activity
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('admin_activities')
          .insert({
            admin_id: user.id,
            action: 'unban_user',
            target_type: 'user',
            target_id: userId,
            details: {}
          });
      }

      toast({
        title: "User unbanned",
        description: "User has been successfully unbanned"
      });

      fetchUsers();
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast({
        title: "Error",
        description: "Failed to unban user",
        variant: "destructive"
      });
    }
  };

  const promoteToModerator = async (userId: string) => {
    try {
      // Get current user to verify admin status
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Not authenticated');

      // Verify current user is admin (additional client-side check)
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUser.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleData) {
        throw new Error('Insufficient permissions');
      }

      // Prevent self-modification
      if (userId === currentUser.id) {
        throw new Error('Cannot modify your own role');
      }

      // Delete existing role and insert new one (secure approach)
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ 
          user_id: userId, 
          role: 'moderator',
          assigned_by: currentUser.id 
        });

      if (insertError) throw insertError;

      toast({
        title: "User promoted",
        description: "User has been promoted to moderator"
      });

      fetchUsers();
    } catch (error) {
      console.error('Error promoting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to promote user",
        variant: "destructive"
      });
    }
  };

  const demoteFromModerator = async (userId: string) => {
    try {
      // Get current user to verify admin status
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Not authenticated');

      // Verify current user is admin (additional client-side check)
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUser.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleData) {
        throw new Error('Insufficient permissions');
      }

      // Prevent self-modification
      if (userId === currentUser.id) {
        throw new Error('Cannot modify your own role');
      }

      // Delete existing role and insert new one (secure approach)
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ 
          user_id: userId, 
          role: 'user',
          assigned_by: currentUser.id 
        });

      if (insertError) throw insertError;

      toast({
        title: "User demoted",
        description: "User has been demoted to regular user"
      });

      fetchUsers();
    } catch (error) {
      console.error('Error demoting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to demote user",
        variant: "destructive"
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // Get current user to verify admin status
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Not authenticated');

      // Verify current user is admin (additional client-side check)
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUser.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleData) {
        throw new Error('Insufficient permissions');
      }

      // Prevent self-deletion
      if (userId === currentUser.id) {
        throw new Error('Cannot delete your own account');
      }

      // Check if target user is admin to prevent deletion
      const { data: targetRoleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (targetRoleData) {
        throw new Error('Cannot delete admin accounts');
      }

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Log admin activity
      await supabase
        .from('admin_activities')
        .insert({
          admin_id: currentUser.id,
          action: 'delete_user',
          target_type: 'user',
          target_id: userId,
          details: { timestamp: new Date().toISOString() }
        });

      toast({
        title: "User deleted",
        description: "User profile has been permanently deleted"
      });

      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
        {filteredUsers.map((user) => (
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
                    <h3 className="font-semibold">{user.full_name || user.username || 'Anonymous'}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={user.role === 'admin' ? 'default' : user.role === 'moderator' ? 'secondary' : 'outline'}>
                        {user.role}
                      </Badge>
                      {user.is_banned && (
                        <Badge variant="destructive">Banned</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {user.role !== 'admin' && (
                      <>
                        {user.role === 'moderator' ? (
                          <DropdownMenuItem onClick={() => demoteFromModerator(user.id)}>
                            <ShieldOff className="w-4 h-4 mr-2" />
                            Remove Moderator
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => promoteToModerator(user.id)}>
                            <Shield className="w-4 h-4 mr-2" />
                            Make Moderator
                          </DropdownMenuItem>
                        )}
                      </>
                    )}
                    {user.is_banned ? (
                      <DropdownMenuItem onClick={() => unbanUser(user.id)}>
                        <Unlock className="w-4 h-4 mr-2" />
                        Unban User
                      </DropdownMenuItem>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => {
                            e.preventDefault();
                            setSelectedUser(user);
                          }}>
                            <Ban className="w-4 h-4 mr-2" />
                            Ban User
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Ban User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to ban {user.full_name || user.username}? 
                              This will prevent them from accessing the platform.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="py-4">
                            <label className="text-sm font-medium">Reason for ban:</label>
                            <Textarea
                              value={banReason}
                              onChange={(e) => setBanReason(e.target.value)}
                              placeholder="Enter reason for banning this user..."
                              className="mt-2"
                            />
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => selectedUser && banUser(selectedUser.id, banReason)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Ban User
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                     )}
                     {user.role !== 'admin' && (
                       <AlertDialog>
                         <AlertDialogTrigger asChild>
                           <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                             <Trash2 className="w-4 h-4 mr-2" />
                             Delete User
                           </DropdownMenuItem>
                         </AlertDialogTrigger>
                         <AlertDialogContent>
                           <AlertDialogHeader>
                             <AlertDialogTitle>Delete User</AlertDialogTitle>
                             <AlertDialogDescription>
                               Are you sure you want to permanently delete {user.full_name || user.username}? 
                               This action cannot be undone and will remove their profile data.
                             </AlertDialogDescription>
                           </AlertDialogHeader>
                           <AlertDialogFooter>
                             <AlertDialogCancel>Cancel</AlertDialogCancel>
                             <AlertDialogAction
                               onClick={() => deleteUser(user.id)}
                               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                             >
                               Delete User
                             </AlertDialogAction>
                           </AlertDialogFooter>
                         </AlertDialogContent>
                       </AlertDialog>
                     )}
                   </DropdownMenuContent>
                 </DropdownMenu>
              </div>
              {user.banned_reason && (
                <div className="mt-3 p-3 bg-destructive/10 rounded-md">
                  <p className="text-sm font-medium text-destructive">Ban Reason:</p>
                  <p className="text-sm text-muted-foreground">{user.banned_reason}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;