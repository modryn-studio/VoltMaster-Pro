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
├── frontend/           # Next.js application
│   ├── src/
│   │   ├── app/       # App Router pages
│   │   ├── components/ # React components
│   │   ├── lib/       # Utilities (Supabase clients)
│   │   └── hooks/     # Custom React hooks
│   ├── supabase-schema.sql  # Database schema
│   └── SUPABASE_SETUP.md    # Setup instructions
└── docs/              # Documentation
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
   cd VoltMaster-Pro/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase**
   
   Follow the detailed setup guide in [`frontend/SUPABASE_SETUP.md`](frontend/SUPABASE_SETUP.md):
   - Create Supabase project
   - Run database schema
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
3. Set **Root Directory**: `frontend`
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy

## 📖 Documentation

- [Supabase Setup Guide](frontend/SUPABASE_SETUP.md) - Database configuration
- [GitHub Workflow](docs/Github_Issues_Workflow.md) - Development process
- [Spec Documentation](docs/spec.md) - Feature specifications

## 🎯 Features

- **Job Management**: Create, track, and manage electrical jobs
- **Customer Database**: Store customer information and job history
- **Quote Generation**: Calculate labor, materials, and markup
- **Calendar View**: Schedule and visualize jobs
- **Invoice Tracking**: Manage billing and payment status
- **Mobile Responsive**: Full functionality on phones and tablets

## 🔐 Environment Variables

Required in `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
