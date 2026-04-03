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
            },
            {
              before: 'Simple description',
              after: 'Eye-catching Instagram post',
              prompt: '"Minimalist coffee aesthetic"',
            },
            {
              before: 'Basic idea',
              after: 'Professional reel cover',
              prompt: '"Podcast episode highlight"',
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
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(135deg, hsl(${220 + index * 30}, 70%, 30%), hsl(${250 + index * 30}, 60%, 20%))`,
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-2xl font-bold text-foreground">Preview {index + 1}</span>
                        <p className="text-sm text-muted-foreground mt-2">AI Generated</p>
                      </div>
                    </div>
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
