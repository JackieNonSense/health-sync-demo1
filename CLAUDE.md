# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Health Sync is a 7-day MVP demonstration project for a job interview. It's a personal health tracking application with basic authentication, daily health logging, weekly summaries, and a premium AI chat feature. The project prioritizes functional demonstration over production-ready features.

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production with Turbopack
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Core Architecture

### Database Schema (Supabase)
- `health_logs` table: id, user_id, log_date, symptoms (text), notes (text), tags (text[]), created_at
- `users` table: Standard Supabase auth.users + custom `plan` field ('free' or 'pro')
- Row Level Security (RLS) enforced: `user_id = auth.uid()`

### App Structure (Next.js App Router)
- `/app/auth/` - Registration and login pages
- `/app/dashboard/` - Main health logging interface (form + list)
- `/app/summary/` - Weekly statistics and Recharts visualization
- `/app/ai-chat/` - Premium feature with paywall logic
- `/components/` - Reusable UI components
- `/lib/supabase.js` - Supabase client initialization

### Feature Implementation Priorities
1. **Authentication** (Supabase Auth) - Basic email/password only
2. **Daily Health Logs** - Single page with form at top, list below (last 20 entries)
3. **Weekly Summary** - Simple stats + one chart (last 7 days)
4. **AI Chat + Paywall** - Toggle user.plan field, no real payments

### Key Technical Constraints
- **Predefined Tags**: Tired, Dizzy, Headache, Nausea, Anxiety, Joint Pain
- **No Edit Functionality**: Only create/read/delete for health logs
- **Simplified AI**: Either OpenAI API or 3-5 pre-programmed responses
- **Mock Payment**: Button just toggles database field, no Stripe integration
- **No Persistence**: AI chat history doesn't need to be stored

### Environment Variables Required
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### MVP Success Criteria
- User registration/login works
- Health logs can be created and viewed
- Weekly summary shows accurate statistics  
- Paywall logic functions (free users locked out of AI)
- "Upgrade" button switches user to pro plan
- AI chat accessible for pro users

### What's Intentionally Simplified
- Payment processing (just database toggle)
- Email verification (users immediately active)
- PDF export (UI button present but non-functional)
- AI responses (may use simple keyword matching)
- User profiles (no editing/avatars)
- Advanced analytics (basic stats only)