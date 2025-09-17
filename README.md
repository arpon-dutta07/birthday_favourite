# Romantic Birthday Experience App 💕

A cinematic, interactive birthday experience built with React that creates magical moments for your loved ones.

## Features ✨

- **Creator Form**: Upload up to 10 images, add personal messages, and optional background music
- **Automatic Image Compression**: Client-side image resizing to keep URLs manageable
- **Romantic Intro Animation**: 20-30 second slideshow with floating hearts and particles
- **Interactive Birthday Sequence**: Dark screen → greeting → light bulb → room reveal → decorations → cake → candle blowing → message scroll
- **URL-Based Sharing**: No backend required - everything encoded in a shareable link
- **Mobile Responsive**: Optimized for touch interactions and mobile devices
- **Smooth Animations**: Powered by Framer Motion for cinematic transitions

## How It Works 🎭

### For Creators:
1. Fill out the form with recipient's name, age, and personal message
2. Upload up to 10 images for the romantic intro slideshow
3. Optionally add background music
4. Click "Generate Magical Link" to get a shareable URL
5. Share the link with your special someone

### For Recipients:
1. Open the shared link
2. Experience the **Romantic Intro Animation** (20-30s) featuring uploaded images
3. See the overlay message: "Don't get lost in this romantic vibe... 💫"
4. Tap to reveal the **Birthday Sequence**:
   - Dark screen with personalized greeting
   - Interactive light bulb to "turn on the lights"
   - Room reveal using uploaded images
   - Decorations with balloons and streamers
   - Birthday cake with animated candles
   - Blow out the candles
   - Personal message scroll with confetti

## Technical Implementation 🛠️

### Stack:
- **React** with Vite
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **LZ-String** for payload compression
- **React Router** for navigation

### Key Features:
- **Client-side image compression** using HTML5 Canvas
- **LZ-String compression** to reduce URL length
- **Audio autoplay handling** with fallback for browser restrictions
- **Responsive design** with mobile-first approach
- **Particle effects** and confetti animations

## Installation & Setup 🚀

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Important Notes ⚠️

### Image Size Warnings:
- Images are automatically compressed to max 1200px and JPEG quality 0.8
- Large images create very long URLs that may not work in all browsers
- Recommended: Keep total payload under 32KB for best compatibility

### Audio Considerations:
- Browsers often block autoplay with sound
- Audio will attempt to play after user interaction (tapping)
- Large audio files significantly increase URL length

### Privacy & Security:
- All data (images, messages, audio) is encoded directly in the URL
- Anyone with the link can view the complete birthday surprise
- No server storage - everything is client-side
- Share links responsibly and keep them private until the big moment

### Browser Compatibility:
- Modern browsers recommended (Chrome, Firefox, Safari, Edge)
- Mobile browsers supported with touch interactions
- Some older browsers may have issues with very long URLs

## Usage Tips 💡

### For Best Results:
- Use high-quality but reasonably sized images (under 2MB each)
- Test the preview before sharing
- Ensure recipient has audio enabled for full experience
- Share link at the perfect moment for maximum impact

### Troubleshooting:
- If URL is too long, try reducing image count or using smaller images
- If audio doesn't play, recipient needs to tap/interact first
- For very long URLs, consider hosting images externally and using shorter references

## File Structure 📁

```
src/
├── components/
│   ├── CreateForm.tsx      # Main form for creating experiences
│   ├── ShareLinkModal.tsx  # Modal showing generated link
│   ├── ViewPage.tsx        # Main recipient experience page
│   ├── IntroSlideshow.tsx  # Romantic intro animation
│   ├── BirthdaySequence.tsx # Interactive birthday experience
│   ├── Particles.tsx       # Floating hearts and sparkles
│   └── Confetti.tsx        # Celebration confetti effect
├── utils/
│   └── compression.ts      # Image compression and URL encoding
├── App.tsx                 # Main app component with routing
├── App.css                 # Custom styles and animations
└── main.tsx               # App entry point
```

## Customization 🎨

The app uses a romantic color palette with:
- Deep purples and pinks for backgrounds
- Gold accents for special elements
- Soft white text for readability
- Gradient effects for premium feel

Animation timings and effects can be customized in the component files and CSS.

## Contributing 🤝

Feel free to submit issues, feature requests, or pull requests to improve this magical experience!

## License 📄

MIT License - feel free to use this for creating magical moments! 💖