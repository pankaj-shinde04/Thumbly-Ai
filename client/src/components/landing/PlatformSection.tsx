import { motion } from 'framer-motion';
import { Youtube, Instagram, Image } from 'lucide-react';

const PlatformSection = () => {
  const platforms = [
    {
      icon: Youtube,
      name: 'YouTube Thumbnail',
      description: 'Eye-catching thumbnails that boost CTR',
      size: '1280 × 720',
      color: 'from-red-500/20 to-red-600/20',
      iconColor: 'text-red-500',
    },
    {
      icon: Instagram,
      name: 'Instagram Post',
      description: 'Scroll-stopping square posts',
      size: '1080 × 1080',
      color: 'from-pink-500/20 to-purple-500/20',
      iconColor: 'text-pink-500',
    },
    {
      icon: Image,
      name: 'Instagram Reel Cover',
      description: 'Vertical covers that pop',
      size: '1080 × 1920',
      color: 'from-purple-500/20 to-indigo-500/20',
      iconColor: 'text-purple-500',
    },
  ];

  return (
    <section className="py-24" id="features">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Design for <span className="gradient-text">Every Platform</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Create perfectly sized graphics for all your favorite platforms
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {platforms.map((platform, index) => (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <platform.icon className={`w-8 h-8 ${platform.iconColor}`} />
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {platform.name}
                </h3>
                <p className="text-muted-foreground mb-4">{platform.description}</p>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                    {platform.size}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformSection;
