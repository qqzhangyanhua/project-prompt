# Technology Stack

## Frontend Framework
- **Next.js 13** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library

## Backend & Database
- **Supabase** for database, authentication, and storage
- Row Level Security (RLS) enabled
- PostgreSQL database

## Key Libraries
- **@radix-ui** - Accessible UI primitives
- **react-hook-form** + **zod** - Form handling and validation
- **zustand** - State management
- **lucide-react** - Icons
- **class-variance-authority** + **clsx** - Conditional styling
- **date-fns** - Date utilities

## Development Tools
- **TypeScript** for type safety
- **ESLint** with Next.js config
- **PostCSS** + **Autoprefixer**

## Common Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database
```bash
supabase db reset    # Reset database with migrations
```

## Environment Setup
- Node.js 18+
- Supabase project required
- Environment variables in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Build Configuration
- Images unoptimized for static export
- ESLint ignored during builds
- Custom webpack config for Node.js compatibility
- Path aliases configured with `@/*` pointing to root