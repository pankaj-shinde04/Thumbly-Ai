import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Play, Sparkles, Image, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const HeroSection = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-hero-pattern" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse-slow" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">AI-Powered Design</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Create Scroll-Stopping{' '}
              <span className="gradient-text">Thumbnails</span> &{' '}
              <span className="gradient-text">Instagram Covers</span> with AI
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl">
              No design skills required. Just describe your idea — AI does the rest. 
              Generate stunning visuals for YouTube, Instagram, and more in seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" onClick={handleGetStarted}>
                Generate for Free
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
              <Button variant="hero-secondary" size="xl">
                <Play className="w-5 h-5" />
                View Examples
              </Button>
            </div>

            <div className="flex items-center gap-6 mt-8">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-muted border-2 border-background"
                    style={{
                      background: `linear-gradient(135deg, hsl(${220 + i * 20}, 70%, 50%), hsl(${240 + i * 20}, 70%, 40%))`,
                    }}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-semibold">10,000+</span> creators already using Thumbly AI
              </p>
            </div>
          </motion.div>

          {/* Right Side - Demo Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative gradient-border p-1 rounded-2xl glow-combined">
              <div className="bg-card rounded-xl p-4 space-y-4">
                {/* Chat Preview Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="font-semibold text-foreground">Thumbly AI</span>
                </div>

                {/* Chat Messages */}
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <div className="bg-primary/20 rounded-xl rounded-br-sm px-4 py-2 max-w-[80%]">
                      <p className="text-sm text-foreground">Create a thumbnail for my finance video about crypto investments</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 gradient-primary rounded-md flex-shrink-0 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-primary-foreground" />
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">Generating your thumbnail...</p>
                      
                      {/* Thumbnail Preview */}
                      <div className="relative rounded-lg overflow-hidden bg-muted aspect-video animate-pulse">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <Image className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                              Generating...
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input Preview */}
                <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-4 py-3">
                  <input
                    type="text"
                    placeholder="Describe your thumbnail..."
                    className="flex-1 bg-transparent text-sm text-muted-foreground outline-none"
                    readOnly
                  />
                  <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 animate-float">
              <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-xs font-medium text-foreground">AI Ready</span>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 animate-float" style={{ animationDelay: '1s' }}>
              <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span className="text-xs font-medium text-foreground">HD Export</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
