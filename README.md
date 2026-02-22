# Synapto: Inclusive Education Platform

## 🌟 Overview

Synapto is an AI-powered educational platform designed to make learning truly accessible for students with disabilities. Using advanced AI, 3D avatars, and accessibility features, Synapto removes barriers to education for:

- **Deaf students** - Sign Language avatar translates content to ASL
- **Blind/visually impaired students** - Audio narratives describe visual content
- **Neurodivergent students** - Focus mode reduces cognitive load
- **Students with reading differences** - Language Leveler simplifies complex text

## ✨ Core Features

### 1. Sign Language Avatar 🤟
- Real-time 3D avatar translates educational content to American Sign Language
- Built with React Three Fiber for smooth, performant rendering
- Enables Deaf learners to access content in their native language

### 2. Audio Narratives 🎵
- AI-generated audio descriptions for images, diagrams, and visual content
- Key point extraction for concise summaries
- Helps blind and low-vision students understand visual elements

### 3. Language Leveler 📚
- Automatically simplifies complex academic text
- Three reading levels: Basic, Intermediate, Advanced
- Powered by Groq API (fast) with local fallback
- Preserves meaning while reducing cognitive load

### 4. Focus Mode 🎯
- Customizable distraction-free interface
- Options:
  - Hide images, ads, and sidebars
  - Increase line height and font size
  - Enhance contrast
  - Dyslexia-friendly fonts
- Perfect for neurodivergent learners with ADHD, autism, or processing disorders

### 5. YouTube Integration 🎥
- Directly paste YouTube URLs to add content
- Automatic transcript extraction
- Process and simplify in one place
- Works with educational videos, lectures, tutorials

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 16, React 19, Tailwind CSS v4
- **Backend**: Node.js API routes, Supabase PostgreSQL
- **AI Services**: Groq (text), OpenAI (audio), Web Speech API
- **3D Graphics**: React Three Fiber, Three.js
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Hosting**: Vercel (serverless)

### Database Schema
```
profiles          - User preferences and accessibility settings
content           - Uploaded YouTube videos and educational materials
saved_content     - User's saved/favorited items
sign_language_library - ASL sign vocabulary and translations
user_interactions - Learning analytics and engagement tracking
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- Supabase account (free tier works)
- (Optional) OpenAI/Groq API keys for enhanced AI features

### Installation

1. **Clone and install:**
```bash
git clone <repository-url>
cd synapto
npm install
```

2. **Set up environment variables:**
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
GROQ_API_KEY=your_groq_key          # Optional
OPENAI_API_KEY=your_openai_key      # Optional
```

3. **Run development server:**
```bash
npm run dev
```

4. **Open in browser:**
Navigate to `http://localhost:3000`

## 📖 Usage Guide

### Adding Educational Content
1. Click "Add Content" on dashboard
2. Paste YouTube URL
3. System automatically extracts transcript
4. View processed content with all features

### Using Language Leveler
1. Open any content
2. Click "Leveler" tab
3. Select reading level (Basic/Intermediate/Advanced)
4. Click "Simplify Text"
5. Compare original vs. simplified

### Enabling Audio Narrative
1. Open content
2. Click "Audio" tab
3. Click "Generate Audio"
4. Play audio description

### Sign Language Avatar
1. Open content
2. Click "Sign Language" tab
3. Avatar displays ASL translation
4. Click "Play" for animation

### Customizing Accessibility
1. Go to Preferences
2. Adjust:
   - Text size (small → extra-large)
   - Contrast and color modes
   - Font options (dyslexia-friendly)
   - Focus mode settings

## ♿ Accessibility Features

### WCAG 2.2 AA Compliant
- ✅ 4.5:1 contrast ratio (AAA on some elements)
- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Screen reader optimized (ARIA labels)
- ✅ Focus indicators visible on all interactive elements
- ✅ Color not sole means of conveying information
- ✅ Text alternatives for all images
- ✅ Captions available (via YouTube)

### Designed for Diverse Users
- **Deaf/Hard of Hearing**: Sign Language avatar, captions
- **Blind/Low Vision**: Audio descriptions, screen reader support, dyslexia-friendly fonts
- **Neurodivergent**: Focus mode, customizable spacing, reduced animations
- **Learning Differences**: Language Leveler, audio narration, visual organization

## 📊 Project Statistics

- **Lines of Code**: ~3,500+
- **Components**: 15+
- **API Routes**: 5+
- **Accessibility Features**: 20+
- **Browser Support**: Chrome, Firefox, Safari, Edge (all modern versions)
- **Mobile**: Fully responsive (iOS, Android)

## 🔧 API Endpoints

### Content Management
```
POST /api/content/add
  - Add new YouTube content
  - Body: { title, description, youtube_url, transcript }
```

### AI Features
```
POST /api/ai/simplify-text
  - Simplify text to reading level
  - Body: { text, level }

POST /api/ai/generate-audio
  - Generate audio description
  - Body: { text }
```

## 🎯 Hackathon Judging

### What Makes Synapto Stand Out
1. **Comprehensive Accessibility** - Addresses 4 different disability groups
2. **Production-Ready Code** - Clean architecture, proper error handling
3. **Beautiful UI** - Modern design that works for all users
4. **AI Integration** - Uses multiple AI services effectively
5. **Inclusive Thinking** - Built FOR disabled people, not about them

### Demo Flow for Judges
1. **Sign up** (2 min)
   - Test authentication with email/password
   - Show instant profile creation

2. **Add Content** (2 min)
   - Paste educational YouTube URL
   - Show transcript extraction

3. **Try Features** (8 min)
   - **Language Leveler**: Simplify to "Basic" - show dramatic difference
   - **Audio Narrative**: Generate and play audio description
   - **Focus Mode**: Toggle on/off, show CSS changes
   - **Sign Language**: Explain avatar translation
   - **Preferences**: Show accessibility customizations

4. **Accessibility Check** (2 min)
   - Navigate keyboard-only (Tab, Enter)
   - Show color contrast
   - Mention WCAG 2.2 AA compliance

## 🌍 Impact

### Who Benefits
- **~1.3 billion people** globally with disabilities
- **61 million students** with disabilities in education globally
- **Every inclusive classroom** - neurotypical students benefit from accessibility features

### Real-World Use Cases
- University lectures accessible to Deaf and hard of hearing students
- K-12 educational content for students with learning differences
- Professional training accessible to employees with disabilities
- Self-paced learning for neurodivergent learners

## 🔮 Future Enhancements

### Planned Features
- Real-time live captions
- Video auto-generation of sign language
- Advanced analytics dashboard
- Peer-to-peer content sharing
- Collaborative note-taking
- Integration with learning management systems (Canvas, Blackboard)
- Multi-language support
- Mobile app (React Native)

### Scaling
- Database optimization for millions of videos
- CDN integration for video delivery
- ML model training for better simplification
- Community contributions of ASL signs

## 📝 License

MIT - See LICENSE file for details

## 👥 Contributors

Built by the Synapto team for inclusive education.

## 🙏 Acknowledgments

- Inspired by feedback from disability rights advocates
- Uses best practices from WebAIM and The A11Y Project
- Built with shadcn/ui and Vercel's excellent tools

---

**Made with ❤️ for accessible education**

*Synapto - Making Education Accessible for Everyone*

Built for the 2026 Inclusive Tech Hackathon
