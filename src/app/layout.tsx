import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { Header } from '@/components/Header'
import { BottomNav } from '@/components/BottomNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VoltMaster Pro - AI-Powered Job Management for Electricians',
  description: 'Turn job site photos into accurate quotes in 2 minutes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen bg-background">
          <Header />
          <main className="flex-1 pb-20 overflow-auto">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
          <BottomNav />
        </div>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
