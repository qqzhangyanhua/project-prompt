# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Starts Next.js development server on http://localhost:3000
- **Build**: `npm run build` - Builds the application for production (configured for static export)
- **Production server**: `npm run start` - Starts production server (after build)
- **Linting**: `npm run lint` - Runs ESLint (ignores errors during builds per next.config.js)

## Project Architecture

This is a **PromptHub** application - an AI prompt sharing platform built with Next.js 13 App Router, TypeScript, and direct PostgreSQL access.

### Tech Stack
- **Frontend**: Next.js 13 with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Backend**: PostgreSQL + Next.js Route Handlers + cookie sessions
- **Build**: Configured for static export (`output: 'export'` in next.config.js)

### Key Architecture Patterns

**Database Architecture**:
- Uses PostgreSQL with migration SQL files under `supabase/migrations/`
- Core tables: `user_profiles`, `categorieslabel`, `prompts`, `tags`, `prompt_tags`, `likes`, `favorites`
- Automatic trigger functions update like/favorite counts on prompts
- Comprehensive foreign key relationships with cascade deletes

**Authentication Flow**:
- Custom auth based on `user_profiles` + `user_sessions`
- Session cookie is managed by Next.js route handlers under `app/api/auth/*`
- Frontend auth state is loaded via `lib/auth.ts` and `stores/authStore.ts`

**Component Structure**:
- `components/ui/` contains shadcn/ui base components
- `components/` contains app-specific components (Header, Layout, PromptCard, etc.)
- All components use TypeScript type definitions from `lib/type.ts`

**Data Management**:
- TypeScript interfaces are centralized in `lib/type.ts`
- Custom hooks in `hooks/` for reusable state logic (useAuth, use-toast)
- API functions organized in `lib/` directory (auth.ts, prompts.ts)

### Important Configuration Notes

- **Static Export**: Application is configured for static export, images are unoptimized
- **Path Aliases**: Uses `@/*` alias pointing to root directory (configured in tsconfig.json)
- **Styling**: Uses CSS custom properties for theming, supports dark mode via class strategy
- **Database**: Requires `DATABASE_URL`

### Database Schema Key Points

- `categorieslabel` table stores prompt categories with color coding
- `prompts` table is the core entity with automatic like/favorite counting
- Many-to-many relationship between prompts and tags via `prompt_tags`
- RLS policies ensure users can only edit their own content
- Triggers automatically maintain like_count and favorites_count on prompts table

### Development Workflow

When working with this codebase:
1. Database changes should be made via SQL migrations in `supabase/migrations/`
2. Component development follows shadcn/ui patterns - check existing components for consistency
3. All database interactions should use the typed interfaces from `lib/type.ts`
4. Authentication state should be managed through the custom useAuth hook
