Health Sync - Requirements Document (1-Week MVP)
Project Context
This is a demonstration project for a job interview, to be completed in 7 days. The goal is to showcase technical skills and product thinking, not to build a production-ready application.

Core Requirements (Must Have)
1. User Authentication
What: Basic email/password registration and login
Functionality:

Registration form (email + password)
Login form (email + password)
Logout button
Session persistence (stay logged in after refresh)

NOT included:

❌ Email verification
❌ Password reset
❌ Social login (Google/Apple)
❌ User profiles/avatars

Implementation: Supabase Auth (built-in)

2. Daily Health Log
What: Simple form to record daily health information
Data to capture:

Date: Today's date (auto-filled, can edit)
Symptoms: Free text input (e.g., "headache, fatigue")
Notes: Text area for additional context
Tags: Quick-select buttons for common symptoms

Predefined tags (6-8 options):

Tired
Dizzy
Headache
Nausea
Anxiety
Joint Pain

Features:

✅ Add new log entry
✅ View list of past entries (last 20)
✅ Delete entries
❌ No edit functionality (too time-consuming)
❌ No severity ratings
❌ No image uploads

UI: Single page with form at top, list below

3. Weekly Health Summary (Free Feature)
What: Simple statistics and visualization of health data
Display:

Total number of logs this week
Most common symptoms (top 3)
One simple chart (bar or line chart showing frequency)

Implementation:

Calculate stats from database
Use Recharts for visualization
Show data for "last 7 days"

NOT included:

❌ Date range selector
❌ PDF export (can show UI button but non-functional)
❌ Complex analytics
❌ Trend predictions


4. AI Chat Assistant (Premium Feature with Paywall)
What: Demonstration of feature gating and basic AI chat
Paywall Logic:
IF user.plan === 'free'
  SHOW: Lock icon + "Upgrade to Pro" message + Upgrade button
ELSE IF user.plan === 'pro'
  SHOW: AI chat interface
Upgrade Button:

Clicking "Upgrade" changes database field: user.plan = 'pro'
NO real payment processing (just a state toggle)
Show success message: "Welcome to Pro!"

AI Chat Functionality (Simple Version):

Option A: Integrate OpenAI API for real responses
Option B: Use 3-5 pre-programmed responses based on keywords
Chat history does NOT need to persist

NOT included:

❌ Stripe/payment integration
❌ Subscription management
❌ Complex AI analysis of user logs
❌ Chat history storage


5. Basic Secure Storage
What: Ensure users can only access their own data
Implementation:

Use Supabase Row Level Security (RLS)
Policy: user_id = auth.uid()
All queries automatically filtered by user

NOT included:

❌ End-to-end encryption
❌ HIPAA compliance
❌ Automated backups
❌ Data export


Tech Stack (Fixed)
Frontend:     Next.js 14 + JavaScript + Tailwind CSS
Backend:      Supabase (PostgreSQL + Auth + API)
Charts:       Recharts
Icons:        Lucide React
AI:           OpenAI API (optional, can mock)
Deployment:   Vercel

Database Schema (Simplified)
Table: health_logs
sqlid              uuid (primary key)
user_id         uuid (foreign key to auth.users)
log_date        date
symptoms        text
notes           text
tags            text[] (array of strings)
created_at      timestamp
Table: users (managed by Supabase Auth)
sqlid              uuid
email           text
plan            text ('free' or 'pro')  -- add this custom field

MVP Development Plan (7 Days)
Day 1-2: Foundation

✅ Initialize Next.js project
✅ Configure Supabase
✅ Build auth pages (register/login)
✅ Create database tables

Day 3-4: Core Features

✅ Daily log form
✅ Log list display
✅ Delete functionality

Day 5: Summary Page

✅ Calculate statistics
✅ Create one chart with Recharts

Day 6: AI + Paywall

✅ Build paywall UI
✅ Add upgrade button
✅ Implement AI chat (simple version)

Day 7: Polish + Deploy

✅ Test all features
✅ Deploy to Vercel
✅ Record demo video
✅ Write README


What's Working vs Mocked
✅ Fully Functional:

User registration and login
Creating and viewing health logs
Deleting logs
Weekly statistics calculation
Chart visualization
Paywall logic (show/hide based on plan)
AI chat (if OpenAI integrated)

⚠️ Mocked/Simplified:

Payment: Just toggles database field, no Stripe
AI responses: May use simple pre-programmed replies
PDF Export: Button exists but doesn't work
Email verification: Users are immediately active


Success Criteria
The demo is successful if:

A user can sign up and log in
A user can add health logs with symptoms and tags
The weekly summary shows accurate statistics
Free users see a locked AI page
After "upgrading," users can access AI chat
The app is deployed and accessible via URL
Code is on GitHub with clear README
Demo video clearly shows all features


Out of Scope (Don't Build)

Email verification
Password reset
User profile editing
Real payment processing
Device synchronization
Mobile app
Advanced analytics
Social features
Data export
Multi-language support


Interview Deliverables Checklist

 Live deployed URL (Vercel)
 GitHub repository with code
 README.md with setup instructions
 3-5 minute demo video
 Notes document: "What's Working vs Mocked"


Notes for Development
Time-Saving Tips:

Use Supabase Auth (don't build auth from scratch)
Use Tailwind components (don't write custom CSS)
Keep UI simple (functionality > aesthetics)
Test as you build (don't wait until the end)

If Running Out of Time:

Prioritize: Auth → Logs → Summary
AI can be the simplest version
Skip delete functionality if needed
Basic styling is fine

Remember: This is a demo to show you can build a functional app. It doesn't need to be perfect or production-ready.