'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function StripeReturnClient({ next }: { next: string }) {
  const router = useRouter()
  useEffect(() => {
    router.replace(next)
  }, [router, next])
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
      <p className="text-gray-400">Redirecting...</p>
    </div>
  )
}
