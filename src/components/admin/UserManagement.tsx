import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  UserPlus, Shield, Trash2, RefreshCw, Mail, Key,
  User, Crown, Users, AlertTriangle, CheckCircle, ShieldCheck, ShieldOff,
  Pencil, Check, X as XIcon, Send, Loader2
} from 'lucide-react';
import { z } from 'zod';
import { useTOTP } from '@/hooks/useTOTP';
import { TwoFactorSetup } from '@/components/auth/TwoFactorSetup';

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'user' | null;
  created_at: string;
}

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['admin', 'user']),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export function UserManagement() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [twoFactorDialogOpen, setTwoFactorDialogOpen] = useState(false);
  const [disabling2FA, setDisabling2FA] = useState(false);
  const [disable2FACode, setDisable2FACode] = useState('');
  const [inviting, setInviting] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [totpStatus, setTotpStatus] = useState<{ enabled: boolean; hasSetup: boolean }>({ enabled: false, hasSetup: false });
  
  const { getStatus, disable: disableTOTP } = useTOTP();
  
  const [inviteForm, setInviteForm] = useState({
    email: '',
    fullName: '',
    role: 'user' as 'admin' | 'user',
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [rowActing, setRowActing] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  // Call admin-manage-users via raw fetch — supabase.functions.invoke has quirks
  // with the apikey/Authorization header combination that were causing 401s.
  const callAdminApi = async (body: Record<string, unknown>) => {
    const { data: sess } = await supabase.auth.getSession();
    const token = sess.session?.access_token;
    if (!token) throw new Error('Not authenticated');
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const res = await fetch(`${supabaseUrl}/functions/v1/admin-manage-users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': anonKey,
      },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error((json as any)?.detail || (json as any)?.error || `HTTP ${res.status}`);
    }
    return json;
  };

  const startEditName = (userId: string, currentName: string | null) => {
    setEditingUserId(userId);
    setEditName(currentName || '');
  };
  const cancelEditName = () => {
    setEditingUserId(null);
    setEditName('');
  };
  const saveEditName = async (userId: string) => {
    const trimmed = editName.trim();
    if (!trimmed) {
      toast.error('Name cannot be empty');
      return;
    }
    setRowActing(userId);
    try {
      await callAdminApi({ action: 'update_metadata', target_user_id: userId, full_name: trimmed });
      toast.success('Name updated');
      setEditingUserId(null);
      fetchUsers();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update name');
    } finally {
      setRowActing(null);
    }
  };

  const sendPasswordResetForUser = async (email: string) => {
    if (!confirm(`Send a password-reset link to ${email}?`)) return;
    setRowActing(email);
    try {
      await callAdminApi({ action: 'send_password_reset', target_email: email });
      toast.success(`Reset link sent to ${email}`);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to send reset link');
    } finally {
      setRowActing(null);
    }
  };

  const deleteUserAction = async (userId: string, email: string) => {
    if (userId === currentUserId) {
      toast.error("You can't delete your own account");
      return;
    }
    if (!confirm(`Delete ${email}? This removes the account permanently and cannot be undone.`)) return;
    setRowActing(userId);
    try {
      await callAdminApi({ action: 'delete_user', target_user_id: userId });
      toast.success(`Deleted ${email}`);
      fetchUsers();
    } catch (e: any) {
      const msg = e?.message || 'Failed to delete';
      if (msg.includes('cannot_delete_only_admin')) {
        toast.error("Can't delete — this is the only admin account");
      } else if (msg.includes('cannot_delete_self')) {
        toast.error("You can't delete your own account");
      } else {
        toast.error(msg);
      }
    } finally {
      setRowActing(null);
    }
  };

  useEffect(() => {
    fetchUsers();
    checkTOTPStatus();
  }, []);

  const checkTOTPStatus = async () => {
    const status = await getStatus();
    setTotpStatus(status);
  };

  const handleDisable2FA = async () => {
    if (disable2FACode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }
    setDisabling2FA(true);
    const success = await disableTOTP(disable2FACode);
    if (success) {
      toast.success('Two-factor authentication disabled');
      setTotpStatus({ enabled: false, hasSetup: false });
      setDisable2FACode('');
    }
    setDisabling2FA(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        return {
          id: profile.id,
          email: profile.email || '',
          full_name: profile.full_name,
          role: userRole?.role as 'admin' | 'user' | null,
          created_at: profile.created_at,
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = inviteSchema.safeParse(inviteForm);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setInviting(true);
    try {
      // Sign up new user (they'll need to confirm via email)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: inviteForm.email,
        password: Math.random().toString(36).slice(-12) + 'A1!', // Temporary password
        options: {
          emailRedirectTo: `${window.location.origin}/admin/auth`,
          data: {
            full_name: inviteForm.fullName,
          }
        }
      });

      if (signUpError) throw signUpError;

      if (signUpData.user) {
        // Add role if admin
        if (inviteForm.role === 'admin') {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: signUpData.user.id,
              role: 'admin',
            });

          if (roleError) {
            console.error('Error adding role:', roleError);
          }
        }

        toast.success(`Invitation sent to ${inviteForm.email}`);
        setInviteDialogOpen(false);
        setInviteForm({ email: '', fullName: '', role: 'user' });
        fetchUsers();
      }
    } catch (error: any) {
      console.error('Error inviting user:', error);
      if (error.message.includes('already registered')) {
        toast.error('This email is already registered');
      } else {
        toast.error(error.message || 'Failed to invite user');
      }
    } finally {
      setInviting(false);
    }
  };

  const toggleUserRole = async (userId: string, currentRole: 'admin' | 'user' | null) => {
    try {
      if (currentRole === 'admin') {
        // Remove admin role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');

        if (error) throw error;
        toast.success('Admin role removed');
      } else {
        // Add admin role
        const { error } = await supabase
          .from('user_roles')
          .upsert({
            user_id: userId,
            role: 'admin',
          });

        if (error) throw error;
        toast.success('Admin role granted');
      }
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = passwordSchema.safeParse(passwordForm);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      toast.success('Password updated successfully');
      setPasswordDialogOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage admin users and permissions</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Key className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Your Password</DialogTitle>
                <DialogDescription>
                  Enter your new password below
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleChangePassword} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="••••••••"
                  />
                  {errors.newPassword && (
                    <p className="text-sm text-destructive">{errors.newPassword}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={changingPassword}>
                    {changingPassword && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                    Update Password
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* 2FA Management */}
          <Dialog open={twoFactorDialogOpen} onOpenChange={setTwoFactorDialogOpen}>
            <DialogTrigger asChild>
              <Button variant={totpStatus.enabled ? "outline" : "default"}>
                {totpStatus.enabled ? (
                  <>
                    <ShieldCheck className="h-4 w-4 mr-2 text-green-500" />
                    2FA Enabled
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Enable 2FA
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Two-Factor Authentication</DialogTitle>
                <DialogDescription>
                  {totpStatus.enabled 
                    ? 'Manage your 2FA settings'
                    : 'Add an extra layer of security to your account'
                  }
                </DialogDescription>
              </DialogHeader>
              {totpStatus.enabled ? (
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <ShieldCheck className="h-6 w-6 text-green-500" />
                    <div>
                      <p className="font-medium text-green-700 dark:text-green-400">2FA is Active</p>
                      <p className="text-sm text-muted-foreground">Your account is protected</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Enter code to disable 2FA</Label>
                    <Input
                      value={disable2FACode}
                      onChange={(e) => setDisable2FACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="text-center font-mono"
                      maxLength={6}
                    />
                  </div>
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleDisable2FA}
                    disabled={disabling2FA || disable2FACode.length !== 6}
                  >
                    <ShieldOff className="h-4 w-4 mr-2" />
                    Disable 2FA
                  </Button>
                </div>
              ) : (
                <TwoFactorSetup 
                  onComplete={() => {
                    setTwoFactorDialogOpen(false);
                    checkTOTPStatus();
                  }}
                />
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
                <DialogDescription>
                  Create a new user account with specified role
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInviteUser} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={inviteForm.fullName}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="John Doe"
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="user@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={inviteForm.role}
                    onValueChange={(value: 'admin' | 'user') => setInviteForm(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Standard User
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          Administrator
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setInviteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={inviting}>
                    {inviting && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                    Send Invitation
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Crown className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</div>
                <p className="text-sm text-muted-foreground">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{users.filter(u => u.role !== 'admin').length}</div>
                <p className="text-sm text-muted-foreground">Standard Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            User Accounts
          </CardTitle>
          <CardDescription>
            Manage user roles and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          ) : (
            <div className="space-y-3">
              {users.map(user => (
                <div 
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {user.role === 'admin' ? (
                        <Crown className="h-5 w-5 text-primary" />
                      ) : (
                        <User className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      {editingUserId === user.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Full name"
                            className="h-8 text-sm w-56"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditName(user.id);
                              if (e.key === 'Escape') cancelEditName();
                            }}
                            autoFocus
                          />
                          <button
                            onClick={() => saveEditName(user.id)}
                            disabled={rowActing === user.id}
                            className="p-1.5 rounded text-emerald-600 hover:bg-emerald-500/10 disabled:opacity-40"
                            title="Save"
                          >
                            {rowActing === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={cancelEditName}
                            className="p-1.5 rounded text-muted-foreground hover:bg-muted"
                            title="Cancel"
                          >
                            <XIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <div className="font-medium">{user.full_name || 'Unnamed User'}</div>
                          <button
                            onClick={() => startEditName(user.id, user.full_name)}
                            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted opacity-50 hover:opacity-100 transition-opacity"
                            title="Edit name"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                        <Mail className="h-3 w-3" />
                        {user.email}
                        {user.id === currentUserId && (
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary bg-primary/10 px-1.5 rounded">You</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </Badge>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground hidden md:inline">Admin</span>
                      <Switch
                        checked={user.role === 'admin'}
                        onCheckedChange={() => toggleUserRole(user.id, user.role)}
                        disabled={user.id === currentUserId && user.role === 'admin'}
                        title={user.id === currentUserId && user.role === 'admin' ? "You can't demote yourself" : undefined}
                      />
                    </div>
                    <button
                      onClick={() => sendPasswordResetForUser(user.email)}
                      disabled={rowActing === user.email}
                      className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40"
                      title="Send password-reset email"
                    >
                      {rowActing === user.email ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => deleteUserAction(user.id, user.email)}
                      disabled={rowActing === user.id || user.id === currentUserId}
                      className="p-1.5 rounded text-rose-600 hover:bg-rose-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
                      title={user.id === currentUserId ? "You can't delete your own account" : "Delete user"}
                    >
                      {rowActing === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-yellow-500/20 bg-yellow-500/5">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="p-2 rounded-lg bg-yellow-500/10 h-fit">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h4 className="font-medium text-yellow-700 dark:text-yellow-500">Security Notice</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Admin users have full access to all orders, blog posts, and settings. 
                Only grant admin access to trusted team members. All actions are logged for security purposes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
