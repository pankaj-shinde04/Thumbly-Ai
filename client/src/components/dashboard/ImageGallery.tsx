import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Image, Search, Download, Pencil, Youtube, Instagram, Calendar } from 'lucide-react';
import type { DesignSession } from '@/pages/Dashboard';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ImageGalleryProps {
  sessions: DesignSession[];
  onEditImage: (url: string) => void;
  onSelectSession: (id: string) => void;
}

const ImageGallery = ({ sessions, onEditImage, onSelectSession }: ImageGalleryProps) => {
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  // Get all images from sessions
  const allImages = sessions
    .filter((s) => s.thumbnail)
    .map((s) => ({
      id: s.id,
      url: s.thumbnail!,
      title: s.title,
      platform: s.platform,
      createdAt: s.createdAt,
    }));

  const filteredImages = allImages.filter((img) => {
    const matchesSearch = img.title.toLowerCase().includes(search.toLowerCase());
    const matchesPlatform = platformFilter === 'all' || img.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

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

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return 'bg-red-500/20 text-red-400';
      case 'instagram-post':
        return 'bg-pink-500/20 text-pink-400';
      case 'instagram-reel':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground mb-4">Image Gallery</h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search designs..."
              className="pl-10 bg-muted/50"
            />
          </div>
          
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-muted/50">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="instagram-post">Instagram Post</SelectItem>
              <SelectItem value="instagram-reel">Instagram Reel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
        {filteredImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mb-4">
              <Image className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No images yet</h3>
            <p className="text-muted-foreground max-w-sm">
              Start creating designs to build your gallery
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all"
              >
                <div
                  className="aspect-video cursor-pointer"
                  onClick={() => onSelectSession(image.id)}
                >
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => onEditImage(image.url)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="gradient">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-sm font-medium text-foreground truncate mb-2">
                    {image.title}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', getPlatformColor(image.platform))}>
                      {getPlatformIcon(image.platform)}
                      <span className="capitalize">{image.platform.replace('-', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(image.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGallery;
