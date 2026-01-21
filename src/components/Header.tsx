'use client'

import Link from 'next/link'
import { Zap } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-card border-b-2 border-border px-4 py-3">
      <div className="flex items-center gap-3 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div>
            <h1 
              className="text-xl font-bold tracking-tight uppercase text-foreground" 
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              VoltMaster Pro
            </h1>
            <p className="text-xs text-muted-foreground -mt-1">Job Management</p>
          </div>
        </Link>
      </div>
    </header>
  )
}
