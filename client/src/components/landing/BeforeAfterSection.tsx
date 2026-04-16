import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const BeforeAfterSection = () => {
  return (
    <section className="py-24 bg-card/50" id="examples">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Transform Your Content with{' '}
            <span className="gradient-text">AI Magic</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See how Thumbly AI transforms simple ideas into eye-catching thumbnails
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              before: 'Plain text prompt',
              after: 'Stunning YouTube thumbnail',
              prompt: '"Finance video about Bitcoin"',
              image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&h=450&fit=crop'
            },
            {
              before: 'Simple description',
              after: 'Eye-catching Instagram post',
              prompt: '"Minimalist coffee aesthetic"',
              image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=450&fit=crop'
            },
            {
              before: 'Basic idea',
              after: 'Professional reel cover',
              prompt: '"Podcast episode highlight"',
              image: 'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?w=800&h=450&fit=crop'
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="gradient-border rounded-2xl overflow-hidden"
            >
              <div className="bg-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                      {item.before}
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <div className="px-3 py-1 rounded-full gradient-primary text-xs font-medium text-primary-foreground">
                      {item.after}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Before - Prompt */}
                  <div className="bg-muted/50 rounded-lg px-4 py-3">
                    <p className="text-sm text-muted-foreground font-mono">{item.prompt}</p>
                  </div>

                  {/* After - Result */}
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted group">
                    <img 
                      src={item.image} 
                      alt={item.after}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BeforeAfterSection;
