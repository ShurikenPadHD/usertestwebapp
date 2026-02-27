'use client'

import { useState, useEffect } from 'react'

export interface WalletBalance {
  balance_cents: number
  pending_cents: number
}

export interface WalletTransaction {
  id: string
  user_id: string
  type: string
  amount_cents: number
  status: string
  metadata?: Record<string, unknown>
  available_at?: string | null
  created_at: string
}

export function useWallet() {
  const [balance, setBalance] = useState<WalletBalance | null>(null)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      try {
        const [balanceRes, txRes] = await Promise.all([
          fetch('/api/wallet/balance'),
          fetch('/api/wallet/transactions'),
        ])
        if (cancelled) return
        if (balanceRes.ok) {
          const data = await balanceRes.json()
          setBalance(data)
        }
        if (txRes.ok) {
          const data = await txRes.json()
          setTransactions(data)
        }
      } catch (err) {
        console.error('useWallet:', err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [])

  return { balance, transactions, isLoading }
}
