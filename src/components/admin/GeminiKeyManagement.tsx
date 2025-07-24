// src/components/admin/GeminiKeyManagement.tsx
// Component for managing Gemini API keys in admin settings

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Key,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';

interface GeminiApiKey {
  id: string;
  name: string;
  key: string; // Masked version
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
  last_used?: string;
  usage_count: number;
  failure_count: number;
}

interface AddKeyFormData {
  name: string;
  key: string;
  is_active: boolean;
  priority: number;
}

export function GeminiKeyManagement() {
  const { user } = useAuth();
  const [keys, setKeys] = useState<GeminiApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<GeminiApiKey | null>(null);
  const [formData, setFormData] = useState<AddKeyFormData>({
    name: '',
    key: '',
    is_active: true,
    priority: 1,
  });

  // Load API keys
  const loadKeys = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/gemini-keys');
      
      if (!response.ok) {
        if (response.status === 403) {
          toast.error('Admin access required');
          return;
        }
        throw new Error('Failed to load API keys');
      }

      const data = await response.json();
      setKeys(data.keys || []);
    } catch (error) {
      console.error('Error loading keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  // Add new API key
  const addKey = async () => {
    try {
      if (!formData.name || !formData.key) {
        toast.error('Name and API key are required');
        return;
      }

      const response = await fetch('/api/admin/gemini-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add API key');
      }

      toast.success('API key added successfully');
      setAddDialogOpen(false);
      setFormData({ name: '', key: '', is_active: true, priority: 1 });
      loadKeys();
    } catch (error) {
      console.error('Error adding key:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add API key');
    }
  };

  // Update API key
  const updateKey = async () => {
    try {
      if (!selectedKey) return;

      const response = await fetch('/api/admin/gemini-keys', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedKey.id,
          name: formData.name,
          is_active: formData.is_active,
          priority: formData.priority,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update API key');
      }

      toast.success('API key updated successfully');
      setEditDialogOpen(false);
      setSelectedKey(null);
      loadKeys();
    } catch (error) {
      console.error('Error updating key:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update API key');
    }
  };

  // Delete API key
  const deleteKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/admin/gemini-keys?id=${keyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete API key');
      }

      toast.success('API key deleted successfully');
      loadKeys();
    } catch (error) {
      console.error('Error deleting key:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete API key');
    }
  };

  // Test API key
  const testKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/admin/gemini-keys/test?id=${keyId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Key test failed');
      }

      toast.success('API key is valid and working');
    } catch (error) {
      console.error('Error testing key:', error);
      toast.error(error instanceof Error ? error.message : 'Key test failed');
    }
  };

  // Open edit dialog
  const openEditDialog = (key: GeminiApiKey) => {
    setSelectedKey(key);
    setFormData({
      name: key.name,
      key: key.key, // This is masked
      is_active: key.is_active,
      priority: key.priority,
    });
    setEditDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({ name: '', key: '', is_active: true, priority: 1 });
    setSelectedKey(null);
  };

  useEffect(() => {
    if (user) {
      loadKeys();
    }
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Gemini API Key Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Gemini API Key Management
        </CardTitle>
        <CardDescription>
          Manage multiple Gemini API keys for rate limiting and failover. Keys are encrypted and securely stored.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Header Actions */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{keys.length} keys total</Badge>
              <Badge variant="default">
                {keys.filter(k => k.is_active).length} active
              </Badge>
            </div>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add API Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Gemini API Key</DialogTitle>
                  <DialogDescription>
                    Add a new Gemini API key for rate limiting rotation. The key will be encrypted and stored securely.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Production Key 1"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="key">API Key</Label>
                    <Input
                      id="key"
                      type="password"
                      placeholder="AIza..."
                      value={formData.key}
                      onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Input
                      id="priority"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addKey}>Add Key</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Keys Table */}
          {keys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No API keys configured</p>
              <p className="text-sm">Add your first Gemini API key to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        {key.key}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={key.is_active ? 'default' : 'secondary'}>
                        {key.is_active ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>{key.priority}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{key.usage_count} requests</div>
                        {key.failure_count > 0 && (
                          <div className="text-red-600">{key.failure_count} failures</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {key.last_used ? (
                        <div className="text-sm text-muted-foreground">
                          {new Date(key.last_used).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testKey(key.id)}
                        >
                          <Activity className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(key)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{key.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteKey(key.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Edit Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit API Key</DialogTitle>
                <DialogDescription>
                  Update the settings for this API key. The actual key value cannot be modified.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Input
                    id="edit-priority"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="edit-is_active">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={updateKey}>Update Key</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}