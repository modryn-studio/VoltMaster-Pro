# GitHub Copilot Instructions

## Project Context

**VoltMaster Pro** is an AI-powered job management and quoting system for electrical contractors. The app helps electricians create accurate quotes from job site photos, manage customers, track jobs, and generate invoices.

## Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Deployment**: Vercel

## Code Style & Conventions

### TypeScript
- Use TypeScript for all new files (`.tsx` for React components, `.ts` for utilities)
- Prefer explicit types over `any`
- Use interfaces for component props and data models
- Follow database schema types from Supabase

### React Components
- Use functional components with hooks
- Add `'use client'` directive for components using state/effects
- Keep Server Components when possible for better performance
- Use shadcn/ui components for consistent UI

### File Structure
```
src/
├── app/              # Next.js App Router pages
│   ├── layout.tsx    # Root layout with Header/Toaster
│   ├── page.tsx      # Dashboard
│   └── [route]/      # Route folders
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   ├── Header.tsx
│   └── BottomNav.tsx
├── lib/             # Utilities
│   ├── supabase/    # Supabase clients
│   └── utils.ts     # Helper functions
└── hooks/           # Custom React hooks
```

### Database Queries
- Use `createClient()` from `@/lib/supabase/client` in Client Components
- Use `createClient()` from `@/lib/supabase/server` in Server Components
- Always handle errors gracefully
- Use RLS policies - queries automatically filtered by `user_id`

### Naming Conventions
- **Components**: PascalCase (`JobCard.tsx`)
- **Utilities**: camelCase (`formatCurrency.ts`)
- **Database fields**: snake_case (`customer_name`, `quote_total`)
- **UI props**: camelCase in code, transform snake_case from DB

## Database Schema

Key tables:
- `users` - Company/contractor accounts
- `customers` - Client contact information
- `jobs` - Job records with status tracking
- `materials` - Line items for job materials
- `invoices` - Billing and payment tracking
- `job_photos` - Uploaded photos with AI analysis
- `ev_analysis` - EV charger electrical calculations (premium feature)
- `material_templates` - Reusable material lists

## Common Patterns

### Fetching Data (Client Component)
```typescript
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function MyComponent() {
  const [data, setData] = useState([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, customer:customers(*)')
        .order('created_at', { ascending: false })
      
      if (data) setData(data)
    }
    fetchData()
  }, [])
}
```

### Creating Records
```typescript
const { data, error } = await supabase
  .from('jobs')
  .insert({
    customer_id: customerId,
    job_type: 'EV Charger Install',
    status: 'quoted',
    quote_total: 2500
  })
  .select()
  .single()
```

### Status Values
Jobs use snake_case in DB:
- `quoted` → Display as "Quoted"
- `scheduled` → "Scheduled"
- `in_progress` → "In Progress"
- `complete` → "Complete"

Transform with:
```typescript
status.split('_').map(word => 
  word.charAt(0).toUpperCase() + word.slice(1)
).join(' ')
```

## UI Components

Use shadcn/ui components from `@/components/ui/`:
- `Button` - Primary actions
- `Input` - Text fields
- `Badge` - Status indicators
- `Card` - Content containers
- `Dialog` - Modals
- `Select` - Dropdowns

Color conventions:
- Primary: Electric blue (`text-primary`)
- Success: Green (`text-green-400`)
- Warning: Amber (`text-amber-400`)
- Danger: Red (`text-red-400`)

## Development Workflow

1. **New Features**: Create feature branch
2. **Database Changes**: Update `supabase/schema.sql` + migration
3. **Types**: Run `supabase gen types typescript` to update types
4. **Testing**: Test with real Supabase data, not mocks
5. **Build**: Verify with `npm run build` before push

## Environment Variables

Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## Common Tasks

### Add New Page
1. Create `src/app/[route]/page.tsx`
2. Add navigation link in `BottomNav.tsx` or `Header.tsx`
3. Add route to middleware if auth required

### Add New Table
1. Update `supabase/schema.sql` with table definition
2. Add RLS policies
3. Create TypeScript interface
4. Add CRUD functions in component or lib

### Upload Files
```typescript
const { data, error } = await supabase.storage
  .from('job-photos')
  .upload(`${jobId}/${Date.now()}.jpg`, file)
```

## Best Practices

- ✅ Use Server Components by default, add `'use client'` only when needed
- ✅ Handle loading and error states
- ✅ Make UI mobile-responsive (app is mobile-first)
- ✅ Use TypeScript strict mode
- ✅ Follow existing code patterns
- ✅ Test database queries with RLS enabled
- ❌ Don't bypass RLS policies
- ❌ Don't expose service_role key in client code
- ❌ Don't use `any` type without good reason

## Resources

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Database Schema](./supabase/schema.sql)
