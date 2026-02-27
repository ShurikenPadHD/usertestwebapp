'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Star, ShieldCheck, Clock } from 'lucide-react'

export type TestStatus = 'available' | 'claimed' | 'submitted'

export interface TestListing {
  id: string
  title: string
  appUrl: string
  budget: number
  duration: number // minutes
  difficulty: 'Easy' | 'Medium' | 'Hard'
  postedAt: string // relative time
  platform?: string // display label (Web, Mobile)
  platformRaw?: string // db value: web, mobile_ios, mobile_android
  taskType?: string // primary for backward compat
  taskTypes?: string[] // multi-select + custom keywords
  createdAt?: string // ISO for sort
  developer?: string
  rating?: string
}

interface TestCardProps {
  test: TestListing
  status?: TestStatus
}

export function TestCard({ test, status = 'available' }: TestCardProps) {
  const isDisabled = status !== 'available'
  
  return (
    <Card 
      variant="glass" 
      className={`group relative overflow-hidden hover:border-blue-500/30 transition-all duration-300 flex flex-col h-full bg-gradient-to-b from-[#1a1a1a]/90 to-[#0a0a0a]/90 border-white/10 hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)] backdrop-blur-xl ${isDisabled ? 'opacity-60' : ''}`}
    >
      {/* Subtle top edge highlight */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="p-6 flex-1 flex flex-col">
        {/* Header: Avatar and Difficulty */}
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/5 flex items-center justify-center shadow-inner">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-bold text-lg">
              {test.appUrl.charAt(0).toUpperCase()}
            </span>
          </div>
          <Badge variant="default" className="text-[10px] px-2.5 py-1 bg-white/5 text-gray-300 border-white/10 backdrop-blur-md font-medium tracking-wide">
            {test.difficulty}
          </Badge>
        </div>

        {/* Title and Domain */}
        <div className="mb-4 flex-1">
          <h3 className="text-lg font-semibold mb-1 group-hover:text-blue-400 transition-colors duration-200 line-clamp-1 text-white tracking-tight">
            {test.title}
          </h3>
          <p className="text-sm text-gray-400 mb-4">{test.appUrl}</p>
          
          <div className="flex flex-wrap items-center gap-2">
            {test.platform && (
              <span className="flex items-center text-[11px] font-medium text-gray-400 bg-black/40 px-2.5 py-1.5 rounded-md border border-white/5">
                {test.platform}
              </span>
            )}
            <span className="flex items-center text-[11px] font-medium text-gray-400 bg-black/40 px-2.5 py-1.5 rounded-md border border-white/5">
              <Clock className="w-3.5 h-3.5 mr-1.5 opacity-70" /> {test.duration} min
            </span>
          </div>
        </div>

        {/* Payout & Developer Info */}
        <div className="pt-4 border-t border-white/5 flex items-end justify-between">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5">
              Payout
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
            </p>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
              ${test.budget}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 mb-1.5">
              <span className="text-xs font-medium text-gray-300">{test.developer || 'UserTest'}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            </div>
            {test.rating && (
              <div className="flex items-center justify-end text-[11px] text-gray-500">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-1" />
                {test.rating}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Action Footer */}
      <div className="px-6 pb-6 mt-auto">
        {isDisabled ? (
          <Button 
            disabled 
            className="w-full h-11 text-sm bg-white/5 border-white/5 text-gray-500"
            variant="secondary"
          >
            {status === 'claimed' ? 'In Progress' : 'Submitted'}
          </Button>
        ) : (
          <Link href={`/tester/tasks/${test.id}`} className="block">
            <Button className="w-full h-11 text-sm bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 hover:from-blue-600 hover:to-purple-600 hover:text-white border border-blue-500/20 hover:border-blue-500/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300 group-hover:from-blue-600/30 group-hover:to-purple-600/30">
              Start Test
            </Button>
          </Link>
        )}
      </div>
    </Card>
  )
}
