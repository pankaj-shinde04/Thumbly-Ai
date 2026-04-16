import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import {
  Plus,
  Image,
  ChevronLeft,
  ChevronRight,
  Trash2,
  MoreHorizontal,
  Youtube,
  Instagram,
  Edit2,
  X,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { DesignSession } from '@/pages/Dashboard';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface DashboardSidebarProps {
  sessions: DesignSession[];
  activeSessionId: string | null;
  activeView: 'chat' | 'gallery';
  collapsed: boolean;
  onNewSession: (platform?: string) => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onViewChange: (view: 'chat' | 'gallery') => void;
  onToggleCollapse: () => void;
  isMobile?: boolean;
}

const DashboardSidebar = ({
  sessions,
  activeSessionId,
  activeView,
  collapsed,
  onNewSession,
  onSelectSession,
  onDeleteSession,
  onViewChange,
  onToggleCollapse,
  isMobile = false,
}: DashboardSidebarProps) => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  // Profile dialog state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Sync editedName when user.name changes
  useEffect(() => {
    setEditedName(user?.name || '');
  }, [user?.name]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveName = async () => {
    try {
      setIsSaving(true);
      await updateUser({ name: editedName });
      setIsEditing(false);
    } catch (error: any) {
      console.error('Failed to update name:', error);
      alert(error.message || 'Failed to update name');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAvatar = async () => {
    try {
      setIsSavingAvatar(true);
      
      if (!avatarFile) {
        return;
      }
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', avatarFile);
      formData.append('type', 'profile');
      
      const token = localStorage.getItem('thumbly_access_token');
      const uploadResponse = await fetch('http://localhost:4001/api/v1/assets/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      
      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) {
        throw new Error(uploadData.error?.message || 'Failed to upload avatar');
      }
      
      const avatarUrl = uploadData.data.asset.url;
      
      // Update user profile with new avatar URL
      await updateUser({ avatarUrl });
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error: any) {
      console.error('Failed to update avatar:', error);
      alert(error.message || 'Failed to update avatar');
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleCancelEdit = () => {
    setEditedName(user?.name || '');
    setIsEditing(false);
  };

  const handleProfileClick = () => {
    setIsProfileOpen(true);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return <Youtube className="w-3 h-3" />;
      case 'instagram-post':
      case 'instagram-reel':
        return <Instagram className="w-3 h-3" />;
      default:
        return <Image className="w-3 h-3" />;
    }
  };

  // On mobile, never show collapsed state
  const isCollapsed = isMobile ? false : collapsed;

  return (
    <aside
      className={cn(
        'h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-72'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        {!isCollapsed && <Logo size="sm" />}
        {!isMobile && (
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* New Design Button */}
      <div className="p-3">
        <Button
          variant="gradient"
          className={cn('w-full', isCollapsed && 'px-0')}
          onClick={() => onNewSession('youtube')}
        >
          <Plus className="w-4 h-4" />
          {!isCollapsed && <span>New Design</span>}
        </Button>
      </div>

      {/* Navigation */}
      <div className="px-3 py-2">
        <button
          onClick={() => onViewChange('gallery')}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
            activeView === 'gallery'
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
          )}
        >
          <Image className="w-4 h-4" />
          {!isCollapsed && <span className="text-sm font-medium">All Images</span>}
        </button>
      </div>

      {/* Sessions List */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin">
          <p className="text-xs text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Recent Designs
          </p>
          <div className="space-y-1">
            {sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground px-3 py-4 text-center">
                No designs yet. Create your first one!
              </p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    'group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors',
                    activeSessionId === session.id && activeView === 'chat'
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )}
                  onClick={() => onSelectSession(session.id)}
                >
                  {/* Thumbnail Preview */}
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {session.thumbnail ? (
                      <img
                        src={session.thumbnail}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{session.title}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {getPlatformIcon(session.platform)}
                      <span className="capitalize">
                        {session.platform.replace('-', ' ')}
                      </span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted transition-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Theme Toggle */}
      {!isCollapsed && (
        <div className="px-3 py-2 border-t border-sidebar-border">
          <ThemeToggle variant="default" className="w-full justify-start" />
        </div>
      )}

      {/* User Profile */}
      <div className="p-3 border-t border-sidebar-border mt-auto">
        <button
          onClick={handleProfileClick}
          className={cn(
            'w-full flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors',
            isCollapsed && 'justify-center'
          )}
        >
          <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full gradient-primary flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          )}
        </button>
      </div>

      {/* Profile Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>My Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-muted">
                  {avatarPreview || user?.avatarUrl ? (
                    <img 
                      src={avatarPreview || user?.avatarUrl} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full gradient-primary flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary-foreground">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                {!avatarPreview && (
                  <label
                    htmlFor="avatar-upload"
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-primary-foreground" />
                  </label>
                )}
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="hidden"
                  disabled={isSavingAvatar}
                />
              </div>
              {avatarPreview && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    disabled={isSavingAvatar}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveAvatar}
                    disabled={isSavingAvatar}
                  >
                    {isSavingAvatar ? 'Saving...' : 'Save Avatar'}
                  </Button>
                </div>
              )}
            </div>

            {/* Name Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Name</label>
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder="Enter your name"
                    className="flex-1"
                    disabled={isSaving}
                  />
                  <Button size="icon" variant="ghost" onClick={handleCancelEdit} disabled={isSaving}>
                    <X className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="default" onClick={handleSaveName} disabled={isSaving}>
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Email Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
};

export default DashboardSidebar;
