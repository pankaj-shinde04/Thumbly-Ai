import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import ChatArea from '@/components/dashboard/ChatArea';
import ImageGallery from '@/components/dashboard/ImageGallery';
import ImageEditor from '@/components/dashboard/ImageEditor';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  platform?: 'youtube' | 'instagram-post' | 'instagram-reel';
  isLoading?: boolean;
}

export interface DesignSession {
  id: string;
  title: string;
  messages: Message[];
  platform: 'youtube' | 'instagram-post' | 'instagram-reel';
  thumbnail?: string;
  createdAt: Date;
}

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeView, setActiveView] = useState<'chat' | 'gallery'>('chat');
  const [sessions, setSessions] = useState<DesignSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const createNewSession = () => {
    const newSession: DesignSession = {
      id: Date.now().toString(),
      title: 'New Design',
      messages: [],
      platform: 'youtube',
      createdAt: new Date(),
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
    setActiveView('chat');
    setMobileMenuOpen(false);
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const updateSession = (sessionId: string, updates: Partial<DesignSession>) => {
    setSessions(
      sessions.map((s) => (s.id === sessionId ? { ...s, ...updates } : s))
    );
  };

  const deleteSession = (sessionId: string) => {
    setSessions(sessions.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId(sessions[0]?.id || null);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const sidebarContent = (
    <DashboardSidebar
      sessions={sessions}
      activeSessionId={activeSessionId}
      activeView={activeView}
      collapsed={sidebarCollapsed}
      onNewSession={createNewSession}
      onSelectSession={(id) => {
        setActiveSessionId(id);
        setActiveView('chat');
        setMobileMenuOpen(false);
      }}
      onDeleteSession={deleteSession}
      onViewChange={(view) => {
        setActiveView(view);
        setMobileMenuOpen(false);
      }}
      onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      isMobile={isMobile}
    />
  );

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-40 h-14 bg-background border-b border-border flex items-center px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="ml-3 font-semibold text-foreground">Thumbly AI</span>
        </div>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && sidebarContent}

      {/* Mobile Sidebar Sheet */}
      {isMobile && (
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-72">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      )}

      <main className={`flex-1 flex flex-col overflow-hidden ${isMobile ? 'pt-14' : ''}`}>
        {activeView === 'chat' ? (
          <ChatArea
            session={activeSession}
            onUpdateSession={(updates) =>
              activeSession && updateSession(activeSession.id, updates)
            }
            onCreateSession={createNewSession}
            onEditImage={setEditingImage}
          />
        ) : (
          <ImageGallery
            sessions={sessions}
            onEditImage={setEditingImage}
            onSelectSession={(id) => {
              setActiveSessionId(id);
              setActiveView('chat');
            }}
          />
        )}
      </main>

      {editingImage && (
        <ImageEditor
          imageUrl={editingImage}
          onClose={() => setEditingImage(null)}
          onSave={(editedUrl) => {
            // Handle save
            setEditingImage(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
