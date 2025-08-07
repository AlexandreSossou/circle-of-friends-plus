import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useUserRole } from '@/hooks/useUserRole';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, Settings, BarChart3, Shield, Newspaper } from 'lucide-react';
import UserManagement from '@/components/admin/UserManagement';
import ContentModeration from '@/components/admin/ContentModeration';
import SystemSettings from '@/components/admin/SystemSettings';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import RoleManagement from '@/components/admin/RoleManagement';
import NewsManagement from '@/components/admin/NewsManagement';

const Admin = () => {
  const navigate = useNavigate();
  const { hasAdminAccess, isLoading } = useUserRole();

  useEffect(() => {
    if (!isLoading && !hasAdminAccess) {
      navigate('/');
    }
  }, [hasAdminAccess, isLoading, navigate]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading admin panel...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!hasAdminAccess) {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-heading-lg font-bold">Admin Panel</h1>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Newspaper className="w-4 h-4" />
              News
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Content Moderation</CardTitle>
              </CardHeader>
              <CardContent>
                <ContentModeration />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news">
            <Card>
              <CardHeader>
                <CardTitle>News Management</CardTitle>
              </CardHeader>
              <CardContent>
                <NewsManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <CardTitle>Role Management</CardTitle>
              </CardHeader>
              <CardContent>
                <RoleManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <SystemSettings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminAnalytics />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Admin;