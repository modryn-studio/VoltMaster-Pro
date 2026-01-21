'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, CalendarDays, Users, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/', icon: Home, label: 'Jobs' },
  { path: '/customers', icon: Users, label: 'Customers' },
  { path: '/jobs/new', icon: Plus, label: 'New', isAction: true },
  { path: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { path: '/invoices', icon: FileText, label: 'Invoices' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t-2 border-border">
      <div className="max-w-7xl mx-auto flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path

          if (item.isAction) {
            return (
              <Link
                key={item.path}
                href={item.path}
                data-testid="nav-new-job"
                className="flex flex-col items-center justify-center w-14 h-14 -mt-6 bg-accent text-accent-foreground rounded-full shadow-lg touch-target"
                style={{ boxShadow: '0 4px 0 0 rgba(251, 191, 36, 0.5)' }}
              >
                <Icon className="w-7 h-7" strokeWidth={2.5} />
              </Link>
            )
          }

          return (
            <Link
              key={item.path}
              href={item.path}
              data-testid={`nav-${item.label.toLowerCase()}`}
              className={cn(
                'flex flex-col items-center justify-center touch-target px-3 py-1 rounded-lg transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
