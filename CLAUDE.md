# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Starts Next.js development server on http://localhost:3000
- **Build**: `npm run build` - Builds the application for production (configured for static export)
- **Production server**: `npm run start` - Starts production server (after build)
- **Linting**: `npm run lint` - Runs ESLint (ignores errors during builds per next.config.js)

## Project Architecture

This is a **PromptHub** application - an AI prompt sharing platform built with Next.js 13 App Router, TypeScript, and Supabase.

### Tech Stack
- **Frontend**: Next.js 13 with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Backend**: Supabase (PostgreSQL database, authentication, RLS)
- **Build**: Configured for static export (`output: 'export'` in next.config.js)

### Key Architecture Patterns

**Database Architecture**:
- Uses Supabase with Row Level Security (RLS) enabled
- Core tables: `user_profiles`, `categorieslabel`, `prompts`, `tags`, `prompt_tags`, `likes`, `favorites`
- Automatic trigger functions update like/favorite counts on prompts
- Comprehensive foreign key relationships with cascade deletes

**Authentication Flow**:
- Supabase Auth handles user sessions
- Custom user profiles extend auth.users with additional fields (username, display_name, bio, avatar_url)
- Authentication functions in `lib/auth.ts` handle signup with profile creation

**Component Structure**:
- `components/ui/` contains shadcn/ui base components
- `components/` contains app-specific components (Header, Layout, PromptCard, etc.)
- All components use TypeScript with proper type definitions from `lib/supabase.ts`

**Data Management**:
- TypeScript interfaces defined in `lib/supabase.ts` for all database entities
- Custom hooks in `hooks/` for reusable state logic (useAuth, use-toast)
- API functions organized in `lib/` directory (auth.ts, prompts.ts)

### Important Configuration Notes

- **Static Export**: Application is configured for static export, images are unoptimized
- **Path Aliases**: Uses `@/*` alias pointing to root directory (configured in tsconfig.json)
- **Styling**: Uses CSS custom properties for theming, supports dark mode via class strategy
- **Database**: Requires Supabase environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### Database Schema Key Points

- `categorieslabel` table stores prompt categories with color coding
- `prompts` table is the core entity with automatic like/favorite counting
- Many-to-many relationship between prompts and tags via `prompt_tags`
- RLS policies ensure users can only edit their own content
- Triggers automatically maintain like_count and favorites_count on prompts table

### Development Workflow

When working with this codebase:
1. Database changes should be made via Supabase migrations in `supabase/migrations/`
2. Component development follows shadcn/ui patterns - check existing components for consistency
3. All database interactions should use the typed interfaces from `lib/supabase.ts`
4. Authentication state should be managed through the custom useAuth hook