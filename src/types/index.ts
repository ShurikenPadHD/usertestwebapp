// User types
export type UserRole = 'developer' | 'tester'

export interface User {
  id: string
  email: string
  role: UserRole
  firstName?: string
  lastName?: string
  experience?: string
  companyName?: string
  createdAt: Date
}

// Task types
export type TaskStatus = 'posted' | 'claimed' | 'submitted' | 'completed'

export type TaskType = 'login_flow' | 'checkout' | 'signup' | 'navigation' | 'onboarding'
export type TaskDifficulty = 'easy' | 'medium' | 'hard'
export type TaskPlatform = 'web' | 'mobile_ios' | 'mobile_android'

export interface Task {
  id: string
  developerId: string
  appUrl: string
  instructions: string
  budget: number
  status: TaskStatus
  createdAt: Date
  assignedTesterId?: string
  taskType?: TaskType
  title?: string
  maxTesters?: number
  estimatedDurationMinutes?: number
  difficulty?: TaskDifficulty
  platform?: TaskPlatform
  platformFeePercent?: number
}

// Submission types
export type SubmissionStatus = 'pending' | 'approved' | 'rejected'

export interface Submission {
  id: string
  taskId: string
  testerId: string
  videoUrl: string
  duration: number
  status: SubmissionStatus
  developerRating?: number
  developerFeedback?: string
  createdAt: Date
}

// Wallet types
export type WalletTransactionType = 'deposit' | 'test_reserve' | 'test_release' | 'payout'
export type WalletTransactionStatus = 'pending' | 'completed'

export interface Wallet {
  id: string
  userId: string
  balanceCents: number
  currency: string
  createdAt: Date
  updatedAt: Date
}

export interface WalletTransaction {
  id: string
  userId: string
  type: WalletTransactionType
  amountCents: number
  status: WalletTransactionStatus
  metadata?: Record<string, unknown>
  availableAt?: Date | null
  createdAt: Date
}

// Payment types
export type PaymentStatus = 'held' | 'released' | 'disputed'

export interface Payment {
  id: string
  taskId: string
  submissionId: string
  amount: number
  testerEarnings: number
  platformFee: number
  status: PaymentStatus
  releasedAt?: Date
}
