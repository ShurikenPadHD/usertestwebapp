'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/layout/AppShell'

export default function DevLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/dev/signup' || pathname === '/dev/signin'

  if (isAuthPage) {
    return <div className="min-h-screen bg-[#0a0a0a]">{children}</div>
  }

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Background: base + glow orbs + grid – aligned with marketing & tester app */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#0a0a0a]" />
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>
      <div className="relative z-10 shrink-0">
        <Sidebar role="dev" />
      </div>
      <main className="flex-1 min-h-0 p-6 overflow-auto relative z-10">
        {children}
      </main>
    </div>
  )
}
