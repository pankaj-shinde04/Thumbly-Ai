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
import type { DesignSession } from '@/pages/Dashboard';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface DashboardSidebarProps {
  sessions: DesignSession[];
  activeSessionId: string | null;
  activeView: 'chat' | 'gallery';
  collapsed: boolean;
  onNewSession: () => void;
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
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
          onClick={onNewSession}
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'w-full flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors',
                isCollapsed && 'justify-center'
              )}
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className="gradient-primary text-primary-foreground text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
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
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2">
              <p className="font-medium text-foreground">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem key="profile">My Profile</DropdownMenuItem>
            <DropdownMenuItem key="credits">Usage & Credits</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem key="logout" onClick={handleLogout} className="text-destructive">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
