'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'

export function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Sign out
    </button>
  )
}
