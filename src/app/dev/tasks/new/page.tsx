'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { createTask } from './actions'
import { Plus, Trash2, GripVertical, Save, Rocket, X } from 'lucide-react'

const TASK_TYPES = [
  { label: 'Login Flow', value: 'login_flow' },
  { label: 'Checkout', value: 'checkout' },
  { label: 'Signup', value: 'signup' },
  { label: 'Navigation', value: 'navigation' },
  { label: 'Onboarding', value: 'onboarding' },
] as const

const DIFFICULTY_OPTIONS = [
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard', value: 'hard' },
] as const

const PLATFORM_OPTIONS = [
  { label: 'Web', value: 'web' },
  { label: 'iOS', value: 'mobile_ios' },
  { label: 'Android', value: 'mobile_android' },
] as const

const DURATION_OPTIONS = [3, 5, 8, 10, 15, 20]

const PLATFORM_FEE_PERCENT = 20

const DEFAULT_REQUIREMENTS = [
  'Record your screen with audio',
  'Voice narration required',
  'Show your actual screen (no fake apps)',
]

function DynamicList({
  items,
  onChange,
  placeholder,
  addLabel,
  renderInput,
  showDragHandle = false,
}: {
  items: string[]
  onChange: (items: string[]) => void
  placeholder: string
  addLabel: string
  renderInput: (value: string, onChange: (v: string) => void) => React.ReactNode
  showDragHandle?: boolean
}) {
  const update = (i: number, v: string) => {
    const next = [...items]
    next[i] = v
    onChange(next)
  }
  const add = () => onChange([...items, ''])
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i))

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-start group">
          {showDragHandle && (
            <div className="p-2 text-gray-600 hover:text-gray-400 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-4 h-4" />
            </div>
          )}
          <span className="w-6 h-6 rounded bg-white/10 text-xs flex items-center justify-center text-gray-400 mt-2 shrink-0">
            {i + 1}
          </span>
          <div className="flex-1">{renderInput(item, (v) => update(i, v))}</div>
          <button
            type="button"
            onClick={() => remove(i)}
            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0 opacity-0 group-hover:opacity-100"
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <Button type="button" variant="ghost" onClick={add} className="text-blue-400 hover:text-blue-300 text-sm">
        <Plus className="w-4 h-4 mr-1" /> {addLabel}
      </Button>
    </div>
  )
}

export default function NewTaskPage() {
  const router = useRouter()
  
  // Company & Product Info
  const [companyName, setCompanyName] = useState('')
  const [productName, setProductName] = useState('')
  const [productTagline, setProductTagline] = useState('')
  const [companyWebsite, setCompanyWebsite] = useState('')
  const [founderName, setFounderName] = useState('')
  
  // Task Details
  const [taskTypes, setTaskTypes] = useState<string[]>(['signup'])
  const [customKeyword, setCustomKeyword] = useState('')
  const [title, setTitle] = useState('')
  const [appUrl, setAppUrl] = useState('')
  const [about, setAbout] = useState('')
  const [platform, setPlatform] = useState<string>('web')
  const [difficulty, setDifficulty] = useState<string>('medium')
  const [estimatedDuration, setEstimatedDuration] = useState<number>(5)
  
  // Instructions
  const [requirements, setRequirements] = useState<string[]>(DEFAULT_REQUIREMENTS)
  const [steps, setSteps] = useState<string[]>(['', ''])
  
  // Budget
  const [budget, setBudget] = useState(25)
  const [maxTesters, setMaxTesters] = useState(1)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const platformFee = (budget * maxTesters * PLATFORM_FEE_PERCENT) / 100
  const totalCost = budget * maxTesters + platformFee
  
  // Calculate recommended budget based on duration
  const getRecommendedBudget = () => {
    if (estimatedDuration <= 5) return { min: 15, max: 25, recommended: 20 }
    if (estimatedDuration <= 10) return { min: 20, max: 35, recommended: 25 }
    if (estimatedDuration <= 15) return { min: 25, max: 45, recommended: 35 }
    return { min: 30, max: 50, recommended: 40 }
  }
  
  const recommended = getRecommendedBudget()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    const trimmedSteps = steps.map((s) => s.trim()).filter(Boolean)
    if (trimmedSteps.length === 0) {
      setError('Add at least one step in "What to Test"')
      return
    }
    const trimmedTaskTypes = taskTypes.filter(Boolean)
    if (trimmedTaskTypes.length === 0) {
      setError('Select at least one task type')
      return
    }
    
    if (!appUrl.trim()) {
      setError('Target App URL is required')
      return
    }

    setIsSubmitting(true)
    try {
      const primaryLabel = TASK_TYPES.find((t) => t.value === taskTypes[0])?.label ?? taskTypes[0] ?? 'Task'
      const displayTitle = title.trim() || `Test ${primaryLabel}`
      const trimmedReqs = requirements.map((r) => r.trim()).filter(Boolean)
      
      await createTask({
        appUrl: appUrl.trim(),
        budget,
        taskTypes: taskTypes.filter(Boolean),
        title: displayTitle,
        maxTesters,
        estimatedDurationMinutes: estimatedDuration,
        difficulty,
        platform,
        about: about.trim() || undefined,
        requirements: trimmedReqs.length ? trimmedReqs : undefined,
        steps: trimmedSteps,
        platformFeePercent: PLATFORM_FEE_PERCENT,
        companyName: companyName || undefined,
        productName: productName || undefined,
        productTagline: productTagline || undefined,
        companyWebsite: companyWebsite || undefined,
        founderName: founderName || undefined,
      })
      router.push('/dev')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = async () => {
    // TODO: Implement save as draft
    alert('Save as draft coming soon!')
  }

  return (
    <div className="flex-1 p-4 md:p-6 min-h-screen bg-[#050505]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/dev" className="text-gray-500 hover:text-white text-sm flex items-center gap-2 transition-colors">
            <span>←</span> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold mt-2">Create New Test</h1>
        </div>
        <div className="flex gap-3">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={handleSaveDraft}
            className="border border-white/10 text-gray-400 hover:text-white"
          >
            <Save className="w-4 h-4 mr-2" /> Save Draft
          </Button>
        </div>
      </div>

      {/* 3-Column Command Center Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        
        {/* Column 1: Context & Setup (30%) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Company Info Card */}
          <Card variant="glass" className="p-4 border-white/5">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">🏢 Company</h3>
            <div className="space-y-3">
              <Input
                label="Company Name"
                placeholder="e.g. TechFlow Inc"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
              <Input
                label="Product Name"
                placeholder="e.g. FlowDesk"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
              <Input
                label="Tagline"
                placeholder="One-line description"
                value={productTagline}
                onChange={(e) => setProductTagline(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Website"
                  placeholder="https://..."
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                />
                <Input
                  label="Founder"
                  placeholder="John Doe"
                  value={founderName}
                  onChange={(e) => setFounderName(e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Task Details Card */}
          <Card variant="glass" className="p-4 border-white/5">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">⚙️ Setup</h3>
            <div className="space-y-3">
              <Input
                label="Test Name"
                placeholder="e.g. Signup Flow Test"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Input
                label="Target URL"
                placeholder="https://yourapp.com"
                value={appUrl}
                onChange={(e) => setAppUrl(e.target.value)}
                required
              />
              
              {/* Task Type Pills - multi-select */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">Task Type</label>
                <div className="flex gap-1.5 flex-wrap">
                  {TASK_TYPES.map(({ label, value }) => {
                    const isSelected = taskTypes.includes(value)
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setTaskTypes((prev) =>
                            isSelected ? prev.filter((v) => v !== value) : [...prev, value]
                          )
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
                <div className="mt-2 flex gap-2 flex-wrap items-center">
                  <input
                    type="text"
                    placeholder="Add custom keyword..."
                    value={customKeyword}
                    onChange={(e) => setCustomKeyword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const kw = customKeyword.trim().toLowerCase().replace(/\s+/g, '_')
                        if (kw && !taskTypes.includes(kw)) {
                          setTaskTypes((prev) => [...prev, kw])
                          setCustomKeyword('')
                        }
                      }
                    }}
                    className="flex-1 min-w-[120px] bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder:text-gray-400"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const kw = customKeyword.trim().toLowerCase().replace(/\s+/g, '_')
                      if (kw && !taskTypes.includes(kw)) {
                        setTaskTypes((prev) => [...prev, kw])
                        setCustomKeyword('')
                      }
                    }}
                    className="text-xs px-2 py-1"
                  >
                    Add
                  </Button>
                </div>
                {taskTypes.length > 0 && (
                  <div className="mt-2 flex gap-1.5 flex-wrap">
                    {taskTypes.map((t) => {
                      const label = TASK_TYPES.find((x) => x.value === t)?.label ?? t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                      return (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 text-gray-300 text-xs"
                        >
                          {label}
                          <button
                            type="button"
                            onClick={() => setTaskTypes((prev) => prev.filter((v) => v !== t))}
                            className="hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Platform, Difficulty, Duration - split into 2 rows */}
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Platform</label>
                  <div className="flex gap-1">
                    {PLATFORM_OPTIONS.map(({ label, value }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setPlatform(value)}
                        className={`px-3 py-1.5 rounded-lg text-xs ${
                          platform === value ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                        title={label}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Difficulty</label>
                    <div className="flex gap-1">
                      {DIFFICULTY_OPTIONS.map(({ label, value }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setDifficulty(value)}
                          className={`flex-1 px-2 py-1.5 rounded-lg text-xs ${
                            difficulty === value ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Duration</label>
                    <select
                      value={estimatedDuration}
                      onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                    >
                      {DURATION_OPTIONS.map((min) => (
                        <option key={min} value={min}>{min} min</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* About */}
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">About</label>
                <textarea
                  placeholder="Brief context for testers..."
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-gray-600 text-sm resize-none"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Column 2: Instructions (40%) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Requirements */}
          <Card variant="glass" className="p-4 border-white/5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">📋 Requirements</h3>
              <span className="text-xs text-gray-600">{requirements.filter(r => r.trim()).length} items</span>
            </div>            <DynamicList
              items={requirements}
              onChange={setRequirements}
              placeholder="e.g. Record with audio"
              addLabel="Add requirement"
              renderInput={(value, onChange) => (
                <input
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="Enter requirement..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-gray-600 text-sm"
                />
              )}
            />
          </Card>

          {/* What to Test */}
          <Card variant="glass" className="p-4 border-white/5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">🎯 What to Test</h3>
              <span className="text-xs text-gray-500">{steps.length} steps</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">Click drag handle to reorder • Numbered steps for testers</p>
            <DynamicList
              items={steps}
              onChange={setSteps}
              placeholder="e.g. Visit the homepage"
              addLabel="Add step"
              showDragHandle
              renderInput={(value, onChange) => (
                <input
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="Enter step..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-gray-600 text-sm"
                />
              )}
            />
          </Card>
        </div>

        {/* Column 3: Budget & Launch (30%) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Pro Tip above Budget so it scrolls away first and doesn't overlap the sticky Launch button */}
          <Card variant="glass" className="p-4 border-white/5 bg-blue-500/5">
            <h4 className="text-sm font-semibold text-blue-400 mb-2">💡 Pro Tip</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Clear steps = better testers. Break complex flows into numbered steps. 
              Recommended budget: ${recommended.recommended} for {estimatedDuration}min tests.
            </p>
          </Card>
          <Card variant="glass" className="p-4 border-white/10 bg-gradient-to-br from-purple-900/20 to-blue-900/10 sticky top-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-purple-400" /> Budget & Launch
            </h3>
            
            <div className="space-y-5">
              {/* Reward Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-gray-300">Reward per Tester</label>
                  <span className="text-2xl font-bold text-green-400">${budget}</span>
                </div>
                <input
                  type="range"
                  min={recommended.min}
                  max={recommended.max}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>${recommended.min}</span>
                  <span className="text-green-400/70">Recommended: ${recommended.recommended}</span>
                  <span>${recommended.max}</span>
                </div>
              </div>

              {/* Testers */}
              <div className="flex justify-between items-center">
                <label className="text-sm text-gray-300">Number of Testers</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={maxTesters}
                  onChange={(e) => setMaxTesters(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                  className="w-20 bg-white/5 border border-white/10 rounded px-3 py-1.5 text-right text-white text-sm"
                />
              </div>

              {/* Cost Breakdown */}
              <div className="pt-4 border-t border-white/10 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Testers × Reward</span>
                  <span>${budget * maxTesters}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Platform fee (20%)</span>
                  <span>${platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-white">${totalCost.toFixed(2)}</span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Launch Button */}
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-purple-500/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : '🚀 Launch Test'}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Payment will be held in escrow until approval
              </p>
            </div>
          </Card>
        </div>
      </form>
    </div>
  )
}
