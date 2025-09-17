---
description: Repository Information Overview
alwaysApply: true
---

# Romantic Birthday Experience App Information

## Summary
A cinematic, interactive birthday experience built with React that creates magical moments for loved ones. The app allows users to create personalized birthday experiences with images, messages, and animations, all shareable via URL without requiring a backend.

## Structure
- **src/**: Main source code directory containing React components and utilities
  - **components/**: React components for different parts of the application
  - **assets/**: Static assets like images and audio files
  - **utils/**: Utility functions for compression and encoding
- **public/**: Static files served directly by the web server
- **config files**: Various configuration files for TypeScript, Vite, ESLint, etc.

## Language & Runtime
**Language**: TypeScript/JavaScript
**Version**: TypeScript 5.5.3, ES2020 target
**Build System**: Vite 5.4.2
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- React 18.3.1
- React Router 7.8.2
- Framer Motion 12.23.12
- LZ-String 1.5.0 (for compression)
- Tailwind CSS 3.4.1
- Lucide React 0.344.0
- React Icons 5.5.0

**Development Dependencies**:
- TypeScript 5.5.3
- ESLint 9.9.1
- Vite 5.4.2
- @vitejs/plugin-react 4.3.1
- PostCSS 8.4.35
- Autoprefixer 10.4.18

## Build & Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Main Files & Resources
**Entry Points**:
- `src/main.tsx`: Application entry point
- `src/App.tsx`: Main component with routing setup

**Key Components**:
- `CreateForm.tsx`: Form for creating birthday experiences
- `ViewPage.tsx`: Main recipient experience page
- `IntroSlideshow.tsx`: Romantic intro animation
- `BirthdaySequence.tsx`: Interactive birthday experience
- `Particles.tsx`: Floating hearts and sparkles
- `Confetti.tsx`: Celebration confetti effect

**Utility Functions**:
- `compression.ts`: Image compression and URL encoding

## Technical Features
- **Client-side image compression** using HTML5 Canvas
- **LZ-String compression** to reduce URL length
- **Audio autoplay handling** with fallback for browser restrictions
- **Responsive design** with mobile-first approach
- **Particle effects** and confetti animations
- **URL-based data storage** - all content encoded in shareable links
- **No backend required** - everything runs client-side