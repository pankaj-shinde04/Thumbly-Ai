import { motion } from 'framer-motion';
import { MessageSquare, Sparkles, Download } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      icon: MessageSquare,
      step: '01',
      title: 'Describe Your Idea',
      description: 'Tell the AI what you want. Be specific about style, mood, and content.',
    },
    {
      icon: Sparkles,
      step: '02',
      title: 'AI Generates Design',
      description: 'Our AI creates multiple stunning options based on your description.',
    },
    {
      icon: Download,
      step: '03',
      title: 'Download & Post',
      description: 'Pick your favorite, make any edits, and download in HD quality.',
    },
  ];

  return (
    <section className="py-24 bg-card/50" id="how-it-works">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How <span className="gradient-text">It Works</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Create professional thumbnails in three simple steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary via-accent to-primary opacity-30" />

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative text-center"
            >
              {/* Step Number */}
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center relative z-10">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 gradient-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground z-20">
                  {step.step}
                </div>
              </div>

              <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
