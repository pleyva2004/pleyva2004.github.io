# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Setup

To develop and run this Next.js project, use one of these commands:
- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality checks

## Project Structure and Architecture

This is a Next.js 16 project with a modern React component structure using TypeScript. The site features:

### Core Components:
- **Chat Interface**: A real-time chat system using OpenAI's Realtime API with browser-based WebSocket connections
- **Research Dashboard**: Displays research papers and reading list with filtering capabilities
- **Timeline Component**: Shows professional timeline with experience details
- **Sidebar Navigation**: Dual sidebar (desktop and mobile) for quick access to key sections
- **Footer**: Multi-column footer with social links, ventures, research, and navigation

### Key Features:

1. **Real-time AI Chat**:
   - Uses OpenAI's GPT-4o Realtime API with **client-side WebSocket connections** (browser-based)
   - Architecture: Browser connects directly to OpenAI using ephemeral tokens from `/api/realtime`
   - Implements connection waiting logic (`waitForConnection`) that polls for WebSocket.OPEN state
   - Shows "Connecting..." indicator while waiting for connection (up to 5s timeout)
   - Tool execution handled server-side via `/api/tools` route (keeps API keys secure)
   - Supports both text and voice modes with customizable UI
   - Includes tool calling capabilities (availability checking via Cal.com, meeting booking)

2. **Research Section**:
   - Displays ongoing and completed research papers
   - Shows reading list with categorized items (favorites, currently reading, read)
   - Provides detailed sections for each paper including methodology, timeline, and references

3. **Footer**:
   - Four-column layout: Connect, Ventures, Deep Dive, Beyond the Resume
   - Connect section: GitHub, LinkedIn, Email links
   - Ventures section: Levrok Labs, Insights (blog)
   - Deep Dive section: Research page link
   - Beyond the Resume: Resume PDF link, About Me placeholder
   - Location display (NYC • SF)
   - Back-to-top button (appears after 300px scroll)

4. **Responsive Design**:
   - Mobile-first approach with responsive layouts
   - Uses Tailwind CSS for styling
   - Implements Framer Motion for smooth animations

### Technology Stack:
- Next.js 16 (App Router)
- TypeScript
- React 19
- Tailwind CSS
- Framer Motion
- OpenAI Realtime API (client-side WebSocket)
- Cal.com API integration (server-side)
- Markdown rendering with react-markdown

### Architecture Decisions:

**Realtime API Migration**:
- **Problem**: Vercel serverless functions don't support WebSockets (caused `TypeError: b.mask is not a function`)
- **Solution**: Moved WebSocket connection to browser, server only provides ephemeral tokens
- **Flow**:
  1. Browser requests token from `/api/realtime` (POST)
  2. Server returns ephemeral session token from OpenAI
  3. Browser connects directly to `wss://api.openai.com` using token
  4. Tool calls execute via `/api/tools` route (server-side for security)

**Connection Management**:
- `waitForConnection()` helper polls `wsRef.current?.readyState` every 100ms
- Resolves when `WebSocket.OPEN`, rejects after 5s timeout
- User messages wait for connection before sending

### Key Files and Directories:

- `src/app/api/realtime/route.ts` - Ephemeral token provider (no WebSocket handling)
- `src/app/api/tools/route.ts` - Server-side tool execution (Cal.com booking, availability)
- `src/components/ChatInterface.tsx` - Browser WebSocket client with connection waiting
- `src/components/Contact.tsx` - Footer component with social links and navigation
- `src/components/Hero.tsx` - Landing page with profile and chat trigger
- `src/lib/realtime/session-config.ts` - Session configuration and AI system prompts
- `src/lib/realtime/tool-executor.ts` - Tool execution logic (Cal.com API calls)
- `src/lib/realtime/types.ts` - TypeScript types for Realtime events
- `src/data/timeline.ts` - Professional experience timeline data
- `src/constants/research/` - Research papers and reading list data

### Experience & Projects:

**Current Experience** (in order):
1. URI: Research Fellow - Agentic Reasoning SLM (Sep 2025 - Present)
2. Apple: AI/ML Product Engineering Intern (May 2025 - Aug 2025)
3. Radical AI: AI Engineer - Rex web app (Aug 2024 - Oct 2024)
4. Caterpillar: Software Engineering Intern (May 2024 - Aug 2024)

**Key Projects**:
- NeuroCache: KV-cache manipulation with dynamic context compression
- Multilingual Voice Agent: Inventory ordering system (Spanish/Portuguese/Arabic/English)
- Emotion-Aware Music Recommendation: Multi-modal CNN + BERT pipeline
- QuSotch: Quantum Monte Carlo (NYU Hackathon 1st Place)
- Illume: Learning and Research Assistant (Princeton Hackathon 1st Place)

### Documentation:

- `docs/realtime-migration.md` - Detailed migration guide from server to client-side WebSocket

The site is designed as a personal portfolio with integrated AI chat capabilities, research documentation, professional timeline, and comprehensive footer navigation.
