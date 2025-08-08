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
import { Ban, Search, MoreVertical, Unlock } from 'lucide-react';
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch roles separately for each user
      const usersWithRoles = await Promise.all(
        (data || []).map(async (user) => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...user,
            role: roleData?.role || 'user'
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