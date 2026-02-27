import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { AddFundsButton } from '@/components/wallet/AddFundsButton'
import { UpdatePaymentMethodButton } from '@/components/wallet/UpdatePaymentMethodButton'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { getDefaultPaymentMethod } from '@/lib/stripe'

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default async function DevPaymentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/dev/signin')

  const profile = await db.profiles.findById(user.id)
  const stripeCustomerId = (profile as { stripe_customer_id?: string } | null)?.stripe_customer_id
  const paymentMethod = stripeCustomerId ? await getDefaultPaymentMethod(stripeCustomerId) : null

  const { balanceCents, pendingCents } = await db.wallets.getBalance(user.id)
  const transactions = await db.walletTransactions.findByUser(user.id, 20, 0)
  const pendingTasks = await db.tasks.findPendingReviewsByDeveloper(user.id)

  const pendingTotal = pendingTasks.reduce((s, t) => s + t.cost, 0)
  const pendingCount = pendingTasks.reduce((s, t) => s + t.testers, 0)

  const mappedTransactions = transactions.map((tx) => {
    const meta = (tx.metadata as Record<string, unknown>) ?? {}
    const taskTitle = (meta.task_title as string) ?? 'Add funds'
    const amount = Number(tx.amount_cents)
    return {
      date: formatDate(tx.created_at),
      task: tx.type === 'deposit' ? 'Add funds' : taskTitle,
      amount: amount / 100,
      status: tx.status === 'completed' ? 'Paid' : 'Pending',
    }
  })

  return (
    <div className="flex-1 p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mt-4">Payments</h1>
        <p className="text-gray-400 mt-2">Manage your testing budget and track spending.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Balance Card */}
        <Card variant="glass" className="md:col-span-2 border-blue-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-gray-400 mb-1">Current Balance</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-blue-400">${(balanceCents / 100).toFixed(2)}</span>
                <span className="text-gray-500 text-sm">USD</span>
              </div>
            </div>
            <AddFundsButton />
          </div>
        </Card>

        {/* Pending Card */}
        <Card variant="glass" className="border-white/10 flex flex-col justify-center">
          <p className="text-gray-400 text-sm mb-2">Pending Tasks</p>
          <p className="text-2xl font-semibold mb-4">${pendingTotal.toFixed(2)}</p>
          <div className="flex items-center gap-2 text-sm text-yellow-400 bg-yellow-400/10 px-3 py-2 rounded-lg">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {pendingCount} submission{pendingCount !== 1 ? 's' : ''} awaiting review
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transaction History */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold">Transaction History</h2>
          <Card variant="glass" className="!p-0 border-white/10 overflow-hidden">
            <div className="divide-y divide-white/5">
              {mappedTransactions.map((tx, i) => (
                <div key={i} className="p-4 hover:bg-white/[0.02] transition flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9l-6 6m0 0l-6-6m6 6V5a2 2 0 014 0v14a2 2 0 01-4 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">{tx.task}</p>
                      <p className="text-sm text-gray-400">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                    </p>
                    <Badge variant="success" className="mt-1">{tx.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-white/5 text-center">
              <button className="text-sm text-blue-400 hover:text-blue-300">View all transactions</button>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card variant="glass" className="border-white/10">
            <h3 className="font-semibold mb-4 text-lg border-b border-white/5 pb-2">Pending Reviews</h3>
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <a key={task.taskId} href={`/dev/tasks/${task.taskId}`} className="block">
                  <div className="flex justify-between items-center p-3 bg-white/[0.02] rounded-lg hover:bg-white/[0.04] transition">
                    <div>
                      <p className="font-medium text-sm">{task.task}</p>
                      <p className="text-xs text-gray-400">{task.testers} submission(s)</p>
                    </div>
                    <span className="text-yellow-400 font-semibold">${task.cost}</span>
                  </div>
                </a>
              ))}
              {pendingTasks.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">No pending reviews</p>
              )}
            </div>
          </Card>

          <Card variant="glass" className="border-white/10">
            <h3 className="font-semibold mb-4 text-lg border-b border-white/5 pb-2">Payment Method</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z"/>
                </svg>
              </div>
              <div>
                <p className="font-medium">
                  {paymentMethod ? `${paymentMethod.brand.charAt(0).toUpperCase() + paymentMethod.brand.slice(1)}` : 'No payment method'}
                </p>
                <p className="text-sm text-gray-400">
                  {paymentMethod?.last4 ? `•••• ${paymentMethod.last4}` : 'Add a card to fund your wallet'}
                </p>
              </div>
            </div>
            <UpdatePaymentMethodButton />
          </Card>
        </div>
      </div>
    </div>
  )
}
