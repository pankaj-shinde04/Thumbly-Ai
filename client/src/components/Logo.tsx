import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo = ({ size = 'md', showText = true }: LogoProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <Link to="/" className="flex items-center gap-2 group">
      <div className={`${sizeClasses[size]} gradient-primary rounded-lg flex items-center justify-center group-hover:glow-primary transition-all duration-300`}>
        <Sparkles className="w-1/2 h-1/2 text-primary-foreground" />
      </div>
      {showText && (
        <span className={`${textClasses[size]} font-bold text-foreground`}>
          Thumbly <span className="gradient-text">AI</span>
        </span>
      )}
    </Link>
  );
};

export default Logo;
