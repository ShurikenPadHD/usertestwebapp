/** Format a date for "time ago" display */
export function formatTimeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString()
}

/** Map DB platform to display label for tester marketplace */
export function platformDisplayLabel(platform: string | null | undefined): string {
  if (!platform) return 'Web'
  if (platform === 'mobile_ios' || platform === 'mobile_android') return 'Mobile'
  return platform === 'web' ? 'Web' : platform
}

/** Map DB difficulty to TestCard format (Easy, Medium, Hard) */
export function difficultyDisplayLabel(difficulty: string | null | undefined): 'Easy' | 'Medium' | 'Hard' {
  if (!difficulty) return 'Medium'
  const d = difficulty.toLowerCase()
  if (d === 'easy') return 'Easy'
  if (d === 'hard') return 'Hard'
  return 'Medium'
}

/** Map DB task_type to display label for category filter */
export function taskTypeDisplayLabel(taskType: string | null | undefined): string {
  if (!taskType) return 'Other'
  const labels: Record<string, string> = {
    login_flow: 'Login Flow',
    checkout: 'Checkout',
    signup: 'Signup',
    navigation: 'Navigation',
    onboarding: 'Onboarding',
  }
  return labels[taskType] ?? taskType
}

/** Map DB task_status to display label */
export function taskStatusLabel(status: string): string {
  switch (status) {
    case 'draft': return 'Draft'
    case 'posted': return 'Posted'
    case 'claimed': return 'In Progress'
    case 'submitted': return 'In Review'
    case 'completed': return 'Completed'
    default: return status
  }
}
