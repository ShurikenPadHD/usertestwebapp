'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { TestGrid, type TestListing } from '@/components/test/TestGrid'
import { Pagination } from '@/components/ui/Pagination'
import { Search, Flame, Clock, Smartphone, Sparkles } from 'lucide-react'
import { useWallet } from '@/hooks/useWallet'
interface AvailableTestsClientProps {
  tests: TestListing[]
}

type SortOption = 'recommended' | 'payout' | 'newest'

const CATEGORY_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'login_flow', label: 'Login Flow' },
  { value: 'checkout', label: 'Checkout' },
  { value: 'signup', label: 'Signup' },
  { value: 'navigation', label: 'Navigation' },
  { value: 'onboarding', label: 'Onboarding' },
]

const PLATFORM_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'web', label: 'Web' },
  { value: 'mobile_ios', label: 'Mobile (iOS)' },
  { value: 'mobile_android', label: 'Mobile (Android)' },
]

const DURATION_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'under5', label: '< 5 min' },
  { value: '5to10', label: '5–10 min' },
  { value: '10plus', label: '10+ min' },
]

const PAYOUT_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'under20', label: '< $20' },
  { value: '20to30', label: '$20–$30' },
  { value: '30plus', label: '$30+' },
]

const DIFFICULTY_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'Easy', label: 'Easy' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Hard', label: 'Hard' },
]

export function AvailableTestsClient({ tests }: AvailableTestsClientProps) {
  const { balance } = useWallet()
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [quickUnder5, setQuickUnder5] = useState(false)
  const [quickHighPaying, setQuickHighPaying] = useState(false)
  const [quickMobile, setQuickMobile] = useState(false)
  const [category, setCategory] = useState('')
  const [platform, setPlatform] = useState('')
  const [duration, setDuration] = useState('')
  const [payout, setPayout] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [sort, setSort] = useState<SortOption>('recommended')
  const itemsPerPage = 6

  const filteredTests = useMemo(() => {
    let result = tests.filter((test) => {
      const searchLower = search.trim().toLowerCase()
      const matchesSearch =
        !searchLower ||
        test.title.toLowerCase().includes(searchLower) ||
        test.appUrl.toLowerCase().includes(searchLower) ||
        (test.taskTypes ?? []).some((t) => t.toLowerCase().includes(searchLower.replace(/\s+/g, '_')))
      if (!matchesSearch) return false

      if (quickUnder5 && test.duration > 5) return false
      if (quickHighPaying && test.budget < 30) return false
      if (quickMobile) {
        const raw = test.platformRaw ?? 'web'
        if (raw !== 'mobile_ios' && raw !== 'mobile_android') return false
      }

      if (category) {
        const types = test.taskTypes ?? (test.taskType ? [test.taskType] : [])
        if (!types.includes(category)) return false
      }
      if (platform && (test.platformRaw ?? 'web') !== platform) return false

      if (duration) {
        if (duration === 'under5' && test.duration > 5) return false
        if (duration === '5to10' && (test.duration < 5 || test.duration > 10)) return false
        if (duration === '10plus' && test.duration < 10) return false
      }

      if (payout) {
        if (payout === 'under20' && test.budget >= 20) return false
        if (payout === '20to30' && (test.budget < 20 || test.budget > 30)) return false
        if (payout === '30plus' && test.budget < 30) return false
      }

      if (difficulty && test.difficulty !== difficulty) return false

      return true
    })

    if (sort === 'payout') {
      result = [...result].sort((a, b) => b.budget - a.budget)
    } else if (sort === 'newest') {
      result = [...result].sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return db - da
      })
    } else {
      result = [...result].sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return db - da
      })
    }

    return result
  }, [tests, search, quickUnder5, quickHighPaying, quickMobile, category, platform, duration, payout, difficulty, sort])

  const totalPages = Math.ceil(filteredTests.length / itemsPerPage)
  const paginatedTests = filteredTests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const hasActiveFilters =
    search.trim() ||
    quickUnder5 ||
    quickHighPaying ||
    quickMobile ||
    category ||
    platform ||
    duration ||
    payout ||
    difficulty

  const clearAllFilters = () => {
    setSearch('')
    setQuickUnder5(false)
    setQuickHighPaying(false)
    setQuickMobile(false)
    setCategory('')
    setPlatform('')
    setDuration('')
    setPayout('')
    setDifficulty('')
    setCurrentPage(1)
  }

  return (
    <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400 mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> New tasks added today
          </div>
          <h1 className="text-4xl font-bold mb-2 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Available Tests
          </h1>
          <p className="text-gray-400 text-base">Browse and claim tests to start earning money.</p>
        </div>

        <Link
          href="/tester/earnings"
          className="flex items-center gap-4 px-5 py-3 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 backdrop-blur-xl border border-green-500/20 hover:border-green-500/40 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] transition-all duration-300 group"
        >
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center border border-green-500/30">
            <span className="text-green-400 font-bold text-lg">$</span>
          </div>
          <div className="pr-2">
            <p className="text-[11px] uppercase tracking-wider text-green-400/80 font-semibold mb-0.5">
              Available Balance
            </p>
            <p className="font-bold text-2xl text-green-400 group-hover:text-green-300 transition-colors">
              ${((balance?.balance_cents ?? 0) / 100).toFixed(2)}
            </p>
          </div>
        </Link>
      </div>

      {/* Premium Filters & Search Container */}
      <Card variant="glass" className="p-2 mb-8 bg-[#1a1a1a]/60 backdrop-blur-2xl border-white/10 shadow-2xl">
        <div className="p-5 bg-[#0a0a0a]/60 rounded-xl border border-white/5">
          <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks by name or domain..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all duration-200 shadow-inner"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="default"
                className={`cursor-pointer border py-2 px-4 flex items-center gap-1.5 transition-colors duration-200 shadow-sm ${
                  quickUnder5 ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 border-white/10'
                }`}
                onClick={() => { setQuickUnder5((v) => !v); setCurrentPage(1) }}
              >
                <Clock className="w-3.5 h-3.5" /> &lt; 5 mins
              </Badge>
              <Badge
                variant="default"
                className={`cursor-pointer border py-2 px-4 flex items-center gap-1.5 transition-colors duration-200 shadow-sm ${
                  quickHighPaying ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-white/5 hover:bg-orange-500/20 hover:text-orange-400 border-white/10'
                }`}
                onClick={() => { setQuickHighPaying((v) => !v); setCurrentPage(1) }}
              >
                <Flame className="w-3.5 h-3.5 text-orange-400" /> High Paying
              </Badge>
              <Badge
                variant="default"
                className={`cursor-pointer border py-2 px-4 flex items-center gap-1.5 transition-colors duration-200 shadow-sm ${
                  quickMobile ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 border-white/10'
                }`}
                onClick={() => { setQuickMobile((v) => !v); setCurrentPage(1) }}
              >
                <Smartphone className="w-3.5 h-3.5" /> Mobile Apps
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-white/5">
            <span className="text-sm font-medium text-gray-500 mr-2">Filters:</span>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setCurrentPage(1) }}
              className="h-9 bg-white/5 border border-white/10 rounded-lg px-3 text-gray-300 text-xs focus:outline-none focus:border-blue-500/50 cursor-pointer"
            >
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value || 'all'} value={o.value} className="bg-[#1a1a1a]">{o.label}</option>
              ))}
            </select>
            <select
              value={platform}
              onChange={(e) => { setPlatform(e.target.value); setCurrentPage(1) }}
              className="h-9 bg-white/5 border border-white/10 rounded-lg px-3 text-gray-300 text-xs focus:outline-none focus:border-blue-500/50 cursor-pointer"
            >
              {PLATFORM_OPTIONS.map((o) => (
                <option key={o.value || 'all'} value={o.value} className="bg-[#1a1a1a]">{o.label}</option>
              ))}
            </select>
            <select
              value={duration}
              onChange={(e) => { setDuration(e.target.value); setCurrentPage(1) }}
              className="h-9 bg-white/5 border border-white/10 rounded-lg px-3 text-gray-300 text-xs focus:outline-none focus:border-blue-500/50 cursor-pointer"
            >
              {DURATION_OPTIONS.map((o) => (
                <option key={o.value || 'all'} value={o.value} className="bg-[#1a1a1a]">{o.label}</option>
              ))}
            </select>
            <select
              value={payout}
              onChange={(e) => { setPayout(e.target.value); setCurrentPage(1) }}
              className="h-9 bg-white/5 border border-white/10 rounded-lg px-3 text-gray-300 text-xs focus:outline-none focus:border-blue-500/50 cursor-pointer"
            >
              {PAYOUT_OPTIONS.map((o) => (
                <option key={o.value || 'all'} value={o.value} className="bg-[#1a1a1a]">{o.label}</option>
              ))}
            </select>
            <select
              value={difficulty}
              onChange={(e) => { setDifficulty(e.target.value); setCurrentPage(1) }}
              className="h-9 bg-white/5 border border-white/10 rounded-lg px-3 text-gray-300 text-xs focus:outline-none focus:border-blue-500/50 cursor-pointer"
            >
              {DIFFICULTY_OPTIONS.map((o) => (
                <option key={o.value || 'all'} value={o.value} className="bg-[#1a1a1a]">{o.label}</option>
              ))}
            </select>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                className="text-gray-500 hover:text-white ml-auto text-xs h-9"
                onClick={clearAllFilters}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Results Count & Sort Dropdown */}
      <div className="flex items-center justify-between mb-6 px-1">
        <p className="text-gray-400 text-sm font-medium">
          Showing <span className="text-white">{filteredTests.length}</span> available tests
        </p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500 font-medium">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 cursor-pointer shadow-sm"
          >
            <option value="recommended" className="bg-[#1a1a1a]">Recommended</option>
            <option value="payout" className="bg-[#1a1a1a]">Highest Payout</option>
            <option value="newest" className="bg-[#1a1a1a]">Newest</option>
          </select>
        </div>
      </div>

      {/* Test Grid */}
      <TestGrid tests={paginatedTests} />

      {/* Empty State */}
      {filteredTests.length === 0 && (
        <Card variant="glass" className="text-center py-24 bg-[#1a1a1a]/40 border-white/5 mt-8">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
            <Search className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No tests found</h3>
          <p className="text-gray-400 mb-6">
            We couldn&apos;t find any tests matching your current filters.
          </p>
          <Button
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            onClick={clearAllFilters}
          >
            Clear all filters
          </Button>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  )
}
