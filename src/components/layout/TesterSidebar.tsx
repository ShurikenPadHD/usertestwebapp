"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, ListChecks, Wallet, Settings } from 'lucide-react'
import { SignOutButton } from '@/components/auth/SignOutButton'

const navItems = [
  { href: '/tester/available', label: 'Available Tests', icon: Search },
  { href: '/tester/my-tests', label: 'My Tests', icon: ListChecks },
  { href: '/tester/earnings', label: 'Earnings', icon: Wallet },
  { href: '/tester/settings', label: 'Settings', icon: Settings },
]

export function TesterSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 h-screen bg-[#1a1a1a]/80 backdrop-blur-xl border-r border-white/10 flex flex-col overflow-y-auto shrink-0">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          UserTest
        </h2>
        <p className="text-xs text-gray-500 mt-1">Tester Marketplace</p>
      </div>
      <nav className="p-4 space-y-1 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="mx-4 mb-4 space-y-1">
        <Link
          href="/tester/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <div
            className="w-9 h-9 rounded-full bg-purple-600/80 border border-purple-500/50 flex items-center justify-center text-sm font-medium"
            title="Profile"
          >
            T
          </div>
          <span className="text-sm">Account</span>
        </Link>
        <SignOutButton />
      </div>
    </aside>
  )
}
