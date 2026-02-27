'use client'

import Link from 'next/link'
import { SignOutButton } from '@/components/auth/SignOutButton'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {children}
    </div>
  )
}

export function Header() {
  return (
    <header className="border-b border-white/5 px-6 py-4">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          UserTest
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dev" className="text-sm text-gray-400 hover:text-white">
            For Developers
          </Link>
          <Link href="/tester" className="text-sm text-gray-400 hover:text-white">
            For Testers
          </Link>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm">
            D
          </div>
        </div>
      </div>
    </header>
  )
}

export function Sidebar({ role = 'dev' }: { role?: 'dev' | 'tester' }) {
  const links = role === 'dev' 
    ? [
        { href: '/dev', label: 'Dashboard' },
        { href: '/dev/payments', label: 'Payments' },
        { href: '/dev/settings', label: 'Settings' },
      ]
    : [
        { href: '/tester', label: 'Dashboard' },
        { href: '/tester/available', label: 'Available Tests' },
        { href: '/tester/earnings', label: 'Earnings' },
        { href: '/tester/settings', label: 'Settings' },
      ]

  return (
    <aside className="w-64 h-screen border-r border-white/5 p-4 flex flex-col overflow-y-auto shrink-0">
      <div className="mb-6">
        <h2 className="text-lg font-bold">UserTest</h2>
        <p className="text-sm text-gray-500 capitalize">{role === 'dev' ? 'Developer' : 'Tester'}</p>
      </div>
      <nav className="space-y-1 flex-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="mt-4 space-y-1">
        <Link
          href={role === 'dev' ? '/dev/settings' : '/tester/settings'}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <div
            className="w-9 h-9 rounded-full bg-blue-600/80 border border-blue-500/50 flex items-center justify-center text-sm font-medium"
            title="Profile"
          >
            {role === 'dev' ? 'D' : 'T'}
          </div>
          <span className="text-sm">Account</span>
        </Link>
        <SignOutButton />
      </div>
    </aside>
  )
}
