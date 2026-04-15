import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Send, Plus, Image, RefreshCw, Palette, Pencil, Download, Youtube, Instagram } from 'lucide-react';
import type { DesignSession, Message } from '@/pages/Dashboard';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ChatAreaProps {
  session: DesignSession | undefined;
  onUpdateSession: (updates: Partial<DesignSession>) => void;
  onCreateSession: (platform?: string) => void;
  onEditImage: (url: string) => void;
}

const ChatArea = ({ session, onUpdateSession, onCreateSession, onEditImage }: ChatAreaProps) => {
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'youtube' | 'instagram-post' | 'instagram-reel'>('youtube');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const API_BASE_URL = 'http://localhost:4001/api/v1';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  // Temporarily disable message fetching to focus on AI generation
  // useEffect(() => {
  //   if (session?.id) {
  //     fetchMessages(session.id);
  //   }
  // }, [session?.id]);

  const fetchMessages = async (sessionId: string) => {
    try {
      setLoadingMessages(true);
      const token = localStorage.getItem('thumbly_access_token');
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const backendMessages = data.data.messages || [];
        const mappedMessages: Message[] = backendMessages.map((msg: any) => ({
          id: msg._id,
          role: msg.role,
          content: msg.content,
          image: msg.imageAssetId,
          platform: msg.metadata?.platform,
        }));
        onUpdateSession({ messages: mappedMessages });
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    // Detect platform from prompt
    const lowerInput = input.toLowerCase();
    let platform: 'youtube' | 'instagram-post' | 'instagram-reel' = 'youtube';
    if (lowerInput.includes('instagram') || lowerInput.includes('ig')) {
      platform = lowerInput.includes('reel') ? 'instagram-reel' : 'instagram-post';
    }

    const newMessages = [...(session?.messages || []), userMessage];
    
    // Update title based on first message
    const title = session?.messages.length === 0 
      ? input.slice(0, 40) + (input.length > 40 ? '...' : '')
      : session?.title || 'New Design';

    onUpdateSession({ 
      messages: newMessages, 
      title,
      platform 
    });
    setInput('');
    setIsGenerating(true);

    try {
      // Call real AI generation API
      const token = localStorage.getItem('thumbly_access_token');
      const requestBody = {
        sessionId: session?.id,
        prompt: input,
        platform
      };
      console.log('Session object:', session);
      console.log('Session ID:', session?.id);
      console.log('Sending AI generation request:', requestBody);
      
      if (!session?.id) {
        throw new Error('Session ID is undefined');
      }
      
      const response = await fetch(`${API_BASE_URL}/ai/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('AI generation response:', data);
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Generated ${platform.replace('-', ' ')} thumbnail based on: "${input}"`,
          platform,
          image: data.data.asset.url,
        };

        onUpdateSession({
          messages: [...newMessages, aiMessage],
          thumbnail: aiMessage.image,
        });
      } else {
        const errorData = await response.json();
        console.error('AI generation failed:', errorData);
        const errorMessage = errorData.error?.message || errorData.message || 'Unknown error';
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Failed to generate image: ${errorMessage}`,
          platform,
        };
        onUpdateSession({
          messages: [...newMessages, aiMessage],
        });
      }
    } catch (error) {
      console.error('AI generation error:', error);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Failed to generate image: Network error`,
        platform,
      };
      onUpdateSession({
        messages: [...newMessages, aiMessage],
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const getPlatformBadge = (platform?: string) => {
    if (!platform) return null;
    
    const configs = {
      'youtube': { icon: Youtube, label: 'YouTube', color: 'bg-red-500/20 text-red-400' },
      'instagram-post': { icon: Instagram, label: 'Instagram Post', color: 'bg-pink-500/20 text-pink-400' },
      'instagram-reel': { icon: Instagram, label: 'Instagram Reel', color: 'bg-purple-500/20 text-purple-400' },
    };
    
    const config = configs[platform as keyof typeof configs];
    if (!config) return null;

    return (
      <div className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', config.color)}>
        <config.icon className="w-3 h-3" />
        {config.label}
      </div>
    );
  };

  // Empty state
  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 md:w-20 md:h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 glow-combined">
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">
            Start Creating with AI
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
            Describe the thumbnail or Instagram cover you want to create, and let AI do the rest.
          </p>

          {/* Platform Selector */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-2 block">Select Platform</label>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedPlatform('youtube')}
                className={`flex-1 p-3 rounded-lg border transition-colors ${
                  selectedPlatform === 'youtube'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:bg-muted'
                }`}
              >
                <Youtube className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">YouTube</span>
              </button>
              <button
                onClick={() => setSelectedPlatform('instagram-post')}
                className={`flex-1 p-3 rounded-lg border transition-colors ${
                  selectedPlatform === 'instagram-post'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:bg-muted'
                }`}
              >
                <Instagram className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">Post</span>
              </button>
              <button
                onClick={() => setSelectedPlatform('instagram-reel')}
                className={`flex-1 p-3 rounded-lg border transition-colors ${
                  selectedPlatform === 'instagram-reel'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:bg-muted'
                }`}
              >
                <Instagram className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">Reel Cover</span>
              </button>
            </div>
          </div>

          <Button variant="gradient" size="lg" onClick={() => onCreateSession(selectedPlatform)}>
            <Plus className="w-5 h-5" />
            New Design
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 scrollbar-thin">
        <AnimatePresence>
          {session.messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex gap-2 md:gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-7 h-7 md:w-8 md:h-8 gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-primary-foreground" />
                </div>
              )}

              <div
                className={cn(
                  'max-w-[85%] md:max-w-[70%] lg:max-w-[60%]',
                  message.role === 'user' && 'order-1'
                )}
              >
                <div
                  className={cn(
                    'rounded-2xl px-3 py-2 md:px-4 md:py-3',
                    message.role === 'user'
                      ? 'bg-primary/20 rounded-br-sm'
                      : 'bg-muted rounded-bl-sm'
                  )}
                >
                  <p className="text-sm text-foreground">{message.content}</p>
                </div>

                {/* Generated Image */}
                {message.image && (
                  <div className="mt-2 md:mt-3 space-y-2 md:space-y-3">
                    {getPlatformBadge(message.platform)}
                    
                    <div className="relative group rounded-xl overflow-hidden border border-border">
                      <img
                        src={message.image}
                        alt="Generated thumbnail"
                        className="w-full aspect-video object-cover"
                      />
                      
                      {/* Actions Overlay */}
                      <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 md:gap-2 flex-wrap p-2">
                        <Button size="sm" variant="secondary" className="text-xs md:text-sm">
                          <RefreshCw className="w-3 h-3 md:w-4 md:h-4" />
                          <span className="hidden sm:inline ml-1">Regenerate</span>
                        </Button>
                        <Button size="sm" variant="secondary" className="text-xs md:text-sm">
                          <Palette className="w-3 h-3 md:w-4 md:h-4" />
                          <span className="hidden sm:inline ml-1">Variations</span>
                        </Button>
                        <Button size="sm" variant="secondary" className="text-xs md:text-sm" onClick={() => onEditImage(message.image!)}>
                          <Pencil className="w-3 h-3 md:w-4 md:h-4" />
                          <span className="hidden sm:inline ml-1">Edit</span>
                        </Button>
                        <Button size="sm" variant="gradient" className="text-xs md:text-sm">
                          <Download className="w-3 h-3 md:w-4 md:h-4" />
                          <span className="hidden sm:inline ml-1">Download</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Generating State */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 md:gap-3"
          >
            <div className="w-7 h-7 md:w-8 md:h-8 gradient-primary rounded-lg flex items-center justify-center flex-shrink-0 animate-pulse">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-primary-foreground" />
            </div>
            <div className="bg-muted rounded-2xl rounded-bl-sm px-3 py-2 md:px-4 md:py-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-sm text-muted-foreground">Generating your design...</span>
              </div>
              <div className="mt-3 w-48 md:w-64 aspect-video bg-muted-foreground/10 rounded-lg animate-shimmer" />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 md:p-4 border-t border-border">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the thumbnail or Instagram cover you want..."
            rows={1}
            className="w-full resize-none bg-muted/50 border border-border rounded-xl px-3 py-2.5 md:px-4 md:py-3 pr-12 text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <Button
            type="submit"
            size="icon"
            variant="gradient"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 md:w-9 md:h-9"
            disabled={!input.trim() || isGenerating}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatArea;
