import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { X, Move, Type, Palette, Smile, Download, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface ImageEditorProps {
  imageUrl: string;
  onClose: () => void;
  onSave: (editedUrl: string) => void;
}

const ImageEditor = ({ imageUrl, onClose, onSave }: ImageEditorProps) => {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState([32]);
  const [textColor, setTextColor] = useState('#ffffff');

  const fonts = [
    { name: 'Inter', value: 'Inter' },
    { name: 'Arial Black', value: 'Arial Black' },
    { name: 'Georgia', value: 'Georgia' },
    { name: 'Comic Sans', value: 'Comic Sans MS' },
  ];

  const [selectedFont, setSelectedFont] = useState(fonts[0].value);

  const colors = [
    '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff',
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg md:text-xl font-semibold text-foreground">Edit Image</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} className="hidden sm:flex">
            Cancel
          </Button>
          <Button variant="gradient" size="sm" onClick={() => onSave(imageUrl)}>
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Save & Download</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-muted/20 min-h-[200px] md:min-h-0">
          <div className="relative max-w-3xl w-full">
            <img
              src={imageUrl}
              alt="Editing"
              className="w-full rounded-lg shadow-2xl"
            />
            {/* Text Overlay Preview */}
            {text && (
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center cursor-move select-none"
                style={{
                  fontFamily: selectedFont,
                  fontSize: `${fontSize[0]}px`,
                  color: textColor,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                }}
              >
                {text}
              </div>
            )}
          </div>
        </div>

        {/* Controls Panel */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-border p-4 md:p-6 space-y-6 overflow-y-auto scrollbar-thin max-h-[50vh] md:max-h-full">
          {/* Text Tool */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <Type className="w-4 h-4" />
              Add Text
            </div>
            
            <div className="space-y-2">
              <Label>Text Content</Label>
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text..."
                className="bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <Label>Font</Label>
              <div className="grid grid-cols-2 gap-2">
                {fonts.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => setSelectedFont(font.value)}
                    className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                      selectedFont === font.value
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border bg-muted/50 text-muted-foreground hover:text-foreground'
                    }`}
                    style={{ fontFamily: font.value }}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Font Size: {fontSize[0]}px</Label>
              <Slider
                value={fontSize}
                onValueChange={setFontSize}
                min={12}
                max={120}
                step={1}
              />
            </div>
          </div>

          {/* Color Tool */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <Palette className="w-4 h-4" />
              Text Color
            </div>
            
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setTextColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    textColor === color ? 'border-primary scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Move Tool */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <Move className="w-4 h-4" />
              Position
            </div>
            <p className="text-sm text-muted-foreground">
              Drag the text on the canvas to reposition it.
            </p>
          </div>

          {/* Emoji Tool */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <Smile className="w-4 h-4" />
              Add Emoji
            </div>
            <div className="flex flex-wrap gap-2">
              {['🔥', '💰', '🚀', '⭐', '💡', '🎯', '💪', '🎉'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setText(text + emoji)}
                  className="w-10 h-10 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-xl"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Reset */}
          <Button variant="outline" className="w-full" onClick={() => { setText(''); setFontSize([32]); }}>
            <RotateCcw className="w-4 h-4" />
            Reset All
          </Button>
        </div>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
      >
        <X className="w-6 h-6 text-muted-foreground" />
      </button>
    </motion.div>
  );
};

export default ImageEditor;
