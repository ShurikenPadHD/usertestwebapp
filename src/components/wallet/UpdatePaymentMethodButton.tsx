'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export function UpdatePaymentMethodButton() {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/create-portal-session', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error ?? 'Failed to open portal')
      }
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <Button
      variant="secondary"
      className="w-full border-white/10"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? 'Opening...' : 'Update Method'}
    </Button>
  )
}
