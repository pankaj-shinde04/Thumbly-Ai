import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const CTASection = () => {
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
    <section className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-hero-pattern opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Start creating today</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Create{' '}
            <span className="gradient-text">Stunning Thumbnails?</span>
          </h2>

          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of creators who are already using Thumbly AI to create 
            scroll-stopping visuals for their content.
          </p>

          <Button variant="hero" size="xl" onClick={handleGetStarted}>
            Try Thumbly AI Free
            <ArrowRight className="w-5 h-5 ml-1" />
          </Button>

          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • Generate 5 thumbnails free
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
