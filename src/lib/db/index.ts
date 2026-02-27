import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const db = {
  tasks: {
    async create(data: {
      developerId: string
      appUrl: string
      instructions?: string
      budget: number
      taskType?: string
      taskTypes?: string[]
      title?: string
      maxTesters?: number
      estimatedDurationMinutes?: number
      difficulty?: string
      platform?: string
      about?: string
      requirements?: string[]
      steps?: string[]
      id?: string
    }) {
      const supabase = await createClient()
      const instructions =
        data.instructions ??
        (data.steps?.length ? data.steps.join('\n') : '')
      const payload: Record<string, unknown> = {
        developer_id: data.developerId,
        app_url: data.appUrl,
        instructions: instructions || null,
        budget: data.budget,
        status: 'posted',
      }
      const PREDEFINED_TASK_TYPES = ['login_flow', 'checkout', 'signup', 'navigation', 'onboarding']
      if (data.id) payload.id = data.id
      if (data.taskType) payload.task_type = data.taskType
      if (data.taskTypes?.length) {
        payload.task_types = data.taskTypes
        if (!data.taskType) {
          const firstPredefined = data.taskTypes.find((t) => PREDEFINED_TASK_TYPES.includes(t))
          if (firstPredefined) payload.task_type = firstPredefined
        }
      }
      if (data.title) payload.title = data.title
      if (data.maxTesters != null) payload.max_testers = data.maxTesters
      if (data.estimatedDurationMinutes != null) payload.estimated_duration_minutes = data.estimatedDurationMinutes
      if (data.difficulty) payload.difficulty = data.difficulty
      if (data.platform) payload.platform = data.platform
      if (data.about) payload.about = data.about
      if (data.requirements?.length) payload.requirements = data.requirements
      if (data.steps?.length) payload.steps = data.steps

      const { data: task, error } = await supabase
        .from('tasks')
        .insert(payload)
        .select()
        .single()
      if (error) throw error
      return task
    },

    async findById(id: string) {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },

    async findByDeveloper(developerId: string) {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('developer_id', developerId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },

    async findPosted() {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'posted')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },

    async findPendingReviewsByDeveloper(developerId: string) {
      const supabase = await createClient()
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('id, title, budget')
        .eq('developer_id', developerId)
        .in('status', ['submitted', 'claimed'])
        .order('created_at', { ascending: false })
      if (error) throw error
      if (!tasks?.length) return []
      const taskIds = tasks.map((t) => t.id)
      const { data: subs } = await supabase
        .from('submissions')
        .select('task_id')
        .in('task_id', taskIds)
        .eq('status', 'pending')
      const pendingByTask = (subs ?? []).reduce<Record<string, number>>((acc, s) => {
        acc[s.task_id] = (acc[s.task_id] ?? 0) + 1
        return acc
      }, {})
      return tasks
        .filter((t) => (pendingByTask[t.id] ?? 0) > 0)
        .map((t) => ({
          taskId: t.id,
          task: t.title ?? 'Untitled',
          testers: pendingByTask[t.id] ?? 0,
          cost: Number(t.budget) * (pendingByTask[t.id] ?? 0),
        }))
    },

    async updateStatus(
      id: string,
      status: string,
      assignedTesterId?: string,
      claimExpiresAt?: string
    ) {
      const supabase = await createClient()
      const payload: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      }
      if (assignedTesterId !== undefined) payload.assigned_tester_id = assignedTesterId
      if (claimExpiresAt !== undefined) payload.claim_expires_at = claimExpiresAt
      const { data, error } = await supabase
        .from('tasks')
        .update(payload)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },

    /**
     * Update task status on tester submit. Only succeeds if assigned_tester_id IS NULL
     * or equals testerId (prevents race when two testers submit same task).
     * @throws Error('Task already claimed') if another tester already claimed
     */
    async updateStatusOnSubmit(taskId: string, testerId: string) {
      const admin = createAdminClient()
      const { data, error } = await admin
        .from('tasks')
        .update({
          status: 'submitted',
          assigned_tester_id: testerId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .or(`assigned_tester_id.is.null,assigned_tester_id.eq.${testerId}`)
        .select()
        .single()
      if (error) {
        if (error.code === 'PGRST116' || error.message?.includes('0 rows')) {
          throw new Error('Task already claimed')
        }
        throw error
      }
      return data!
    },
  },

  submissions: {
    async create(data: {
      taskId: string
      testerId: string
      videoUrl: string
      videoDurationSeconds: number
      notes?: string
      aiAnalysis?: {
        relevanceScore: number
        requirementsMet: string[]
        requirementsMissed: string[]
        effortScore: number
        qualityScore: number
        issues: string[]
        summary: string
        isValid: boolean
        submittedAt: string
      } | null
    }) {
      const supabase = await createClient()
      const { data: sub, error } = await supabase
        .from('submissions')
        .insert({
          task_id: data.taskId,
          tester_id: data.testerId,
          video_url: data.videoUrl,
          video_duration_seconds: data.videoDurationSeconds,
          notes: data.notes ?? null,
          ai_analysis: data.aiAnalysis ?? null,
        })
        .select()
        .single()
      if (error) throw error
      return sub
    },

    async findByTask(taskId: string) {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('task_id', taskId)
      if (error) throw error
      return data ?? []
    },

    async findByTester(testerId: string) {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('tester_id', testerId)
        .order('submitted_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },

    async updateStatus(
      id: string,
      status: string,
      developerRating?: number,
      developerFeedback?: string
    ) {
      const supabase = await createClient()
      const payload: Record<string, unknown> = {
        status,
        reviewed_at: new Date().toISOString(),
      }
      if (developerRating != null) payload.developer_rating = developerRating
      if (developerFeedback != null) payload.developer_feedback = developerFeedback
      const { data, error } = await supabase
        .from('submissions')
        .update(payload)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },

    /**
     * DEBUG ONLY: Cancel submission and restore task to available.
     * Only works when NODE_ENV=development. Use for debugging without recreating tasks.
     */
    async cancelForDebug(submissionId: string, testerId: string, taskId: string) {
      if (process.env.NODE_ENV !== 'development') {
        throw new Error('cancelForDebug is only available in development')
      }
      const admin = createAdminClient()
      const { data: sub } = await admin
        .from('submissions')
        .select('id, tester_id, task_id')
        .eq('id', submissionId)
        .single()
      if (!sub || sub.tester_id !== testerId) {
        throw new Error('Submission not found or not yours')
      }
      await admin.from('submissions').delete().eq('id', submissionId)
      const { count } = await admin
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('task_id', taskId)
      if ((count ?? 0) === 0) {
        await admin
          .from('tasks')
          .update({
            status: 'posted',
            assigned_tester_id: null,
            claim_expires_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', taskId)
      }
      return { ok: true }
    },
  },

  profiles: {
    async findByIds(ids: string[]) {
      if (ids.length === 0) return []
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', ids)
      if (error) throw error
      return data ?? []
    },

    async findById(id: string) {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('id, trust_level, role, stripe_customer_id, stripe_account_id, completed_tasks_count')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },

    async updateStripeAccountId(userId: string, stripeAccountId: string) {
      const admin = createAdminClient()
      const { error } = await admin
        .from('profiles')
        .update({
          stripe_account_id: stripeAccountId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
      if (error) throw error
    },

    async updateStripeCustomerId(userId: string, stripeCustomerId: string) {
      const admin = createAdminClient()
      const { error } = await admin
        .from('profiles')
        .update({
          stripe_customer_id: stripeCustomerId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
      if (error) throw error
    },

    /** Increment completed_tasks_count and promote trust_level on approval. */
    async incrementCompletedAndPromoteTrust(testerId: string) {
      const admin = createAdminClient()
      const { data: p } = await admin
        .from('profiles')
        .select('completed_tasks_count, trust_level')
        .eq('id', testerId)
        .single()
      const current = Number(p?.completed_tasks_count) ?? 0
      const next = current + 1
      const trustLevel =
        next >= 20 ? 'trusted' : next >= 5 ? 'regular' : (p?.trust_level as string) ?? 'new'
      const { error } = await admin
        .from('profiles')
        .update({
          completed_tasks_count: next,
          trust_level: trustLevel,
          updated_at: new Date().toISOString(),
        })
        .eq('id', testerId)
      if (error) throw error
    },

    /** Sync first_name, last_name, email from OAuth user_metadata (e.g. Google full_name) */
    async syncFromAuthMetadata(userId: string, metadata: Record<string, unknown> | null) {
      const m = metadata ?? {}
      const fullName = (m.full_name ?? m.name) as string | undefined
      const givenName = m.given_name as string | undefined
      const familyName = m.family_name as string | undefined
      const email = m.email as string | undefined
      let firstName = givenName ?? (fullName ? fullName.split(' ')[0]?.trim() : null)
      let lastName = familyName ?? null
      if (!lastName && fullName && fullName.includes(' ')) {
        lastName = fullName.split(' ').slice(1).join(' ').trim() || null
      }
      const admin = createAdminClient()
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (firstName) updates.first_name = firstName
      if (lastName) updates.last_name = lastName
      if (email) updates.email = email
      if (Object.keys(updates).length <= 1) return
      const { error } = await admin.from('profiles').update(updates).eq('id', userId)
      if (error) throw error
    },
  },

  wallets: {
    async getOrCreate(userId: string) {
      const admin = createAdminClient()
      const { data: existing } = await admin
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single()
      if (existing) return existing
      const { data: wallet, error } = await admin
        .from('wallets')
        .insert({ user_id: userId })
        .select()
        .single()
      if (error) throw error
      return wallet
    },

    async settle(userId: string) {
      const admin = createAdminClient()
      const now = new Date().toISOString()
      const { data: pending } = await admin
        .from('wallet_transactions')
        .select('id, amount_cents')
        .eq('user_id', userId)
        .eq('type', 'test_release')
        .eq('status', 'pending')
        .not('available_at', 'is', null)
        .lte('available_at', now)
      if (!pending?.length) return
      const totalCents = pending.reduce((s, t) => s + Number(t.amount_cents), 0)
      const ids = pending.map((t) => t.id)
      await admin.from('wallet_transactions').update({ status: 'completed' }).in('id', ids)
      const { data: wallet } = await admin.from('wallets').select('balance_cents').eq('user_id', userId).single()
      if (wallet) {
        await admin
          .from('wallets')
          .update({
            balance_cents: Number(wallet.balance_cents) + totalCents,
            updated_at: now,
          })
          .eq('user_id', userId)
      }
    },

    async getBalance(userId: string) {
      await this.settle(userId)
      const admin = createAdminClient()
      const { data: wallet } = await admin.from('wallets').select('balance_cents').eq('user_id', userId).single()
      const { data: pendingRows } = await admin
        .from('wallet_transactions')
        .select('amount_cents')
        .eq('user_id', userId)
        .eq('type', 'test_release')
        .eq('status', 'pending')
        .not('available_at', 'is', null)
        .gt('available_at', new Date().toISOString())
      const balanceCents = wallet ? Number(wallet.balance_cents) : 0
      const pendingCents = pendingRows?.reduce((s, r) => s + Number(r.amount_cents), 0) ?? 0
      return { balanceCents, pendingCents }
    },

    async reserve(developerId: string, amountCents: number, metadata: Record<string, unknown>) {
      const admin = createAdminClient()
      const wallet = await this.getOrCreate(developerId)
      if (Number(wallet.balance_cents) < amountCents) {
        throw new Error('Insufficient funds')
      }
      const now = new Date().toISOString()
      await admin.from('wallet_transactions').insert({
        user_id: developerId,
        type: 'test_reserve',
        amount_cents: -amountCents,
        status: 'completed',
        metadata,
        created_at: now,
      })
      await admin
        .from('wallets')
        .update({
          balance_cents: Number(wallet.balance_cents) - amountCents,
          updated_at: now,
        })
        .eq('user_id', developerId)
    },

    async deposit(userId: string, amountCents: number, metadata: Record<string, unknown>) {
      await this.credit(userId, amountCents, 'deposit', metadata)
    },

    async credit(userId: string, amountCents: number, type: 'deposit' | 'test_release', metadata: Record<string, unknown>, availableAt?: string) {
      const admin = createAdminClient()
      const wallet = await this.getOrCreate(userId)
      const now = new Date().toISOString()
      const isPending = type === 'test_release' && availableAt && new Date(availableAt) > new Date()
      await admin.from('wallet_transactions').insert({
        user_id: userId,
        type,
        amount_cents: amountCents,
        status: isPending ? 'pending' : 'completed',
        metadata,
        available_at: availableAt ?? now,
      })
      if (!isPending) {
        await admin
          .from('wallets')
          .update({
            balance_cents: Number(wallet.balance_cents) + amountCents,
            updated_at: now,
          })
          .eq('user_id', userId)
      }
    },

    async creditTester(testerId: string, amountCents: number, metadata: Record<string, unknown>, availableAt: string) {
      await this.credit(testerId, amountCents, 'test_release', metadata, availableAt)
    },

    /** Debit wallet for payout; throws if insufficient balance. */
    async debitForPayout(userId: string, amountCents: number): Promise<void> {
      const admin = createAdminClient()
      const wallet = await this.getOrCreate(userId)
      const balance = Number(wallet.balance_cents)
      if (balance < amountCents) {
        throw new Error('Insufficient balance')
      }
      const now = new Date().toISOString()
      await admin.from('wallet_transactions').insert({
        user_id: userId,
        type: 'payout',
        amount_cents: -amountCents,
        status: 'completed',
        metadata: {},
        created_at: now,
      })
      await admin
        .from('wallets')
        .update({
          balance_cents: balance - amountCents,
          updated_at: now,
        })
        .eq('user_id', userId)
    },
  },

  walletTransactions: {
    async findByUser(userId: string, limit = 20, offset = 0) {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
      if (error) throw error
      return data ?? []
    },
  },

  payments: {
    async create(data: {
      taskId: string
      submissionId: string
      developerId: string
      testerId: string
      amount: number
      testerEarnings: number
      platformFee: number
    }) {
      const admin = createAdminClient()
      const { data: tx, error } = await admin
        .from('transactions')
        .insert({
          task_id: data.taskId,
          submission_id: data.submissionId,
          developer_id: data.developerId,
          tester_id: data.testerId,
          amount: data.amount,
          tester_earnings: data.testerEarnings,
          platform_fee: data.platformFee,
        })
        .select()
        .single()
      if (error) throw error
      return tx
    },

    async release(transactionId: string) {
      const admin = createAdminClient()
      const { data, error } = await admin
        .from('transactions')
        .update({
          status: 'released',
          released_at: new Date().toISOString(),
        })
        .eq('id', transactionId)
        .select()
        .single()
      if (error) throw error
      return data
    },

    async findByTester(testerId: string) {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('tester_id', testerId)
      if (error) throw error
      return data ?? []
    },
  },
}
