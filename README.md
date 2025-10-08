# Health Sync - Health Tracking Application

A full-stack health tracking application built as a 7-day MVP demonstration project. The application features daily health logging, weekly summaries with data visualization, and an AI-powered chat assistant with paywall implementation.

## Live Demo

**Production URL**: [Your Vercel deployment URL]
**Video Demonstration**: [Your demo video link]

## Core Features

### 1. Daily Health Logging
- Record daily symptoms with free-text input
- Add detailed notes for each entry
- Quick-select from predefined symptom tags (Tired, Dizzy, Headache, Nausea, Anxiety, Joint Pain)
- Calendar view showing all logged dates
- View history of recent entries (last 20)
- Delete functionality for log management

### 2. Weekly Health Summary
- Automatic calculation of statistics from past 7 days
- Visual data representation using bar charts
- Display of most frequent symptoms
- Total log count for the week

### 3. AI Chat Assistant (Premium Feature)
- Real-time health advice using OpenAI GPT-4o-mini
- Conversational interface with context awareness
- Feature-gated behind paywall system
- Free users see upgrade prompt
- Pro users have full access

### 4. Security & Authentication
- Email/password authentication via Supabase Auth
- Row Level Security (RLS) for data isolation
- User-specific data access controls
- Secure session management

## Technology Stack & Architecture Decisions

### Frontend Framework: Next.js 15.5
**Why Next.js?**
- Server-side rendering for better SEO and performance
- API routes eliminate need for separate backend server
- Built-in routing and file-based structure
- Excellent developer experience with hot reload
- Strong TypeScript support (though this project uses JavaScript for faster development)

### UI Framework: React 19 + Tailwind CSS 4
**Why React + Tailwind?**
- Component-based architecture for reusability
- Tailwind's utility-first approach speeds up development
- No need for separate CSS files
- Responsive design out of the box
- Consistent design system

### Backend: Supabase
**Why Supabase over custom backend?**
- Built-in authentication system (saves 2-3 days of development)
- PostgreSQL database with automatic REST API
- Row Level Security for data protection
- Real-time subscriptions available
- Generous free tier for MVP

**Key Supabase Features Used:**
- Auth: Email/password authentication
- Database: PostgreSQL with RLS policies
- Auto-generated API endpoints

### AI Integration: OpenAI GPT-4o-mini
**Why OpenAI?**
- Industry-standard API
- Reliable and fast responses
- Cost-effective for demo purposes
- Simple integration

**Why GPT-4o-mini over GPT-4?**
- Lower latency (faster responses)
- Significantly cheaper for demo
- Sufficient for health advice use case

### Data Visualization: Recharts
**Why Recharts?**
- React-native charting library
- Simple API for common chart types
- Good documentation
- Lightweight compared to Chart.js or D3

### Deployment: Vercel
**Why Vercel?**
- Zero-config deployment for Next.js
- Automatic HTTPS and CDN
- Preview deployments for each commit
- Excellent integration with GitHub
- Environment variable management

## Architecture Overview

```
┌─────────────────┐
│   Next.js App   │
│   (Frontend)    │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
┌────────▼────────┐  ┌────▼─────────┐
│  Supabase Auth  │  │ OpenAI API   │
│  + PostgreSQL   │  │ (GPT-4o-mini)│
└─────────────────┘  └──────────────┘
```

**Data Flow:**
1. User authenticates via Supabase Auth
2. Frontend makes requests to Supabase PostgreSQL
3. RLS policies ensure user only accesses own data
4. AI chat requests go through Next.js API route to OpenAI
5. Charts render client-side with data from database

## Installation & Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Supabase account (free tier)
- OpenAI API key (optional, for AI chat feature)

### Step 1: Clone Repository

```bash
git clone https://github.com/JackieNonSense/health-sync-demo1.git
cd health-sync-demo1
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

**Note**: The OpenAI API key is optional. Without it, the AI chat feature will not function, but all other features will work normally.

### Step 4: Set Up Database

Execute the following SQL in your Supabase SQL Editor:

```sql
-- Create health_logs table
CREATE TABLE health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  symptoms TEXT,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE health_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own logs
CREATE POLICY "Users can manage own health logs"
ON health_logs
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create profiles table for plan management
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own profile
CREATE POLICY "Users can manage own profile"
ON profiles
FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Trigger function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, plan)
  VALUES (NEW.id, 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Step 5: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 6: Build for Production

```bash
npm run build
npm start
```

## Database Schema

### health_logs Table

| Column     | Type      | Description                          |
|------------|-----------|--------------------------------------|
| id         | UUID      | Primary key                          |
| user_id    | UUID      | Foreign key to auth.users            |
| log_date   | DATE      | Date of health log entry             |
| symptoms   | TEXT      | Free-text symptom description        |
| notes      | TEXT      | Additional notes                     |
| tags       | TEXT[]    | Array of predefined symptom tags     |
| created_at | TIMESTAMP | Auto-generated creation timestamp    |

### profiles Table

| Column     | Type      | Description                          |
|------------|-----------|--------------------------------------|
| id         | UUID      | Primary key (references auth.users)  |
| plan       | TEXT      | User subscription plan (free/pro)    |
| created_at | TIMESTAMP | Auto-generated creation timestamp    |

## What's Working vs What's Mocked

### Fully Functional Features

**Authentication & Security**
- Complete user registration and login flow using Supabase Auth
- Session persistence across page refreshes
- Logout functionality
- Row Level Security (RLS) policies enforcing user data isolation
- Secure password hashing (handled by Supabase)

**Health Logging**
- Create new health logs with symptoms, notes, and tags
- Read/view all user's health logs (last 20 entries)
- Delete existing health logs
- Calendar visualization of logged dates
- Tag-based categorization with predefined options

**Weekly Summary**
- Real-time calculation of statistics from database
- Bar chart visualization using Recharts library
- Frequency analysis of symptom tags
- Last 7 days data aggregation

**AI Chat Assistant**
- Real OpenAI GPT-4o-mini API integration
- Streaming responses (not implemented, but API supports it)
- Context-aware health advice
- Error handling for API failures

**Paywall System**
- Database-driven feature gating based on user.plan field
- Dynamic UI rendering for free vs pro users
- Upgrade button functionality

### Simplified/Mocked Features

**Payment Processing**
- **What's Mocked**: The actual payment transaction
- **How It Works**: Clicking "Upgrade to Pro" directly updates the database field `profiles.plan = 'pro'`
- **Production Requirement**: Would need Stripe/PayPal integration with webhooks, subscription management, and billing portal
- **Why Simplified**: Focus is on demonstrating feature gating logic, not payment infrastructure

**Email Verification**
- **What's Missing**: Email confirmation after signup
- **How It Works**: Users are immediately active after registration
- **Production Requirement**: Supabase email confirmation flow with confirmation emails
- **Why Simplified**: Faster demo experience for evaluators

**Password Reset**
- **What's Missing**: "Forgot Password" functionality
- **Production Requirement**: Supabase `resetPasswordForEmail()` flow
- **Why Simplified**: Time constraint in 7-day MVP timeline

**Edit Health Logs**
- **What's Missing**: Ability to update existing log entries
- **Current Functionality**: Users can only create, read, and delete logs
- **Workaround**: Users can delete and recreate entries
- **Why Simplified**: Delete + Create achieves similar outcome; prioritized other features

**AI Chat History Persistence**
- **What's Missing**: Storing chat messages in database
- **How It Works**: Chat history exists only in React component state (cleared on page refresh)
- **Production Requirement**: Create `chat_messages` table and persist conversation history
- **Why Simplified**: Focus on demonstrating AI integration, not data persistence

**PDF Export**
- **What's Missing**: Export weekly summary as PDF
- **Status**: No UI button currently implemented
- **Production Requirement**: Use libraries like jsPDF or server-side PDF generation
- **Why Simplified**: Not in core MVP requirements

## Project Structure

```
health-sync-demo1/
├── app/
│   ├── ai-chat/
│   │   └── page.js              # AI chat interface with paywall logic
│   ├── api/
│   │   └── chat/
│   │       └── route.js         # OpenAI API endpoint
│   ├── auth/
│   │   └── page.js              # Login and registration page
│   ├── dashboard/
│   │   └── page.js              # Main health logging interface
│   ├── summary/
│   │   └── page.js              # Weekly statistics and charts
│   ├── globals.css              # Global styles and Tailwind config
│   ├── layout.js                # Root layout with metadata
│   └── page.js                  # Landing page
├── components/
│   ├── HealthCalendar.js        # Interactive calendar component
│   ├── HealthLogForm.js         # Health log creation form
│   └── Navigation.js            # Navigation bar with user menu
├── lib/
│   └── supabase.js              # Supabase client initialization
├── .env.local                   # Environment variables (not committed)
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## Development Timeline (7 Days)

- **Day 1-2**: Project setup, Supabase configuration, authentication pages, database schema
- **Day 3-4**: Health log CRUD operations, calendar component, dashboard UI
- **Day 5**: Weekly summary calculations, Recharts integration, statistics display
- **Day 6**: AI chat implementation, paywall logic, OpenAI API integration
- **Day 7**: UI polish, bug fixes, deployment to Vercel, documentation

## Testing the Application

### Manual Test Flow

1. **Registration**: Sign up with a new email/password
2. **Login**: Log in with created credentials
3. **Create Log**: Add a health log with symptoms "headache, fatigue", tags "Tired, Headache", and notes
4. **View Calendar**: Check that today's date is highlighted on the calendar
5. **Summary**: Navigate to Summary page and verify statistics appear
6. **AI Chat (Free)**: Visit AI Chat page, confirm paywall is shown
7. **Upgrade**: Click "Upgrade to Pro" button
8. **AI Chat (Pro)**: Send message "I have a headache, what should I do?" and receive AI response
9. **Logout**: Sign out and verify redirect to login page

## Deployment

### Vercel Deployment

1. Push code to GitHub repository
2. Import repository in Vercel dashboard
3. Configure environment variables in Vercel project settings
4. Deploy automatically on push to main branch

### Environment Variables in Vercel

Add the following in Project Settings > Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`

## Known Limitations

1. **No mobile app**: Web-only interface
2. **Limited tag options**: Only 6 predefined symptom tags
3. **No data export**: Cannot export health data to CSV/PDF
4. **No multi-language support**: English only
5. **No real-time sync**: Requires manual page refresh to see updates
6. **Basic error handling**: Could be more comprehensive
7. **No image uploads**: Text-only health logs

## Future Enhancements (Post-MVP)

- Integrate real payment processing (Stripe)
- Add data export functionality (CSV, PDF)
- Implement edit functionality for health logs
- Store AI chat history in database
- Add data visualization trends over time
- Email notifications for logging reminders
- Mobile responsive improvements
- Advanced analytics and insights
- Multi-language support

## Project Context

This project was built as a demonstration for a job interview with the following constraints:

- **Timeline**: 7 days from start to completion
- **Goal**: Showcase full-stack development skills and product thinking
- **Scope**: MVP with core features only, not production-ready
- **Focus**: Clean architecture, security best practices, and feature completeness

## License

This is a demonstration project for interview purposes.
