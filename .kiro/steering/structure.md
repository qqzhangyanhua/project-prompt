# Project Structure

## Directory Organization

```
├── app/                    # Next.js 13 App Router pages
│   ├── auth/              # Authentication pages
│   ├── profile/           # User profile pages
│   ├── prompt/[id]/       # Dynamic prompt detail pages
│   ├── publish/           # Content publishing pages
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components (auto-generated)
│   ├── Header.tsx        # Navigation header
│   ├── Layout.tsx        # Layout wrapper
│   ├── PromptCard.tsx    # Prompt display card
│   ├── PromptList.tsx    # Prompt listing component
│   └── CategoryFilter.tsx # Category filtering
├── lib/                  # Utility functions and configurations
│   ├── supabase.ts       # Supabase client setup
│   ├── auth.ts           # Authentication utilities
│   ├── prompts.ts        # Prompt-related API functions
│   └── utils.ts          # General utility functions
├── hooks/                # Custom React hooks
│   ├── useAuth.ts        # Authentication hook
│   └── use-toast.ts      # Toast notification hook
├── stores/               # Zustand state stores
│   └── authStore.ts      # Authentication state
└── supabase/             # Database related files
    └── migrations/       # SQL migration files
```

## Naming Conventions

### Files & Directories
- **Components**: PascalCase (e.g., `PromptCard.tsx`)
- **Pages**: lowercase with hyphens for routes (e.g., `app/auth/page.tsx`)
- **Utilities**: camelCase (e.g., `useAuth.ts`)
- **Constants**: UPPER_SNAKE_CASE

### Components
- Use TypeScript interfaces for props
- Export as default for main component
- Use named exports for utilities/types

## Import Organization
1. React/Next.js imports
2. Third-party libraries
3. Internal components (using `@/` alias)
4. Relative imports
5. Type-only imports last

## Component Structure
- Keep components focused and single-purpose
- Use composition over inheritance
- Implement proper TypeScript typing
- Follow React best practices (hooks, memo when needed)

## Database Schema
- **user_profiles** - Extended user information
- **categories** - Prompt categories
- **prompts** - Main prompt content
- **tags** - Tag management
- **prompt_tags** - Many-to-many relationship
- **likes** & **favorites** - User interactions