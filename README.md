# VoltMaster Pro

AI-powered job management and quoting system for electrical contractors. Turn job site photos into accurate quotes in minutes.

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel

## 📦 Project Structure

```
VoltMaster-Pro/
├── .github/           # GitHub configuration
│   └── copilot-instructions.md
├── src/
│   ├── app/          # Next.js App Router pages
│   ├── components/   # React components (including shadcn/ui)
│   ├── lib/          # Utilities (Supabase clients, helpers)
│   └── hooks/        # Custom React hooks
├── supabase/         # Database
│   └── schema.sql    # Database schema with RLS policies
├── docs/             # Documentation
├── package.json      # Dependencies
└── SUPABASE_SETUP.md # Setup guide
```

## 🛠️ Setup

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/modryn-studio/VoltMaster-Pro.git
   cd VoltMaster-Pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase**
   
   Follow the detailed setup guide in [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md):
   - Create Supabase project
   - Run database schema from `supabase/schema.sql`
   - Configure storage buckets
   - Copy credentials to `.env.local`

4. **Run development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Vercel will auto-detect Next.js configuration
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy

## 📖 Documentation

- [Supabase Setup Guide](SUPABASE_SETUP.md) - Database configuration
- [GitHub Copilot Instructions](.github/copilot-instructions.md) - Development guidelines
- [Spec Documentation](docs/spec.md) - Feature specifications
- [Database Schema](supabase/schema.sql) - Full database structure

## 🎯 Features

- **Job Management**: Create, track, and manage electrical jobs
- **Customer Database**: Store customer information and job history
- **Quote Generation**: Calculate labor, materials, and markup
- **Calendar View**: Schedule and visualize jobs
- **Invoice Tracking**: Manage billing and payment status
- **Mobile Responsive**: Full functionality on phones and tablets

## 🔐 Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
