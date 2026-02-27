'use client'

import { TestCard, type TestListing, type TestStatus } from './TestCard'
import { FadeIn } from '@/components/ui/FadeIn'

export type { TestListing }

interface TestGridProps {
  tests: TestListing[]
  statusMap?: Record<string, TestStatus> // id -> status
  animate?: boolean
}

export function TestGrid({ tests, statusMap = {}, animate = true }: TestGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tests.map((test, index) => (
        <FadeIn key={test.id} delay={animate ? index * 60 : 0}>
          <TestCard test={test} status={statusMap[test.id] || 'available'} />
        </FadeIn>
      ))}
    </div>
  )
}
