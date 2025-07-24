// src/components/admin/AdminSettings.tsx
// Admin settings component that includes Gemini key management

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { GeminiKeyManagement } from './GeminiKeyManagement';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  Key,
  Settings,
  AlertTriangle,
  Activity,
  Users,
  Database,
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalApiKeys: number;
  activeApiKeys: number;
  systemHealth: 'healthy' | 'warning' | 'error';
}

export function AdminSettings() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalApiKeys: 0,
    activeApiKeys: 0,
    systemHealth: 'healthy',
  });

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Check if user has admin access by trying to fetch admin data
        const response = await fetch('/api/admin/status');
        if (response.ok) {
          setIsAdmin(true);
          const data = await response.json();
          setStats(data.stats || stats);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You do not have administrator access. Contact your system administrator to request admin privileges.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Administrator Dashboard
          </CardTitle>
          <CardDescription>
            Manage system settings, API keys, and monitor application health.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-sm font-medium">{stats.totalUsers} Users</div>
                <div className="text-xs text-muted-foreground">{stats.activeUsers} active</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-sm font-medium">{stats.totalApiKeys} API Keys</div>
                <div className="text-xs text-muted-foreground">{stats.activeApiKeys} active</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-500" />
              <div>
                <div className="text-sm font-medium">System Status</div>
                <Badge variant={
                  stats.systemHealth === 'healthy' ? 'default' :
                  stats.systemHealth === 'warning' ? 'secondary' : 'destructive'
                }>
                  {stats.systemHealth}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-500" />
              <div>
                <div className="text-sm font-medium">Database</div>
                <div className="text-xs text-muted-foreground">Connected</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Tabs */}
      <Tabs defaultValue="api-keys" className="space-y-4">
        <TabsList>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="system">System Settings</TabsTrigger>
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys">
          <GeminiKeyManagement />
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage user accounts, permissions, and access levels.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>User management features coming soon</p>
                <p className="text-sm">This will include user roles, permissions, and account management</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Settings
              </CardTitle>
              <CardDescription>
                Configure application-wide settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>System settings features coming soon</p>
                <p className="text-sm">This will include application configuration and system preferences</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Audit Logs
              </CardTitle>
              <CardDescription>
                View system activity logs and security events.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Audit log viewer coming soon</p>
                <p className="text-sm">This will show recent system activities and security events</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}