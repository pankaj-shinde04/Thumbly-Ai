import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import ChatArea from '@/components/dashboard/ChatArea';
import ImageGallery from '@/components/dashboard/ImageGallery';
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
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeView, setActiveView] = useState<'chat' | 'gallery'>('chat');
  const [sessions, setSessions] = useState<DesignSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:4001/api/v1';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchSessions();
  }, [isAuthenticated, navigate]);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('thumbly_access_token');
      const response = await fetch(`${API_BASE_URL}/sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const backendSessions = data.data.sessions || [];
        const mappedSessions: DesignSession[] = backendSessions.map((session: any) => ({
          id: session.id,
          title: session.title,
          messages: [],
          platform: session.platform || 'youtube',
          thumbnail: session.thumbnailAssetId,
          createdAt: new Date(session.createdAt)
        }));
        setSessions(mappedSessions);
        if (mappedSessions.length > 0 && !activeSessionId) {
          setActiveSessionId(mappedSessions[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = async (platform: string = 'youtube') => {
    try {
      const token = localStorage.getItem('thumbly_access_token');
      console.log('Creating session...');
      const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'New Design',
          platform
        })
      });

      console.log('Session creation response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Session creation response data:', data);
        const newSession: DesignSession = {
          id: data.data.session.id,
          title: data.data.session.title,
          messages: [],
          platform: data.data.session.platform || 'youtube',
          createdAt: new Date(data.data.session.createdAt)
        };
        console.log('Created new session with ID:', newSession.id);
        setSessions([newSession, ...sessions]);
        setActiveSessionId(newSession.id);
        setActiveView('chat');
        setMobileMenuOpen(false);
      } else {
        console.error('Failed to create session:', await response.json());
      }
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const updateSession = (sessionId: string, updates: Partial<DesignSession>) => {
    setSessions(
      sessions.map((s) => (s.id === sessionId ? { ...s, ...updates } : s))
    );
  };

  const deleteSession = async (sessionId: string) => {
    // Don't delete if session ID is invalid
    if (!sessionId || sessionId === 'undefined' || sessionId.length !== 24) {
      // Just remove from local state without logging error
      setSessions(sessions.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(sessions[0]?.id || null);
      }
      return;
    }

    try {
      const token = localStorage.getItem('thumbly_access_token');
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSessions(sessions.filter((s) => s.id !== sessionId));
        if (activeSessionId === sessionId) {
          setActiveSessionId(sessions[0]?.id || null);
        }
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
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
    </div>
  );
};

export default Dashboard;
