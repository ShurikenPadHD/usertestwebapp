'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { User, Bell, CreditCard, Shield, Save } from 'lucide-react'

export default function SettingsPage() {
  const [hasPayoutMethod, setHasPayoutMethod] = useState<boolean | null>(null)
  const [trustLevel, setTrustLevel] = useState<string>('new')
  const [completedTasksCount, setCompletedTasksCount] = useState(0)
  const [onboardLoading, setOnboardLoading] = useState(false)

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

  async function handleAddOrUpdatePayoutMethod() {
    setOnboardLoading(true)
    try {
      let res = await fetch('/api/stripe/connect/create-account', { method: 'POST' })
      const createData = res.ok ? await res.json() : null
      const accountId = createData?.account_id
      if (!accountId) {
        setOnboardLoading(false)
        return
      }
      res = await fetch('/api/stripe/connect/account-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ return_path: '/tester/settings' }),
      })
      const linkData = res.ok ? await res.json() : null
      const url = linkData?.url
      if (url) window.location.href = url
      else setOnboardLoading(false)
    } catch {
      setOnboardLoading(false)
    }
  }

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mt-4">Settings</h1>
        <p className="text-gray-400 mt-2">Manage your account preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold">Profile</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Full Name</label>
              <input 
                type="text" 
                defaultValue="Alex Tester"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Email</label>
              <input 
                type="email" 
                defaultValue="alex@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-gray-400">Bio</label>
              <textarea 
                rows={3}
                placeholder="Tell us about your testing experience..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 placeholder:text-gray-600"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button>
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </Button>
          </div>
        </Card>

        {/* Payment Method */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-semibold">Payout Method</h2>
          </div>

          {hasPayoutMethod === null ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : hasPayoutMethod ? (
            <>
              <div className="p-4 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-green-600/80 rounded flex items-center justify-center text-xs font-bold text-white">
                    Bank
                  </div>
                  <div>
                    <p className="font-medium">Bank account connected</p>
                    <p className="text-sm text-gray-400">Payouts go to your linked account</p>
                  </div>
                </div>
                <Badge variant="success">Connected</Badge>
              </div>
              <Button
                variant="secondary"
                className="mt-4 border-white/10"
                onClick={handleAddOrUpdatePayoutMethod}
                disabled={onboardLoading}
              >
                {onboardLoading ? 'Redirecting…' : 'Update payout details'}
              </Button>
            </>
          ) : (
            <div className="p-4 rounded-lg bg-white/5 border border-white/5">
              <p className="text-sm text-gray-400 mb-4">Add a bank account to receive payouts.</p>
              <Button onClick={handleAddOrUpdatePayoutMethod} disabled={onboardLoading}>
                {onboardLoading ? 'Redirecting…' : 'Add payout method'}
              </Button>
            </div>
          )}
        </Card>

        {/* Notifications */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            {[
              { label: 'New test assignments', desc: 'Get notified when new tests match your preferences' },
              { label: 'Submission updates', desc: 'Know when your submissions are approved or rejected' },
              { label: 'Payout confirmations', desc: 'Receive confirmation when payouts are processed' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5">
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </Card>

        {/* Trust Level */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-green-400" />
            <h2 className="text-xl font-semibold">Trust Level</h2>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant={trustLevel === 'trusted' ? 'success' : trustLevel === 'regular' ? 'default' : 'info'}>
                  {trustLevel === 'trusted' ? 'Trusted' : trustLevel === 'regular' ? 'Regular' : 'New'}
                </Badge>
                <span className="text-gray-400">{completedTasksCount} task{completedTasksCount !== 1 ? 's' : ''} completed</span>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                {trustLevel === 'trusted' ? '0' : trustLevel === 'regular' ? '3' : '7'}‑day payout hold
                {trustLevel !== 'new' && ' • Priority access to high-paying tests'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
