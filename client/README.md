# Thumbly AI - Frontend

Frontend application for Thumbly AI - AI-powered thumbnail generator for content creators.

## Project Overview

Thumbly AI is a modern web application that helps content creators generate stunning thumbnails using artificial intelligence. The frontend provides an intuitive interface for users to create, manage, and customize AI-generated thumbnails for various platforms.

## Features

- 🎨 **AI Thumbnail Generation** - Generate thumbnails using advanced AI models
- 📱 **Multi-Platform Support** - Create thumbnails for YouTube, Instagram posts, and Instagram reels
- 💬 **Interactive Chat Interface** - Refine thumbnails through conversational AI
- 🖼️ **Asset Management** - Upload and manage images and design assets
- 📊 **Session History** - Track and manage all your design sessions
- 🌙 **Dark/Light Mode** - Beautiful UI with theme switching
- 🎯 **Real-time Preview** - See changes instantly as you work

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom plum/pink theme
- **UI Components**: shadcn/ui
- **State Management**: React Context API
- **HTTP Client**: React Query (TanStack Query)
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Fonts**: Inter font family

## Prerequisites

- Node.js 16+ 
- npm 8+

## Getting Started

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd thumbly-ai/client

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Run type checking
npm run type-check
```

## Project Structure

```
client/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # shadcn/ui components
│   │   └── common/        # Custom components
│   ├── pages/             # Page components
│   │   ├── Dashboard.tsx  # Main dashboard
│   │   ├── Login.tsx      # Authentication
│   │   └── ...
│   ├── contexts/          # React contexts
│   │   └── AuthContext.tsx
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utility functions
│   ├── styles/            # Global styles
│   │   └── index.css      # Tailwind + custom theme
│   └── types/             # TypeScript type definitions
├── package.json
├── tailwind.config.ts     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

## API Integration

The frontend connects to the Thumbly AI backend API:

- **Base URL**: `http://localhost:4000/api/v1` (development)
- **Authentication**: JWT Bearer tokens
- **Content-Type**: `application/json`

### Key Endpoints

- `POST /auth/login` - User authentication
- `POST /auth/signup` - User registration
- `GET /sessions` - Get user sessions
- `POST /sessions` - Create new design session
- `POST /ai/generate` - Generate AI thumbnails
- `POST /assets/upload` - Upload images

## Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_APP_NAME=Thumbly AI
VITE_APP_VERSION=1.0.0
```

## Theme Customization

The application uses a custom plum and pink color palette:

- **Primary**: Rich plum purple
- **Accent**: Soft pink/rose  
- **Backgrounds**: Off-white (light) and gray plum (dark)
- **Gradients**: Plum to pink flows
- **Glow Effects**: Custom purple and pink glows

Theme colors are defined in `src/styles/index.css` and `tailwind.config.ts`.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- 📧 Email: support@thumbly-ai.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/thumbly-ai/issues)
- 📖 Documentation: [Project Wiki](https://github.com/your-org/thumbly-ai/wiki)

---

Built with ❤️ for content creators everywhere
