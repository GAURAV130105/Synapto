# Synapto - Setup & Deployment Guide

## Overview

Synapto is an AI-powered inclusive education platform built for the 2026 Hackathon. It provides:

- **Sign Language Avatar**: 3D avatar translating content to American Sign Language (ASL)
- **Audio Narratives**: AI-generated audio descriptions for visual content
- **Language Leveler**: Simplifies complex text to match reading levels
- **Focus Mode**: Distraction-free interface for neurodivergent learners
- **YouTube Integration**: Direct integration with YouTube videos

## Getting Started

### 1. Environment Setup

Add these environment variables to your Vercel project (in the Vars section of the sidebar):

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

**Optional (AI Features):**
- `GROQ_API_KEY` - For faster text simplification (get from groq.com)
- `OPENAI_API_KEY` - For advanced audio and text processing (get from openai.com)
- `YOUTUBE_API_KEY` - For transcript extraction (get from console.cloud.google.com)

**Note**: The app works with mock data if AI keys aren't provided, perfect for demo purposes.

### 2. Database Setup

The database schema is automatically created using Supabase SQL migrations:

```sql
-- Tables created:
- profiles (user preferences and accessibility settings)
- content (YouTube videos and educational materials)
- saved_content (user's saved items)
- sign_language_library (ASL sign vocabulary)
- user_interactions (learning analytics)
```

Run the migration script:
```bash
# In Vercel project or local development
npm run setup:db
```

### 3. Install & Run Locally

```bash
# Clone the repository
git clone <your-repo>
cd synapto

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## Features Guide

### Authentication
- Email/password signup and login
- Auto-created user profile
- Password-protected dashboard

### Dashboard
- **Add Content**: Paste YouTube URLs to upload educational videos
- **Library**: View all saved content with thumbnails
- **Preferences**: Customize accessibility settings

### Content Viewer
The content page includes all accessibility features:

1. **Transcript Tab**
   - View the original video transcript
   - Full text of educational content

2. **Language Leveler Tab**
   - Simplify text to: Basic, Intermediate, or Advanced levels
   - Powered by Groq API (with fallback local processing)
   - Choose reading level and see simplified version

3. **Audio Narrative Tab**
   - Generates spoken description of content
   - Uses Web Speech API or OpenAI TTS
   - Play/pause controls

4. **Sign Language Avatar Tab**
   - 3D avatar displays ASL translation
   - Built with React Three Fiber
   - Real-time translation of selected text

### Focus Mode Widget
- Fixed bottom-right corner toggle
- Settings include:
  - Hide Images (remove visual distractions)
  - Hide Ads (block advertisements)
  - Hide Sidebars (remove related content)
  - Enhance Contrast (improve readability)
  - Increase Line Height (more vertical space)
  - Increase Font Size (larger text)

### Preferences Page
Customize:
- **Text Size**: Small, Normal, Large, Extra-Large
- **Color Mode**: High contrast, color blind modes
- **Fonts**: Dyslexia-friendly font option
- **Screen Reader**: Optimized for accessibility tools
- **Focus Mode**: Default distraction reduction

## API Routes

### Content Management
- `POST /api/content/add` - Add YouTube video to library
  - Body: `{ title, description, youtube_url, transcript }`

### AI Features
- `POST /api/ai/simplify-text` - Simplify text to reading level
  - Body: `{ text, level: 'basic'|'intermediate'|'advanced' }`
  
- `POST /api/ai/generate-audio` - Generate audio description
  - Body: `{ text }`

## Accessibility Standards

Synapto meets **WCAG 2.2 AA** compliance:
- ✅ 4.5:1 contrast ratio on all text
- ✅ Keyboard navigation throughout
- ✅ Screen reader optimized with ARIA labels
- ✅ Dyslexia-friendly fonts available
- ✅ Adjustable text sizing (up to 200%)
- ✅ Color blind modes (Protanopia, Deuteranopia, Tritanopia)
- ✅ Focus indicators on all interactive elements
- ✅ Alt text on all images

## Deployment to Vercel

### 1. Push to GitHub
```bash
git add .
git commit -m "Initial Synapto deployment"
git push origin main
```

### 2. Deploy to Vercel
```bash
# Via Vercel CLI
npm i -g vercel
vercel

# Or via Vercel Dashboard:
# 1. Go to vercel.com
# 2. Click "New Project"
# 3. Select your GitHub repository
# 4. Add environment variables (from step 1)
# 5. Click "Deploy"
```

### 3. Post-Deployment
- Verify environment variables are set
- Run database migrations in Supabase dashboard
- Test authentication flow
- Test content upload with a sample YouTube URL

## Troubleshooting

### "Database connection failed"
- Check Supabase URL and ANON_KEY in environment variables
- Verify database tables exist (check Supabase SQL Editor)

### "AI API key not set"
- Features work with mock data if keys aren't provided
- Add keys in Vercel project settings under "Environment Variables"
- Redeploy after adding keys

### "Sign Language avatar not loading"
- Check browser console for Three.js errors
- Ensure WebGL is supported in your browser
- Falls back to text description if 3D fails

### "Audio generation failed"
- Verify OpenAI API key is set
- Check API quota and billing
- Use Web Speech API as fallback (no key needed)

## Project Structure

```
/app
  /api                    # API routes for AI and content
    /ai
      /simplify-text      # Text simplification API
      /generate-audio     # Audio generation API
    /content
      /add                # Content upload API
  /auth                   # Authentication pages
  /dashboard              # Main application
    /add-content          # YouTube upload page
    /content/[id]         # Content viewer with all features
    /library              # Content library
    /preferences          # Accessibility settings

/components
  /features               # Feature components
    /sign-language-avatar # 3D avatar component
    /audio-narrative      # Audio player & generator
    /language-leveler     # Text simplification UI
    /focus-mode           # Distraction-free toggle
  /ui                     # shadcn/ui components

/lib
  /supabase              # Supabase client & server
  /utils                 # Utility functions
    /youtube.ts          # YouTube URL parsing
    /text-processing.ts  # Text simplification & extraction
    /accessibility.ts    # Accessibility utilities
```

## Hackathon Submission

### For Judges:
1. **Live Demo**: Visit deployed Vercel URL
2. **Test Features**:
   - Sign up with test email
   - Add YouTube video (e.g., educational TED talk)
   - Try Language Leveler with "Basic" level
   - Toggle Focus Mode in bottom-right
   - View preferences for customization

3. **Accessibility Check**:
   - Test with screen reader (NVDA/JAWS)
   - Use keyboard-only navigation (Tab, Enter)
   - Check color contrast with WCAG tool
   - Toggle high contrast mode in preferences

### Key Selling Points:
- **Inclusive by Design**: Built for 4 disability groups (Deaf, Blind, Neurodivergent, Learning differences)
- **AI-Powered**: Uses Groq & OpenAI for intelligent text processing
- **YouTube Ready**: Direct integration with existing video platforms
- **Fully Accessible**: WCAG 2.2 AA compliant
- **Customizable**: Extensive preference options for all users

## Support

For issues during development:
- Check the troubleshooting section above
- Review console logs for error messages
- Verify all environment variables are set
- Test with a simple YouTube URL first (e.g., search "educational content")

---

**Built with:** Next.js 16 • React 19 • Supabase • Groq API • OpenAI • React Three Fiber
**Accessibility:** WCAG 2.2 AA • Section 508 • AODA
**Deployment:** Vercel • Serverless Functions
