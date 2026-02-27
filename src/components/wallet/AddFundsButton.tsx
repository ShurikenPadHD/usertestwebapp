'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

const DEFAULT_AMOUNT_CENTS = 5000 // $50

export function AddFundsButton() {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount_cents: DEFAULT_AMOUNT_CENTS }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error ?? 'Failed to create checkout')
      }
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <Button
      size="lg"
      className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? 'Redirecting...' : 'Add Funds'}
    </Button>
  )
}
