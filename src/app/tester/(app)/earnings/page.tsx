'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Wallet, ArrowUpRight, History, TrendingUp } from 'lucide-react'
import { useWallet } from '@/hooks/useWallet'

const MIN_PAYOUT_CENTS = 100

function formatRelative(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

export default function EarningsPage() {
  const { balance, transactions, isLoading } = useWallet()
  const [hasPayoutMethod, setHasPayoutMethod] = useState<boolean | null>(null)
  const [trustLevel, setTrustLevel] = useState<string>('new')
  const [completedTasksCount, setCompletedTasksCount] = useState(0)
  const [payoutLoading, setPayoutLoading] = useState(false)
  const [payoutError, setPayoutError] = useState<string | null>(null)
  const [onboardLoading, setOnboardLoading] = useState(false)
  const [onboardError, setOnboardError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/stripe/connect/status')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!cancelled && data) {
          setHasPayoutMethod(!!data.hasPayoutMethod)
          setTrustLevel(data.trust_level ?? 'new')
          setCompletedTasksCount(Number(data.completed_tasks_count) ?? 0)
        }
      })
      .catch(() => { if (!cancelled) setHasPayoutMethod(false) })
    return () => { cancelled = true }
  }, [])

  const balanceCents = balance?.balance_cents ?? 0
  const pendingCents = balance?.pending_cents ?? 0
  const totalEarnedCents = transactions
    .filter((t) => t.type === 'test_release')
    .reduce((s, t) => s + Math.max(0, Number(t.amount_cents)), 0)
  const completedCount = transactions.filter((t) => t.type === 'test_release' && t.status === 'completed').length

  const displayTransactions = transactions
    .filter((t) => t.type === 'test_release' || t.type === 'payout')
    .map((t) => {
      const meta = (t.metadata as Record<string, unknown>) ?? {}
      const desc = (meta.task_title as string) ?? (t.type === 'payout' ? 'Payout' : 'Earning')
      return {
        id: t.id,
        type: t.type === 'payout' ? 'payout' : 'earning',
        amount: Number(t.amount_cents) / 100,
        description: desc,
        date: formatRelative(t.created_at),
        status: t.status,
      }
    })

  if (isLoading) {
    return (
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mt-4">Earnings</h1>
          <p className="text-gray-400 mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mt-4">Earnings</h1>
        <p className="text-gray-400 mt-2">Track your income and request payouts</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card variant="glass" className="p-6 bg-gradient-to-br from-green-900/20 to-blue-900/20 border-green-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-gray-400">Available Balance</span>
          </div>
          <p className="text-4xl font-bold text-green-400">${(balanceCents / 100).toFixed(2)}</p>
          <Button
            className="mt-4 w-full bg-green-600 hover:bg-green-700"
            disabled={
              !hasPayoutMethod ||
              balanceCents < MIN_PAYOUT_CENTS ||
              payoutLoading
            }
            title={
              !hasPayoutMethod
                ? 'Add a payout method first'
                : balanceCents < MIN_PAYOUT_CENTS
                  ? `Minimum payout is $${MIN_PAYOUT_CENTS / 100}`
                  : undefined
            }
            onClick={async () => {
              if (balanceCents < MIN_PAYOUT_CENTS) return
              setPayoutError(null)
              setPayoutLoading(true)
              try {
                const res = await fetch('/api/stripe/connect/request-payout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ amount_cents: balanceCents }),
                })
                const data = await res.json().catch(() => ({}))
                if (!res.ok) throw new Error(data.error || 'Payout failed')
                window.location.reload()
              } catch (e) {
                setPayoutError(e instanceof Error ? e.message : 'Payout failed')
              } finally {
                setPayoutLoading(false)
              }
            }}
          >
            {payoutLoading ? 'Processing…' : 'Request Payout'}
          </Button>
        </Card>

        <Card variant="glass" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-gray-400">Total Earned</span>
          </div>
          <p className="text-3xl font-bold">${(totalEarnedCents / 100).toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-2">From {completedCount} completed test{completedCount !== 1 ? 's' : ''}</p>
        </Card>

        <Card variant="glass" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <History className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-gray-400">Pending</span>
          </div>
          <p className="text-3xl font-bold">${(pendingCents / 100).toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-2">Awaiting approval or hold period</p>
        </Card>
      </div>

      {/* Transaction History + Account Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card variant="glass" className="p-6">
            <h2 className="text-xl font-semibold mb-6">Payout History</h2>

            {displayTransactions.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No transactions yet</p>
                <Link href="/tester/available" className="mt-4 inline-block">
                  <Button variant="secondary" className="border-white/10">Browse Available Tests</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {displayTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'earning' ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
                        <ArrowUpRight className={`w-5 h-5 ${tx.type === 'earning' ? 'text-green-400' : 'text-blue-400'}`} />
                      </div>
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-sm text-gray-500">{tx.date}</p>
                      </div>
                    </div>
                    <span className={`font-semibold ${tx.type === 'earning' ? 'text-green-400' : 'text-blue-400'}`}>
                      {tx.type === 'earning' ? '+' : ''}${Math.abs(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {payoutError && (
            <p className="text-sm text-red-400">{payoutError}</p>
          )}
          <Card variant="glass" className="border-white/10">
            <h3 className="font-semibold mb-4 text-lg border-b border-white/5 pb-2">Payout Method</h3>
            {hasPayoutMethod === null ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : hasPayoutMethod ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded bg-green-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Bank account connected</p>
                    <p className="text-sm text-gray-400">Payouts go to your connected account</p>
                  </div>
                </div>
                {onboardError && (
                  <p className="text-sm text-red-400 mb-4">{onboardError}</p>
                )}
                <Button
                  variant="secondary"
                  className="w-full border-white/10"
                  disabled={onboardLoading}
                  onClick={async () => {
                    setOnboardLoading(true)
                    setOnboardError(null)
                    try {
                      const linkRes = await fetch('/api/stripe/connect/account-link', { method: 'POST' })
                      const linkData = await linkRes.json().catch(() => ({}))
                      if (!linkRes.ok) {
                        setOnboardError(linkData?.error ?? 'Failed to get payout link')
                        return
                      }
                      if (linkData?.url) window.location.href = linkData.url
                    } finally {
                      setOnboardLoading(false)
                    }
                  }}
                >
                  Update payout details
                </Button>
              </>
            ) : (
              <>
                {onboardError && (
                  <p className="text-sm text-red-400 mb-4">{onboardError}</p>
                )}
                <p className="text-sm text-gray-400 mb-4">Add a bank account to receive payouts.</p>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={onboardLoading}
                  onClick={async () => {
                    setOnboardLoading(true)
                    setOnboardError(null)
                    try {
                      const createRes = await fetch('/api/stripe/connect/create-account', { method: 'POST' })
                      const createData = await createRes.json().catch(() => ({}))
                      if (!createRes.ok) {
                        setOnboardError(createData?.error ?? 'Failed to create payout account')
                        return
                      }
                      const linkRes = await fetch('/api/stripe/connect/account-link', { method: 'POST' })
                      const linkData = await linkRes.json().catch(() => ({}))
                      if (!linkRes.ok) {
                        setOnboardError(linkData?.error ?? 'Failed to get payout link')
                        return
                      }
                      if (linkData?.url) window.location.href = linkData.url
                    } finally {
                      setOnboardLoading(false)
                    }
                  }}
                >
                  {onboardLoading ? 'Redirecting…' : 'Add payout method'}
                </Button>
              </>
            )}
          </Card>

          <Card variant="glass" className="border-white/10">
            <h3 className="font-semibold mb-4 text-lg border-b border-white/5 pb-2">Trust Level</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium capitalize">{trustLevel}</span>
              <span className="text-xs text-gray-500">{completedTasksCount} task{completedTasksCount !== 1 ? 's' : ''} completed</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Hold period: <strong className="text-white">{trustLevel === 'trusted' ? '0' : trustLevel === 'regular' ? '3' : '7'} days</strong>
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
