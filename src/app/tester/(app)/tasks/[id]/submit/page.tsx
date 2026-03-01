'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'
import { Link2, X, Check, FileVideo, Send, AlertCircle, Loader2, ExternalLink, Clock, ShieldCheck, ShieldAlert, Brain, CheckCircle2, XCircle, ListChecks, Info, LayoutList, ArrowLeft } from 'lucide-react'
import { submitTest } from './actions'

interface AIAnalysis {
  relevanceScore: number
  requirementsMet: string[]
  requirementsMissed: string[]
  effortScore: number
  qualityScore: number
  issues: string[]
  summary: string
  isValid: boolean
}

export default function SubmitPage() {
  const params = useParams()
  const router = useRouter()
  const taskId = params.id as string

  // Task State
  const [task, setTask] = useState<any>(null)
  const [isLoadingTask, setIsLoadingTask] = useState(true)

  // Form State
  const [videoUrl, setVideoUrl] = useState('')
  const [durationDisplay, setDurationDisplay] = useState('') // mm:ss format
  const [notes, setNotes] = useState('')
  
  // Validation & AI State
  const [isValidating, setIsValidating] = useState(false)
  const [isValidated, setIsValidated] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  
  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Fetch task context on mount
  useEffect(() => {
    async function fetchTask() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single()
        
      if (data) setTask(data)
      setIsLoadingTask(false)
    }
    fetchTask()
  }, [taskId])

  const KNOWN_VIDEO_HOSTS = [
    'youtube.com', 'youtu.be', 'vimeo.com', 'loom.com', 'drive.google.com', 'dropbox.com'
  ]

  const isKnownVideoUrl = (url: string) => {
    try {
      const host = new URL(url).hostname.toLowerCase()
      return KNOWN_VIDEO_HOSTS.some(h => host.includes(h))
    } catch {
      return false
    }
  }

  const validateUrl = useCallback(async () => {
    if (!videoUrl.trim()) {
      setValidationError('Please enter a video URL')
      return
    }

    try {
      new URL(videoUrl)
    } catch {
      setValidationError('Invalid URL format')
      return
    }

    setIsValidating(true)
    setValidationError(null)

    try {
      if (!isKnownVideoUrl(videoUrl)) {
        const response = await fetch(videoUrl, { method: 'HEAD' })
        if (!response.ok && response.type !== 'opaque') {
          throw new Error('URL is not accessible')
        }
      }

      setIsValidated(true)
      setValidationError(null)
      await runAIAnalysis()
    } catch (err) {
      setIsValidated(false)
      setValidationError(err instanceof Error ? err.message : 'Failed to validate URL')
    } finally {
      setIsValidating(false)
    }
  }, [videoUrl, taskId])

  const runAIAnalysis = async () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setAnalysis(null)
    setError(null)

    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => (prev >= 90 ? prev : prev + Math.random() * 15))
    }, 500)

    try {
      const response = await fetch('/api/video-analysis/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: videoUrl.trim(),
          durationSeconds: parseDurationToSeconds(durationDisplay) || 180,
          taskId // Send taskId to fetch backend context securely
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Analysis failed')

      setAnalysisProgress(100)
      setAnalysis(data.analysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI analysis failed')
      setAnalysis({
        relevanceScore: 0, requirementsMet: [], requirementsMissed: [],
        effortScore: 0, qualityScore: 0, issues: ['AI analysis unavailable'],
        summary: 'Analysis could not be completed. Proceed at your own risk.', isValid: false
      })
    } finally {
      clearInterval(progressInterval)
      setIsAnalyzing(false)
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(e.target.value)
    setIsValidated(false)
    setValidationError(null)
    setAnalysis(null)
  }

  const parseDurationToSeconds = (value: string): number => {
    if (!value.trim()) return 0
    const parts = value.trim().split(':')
    if (parts.length === 1) {
      const n = parseInt(parts[0], 10)
      return isNaN(n) ? 0 : n * 60
    }
    if (parts.length === 2) {
      const mins = parseInt(parts[0], 10) || 0
      const secs = parseInt(parts[1], 10) || 0
      return mins * 60 + secs
    }
    return 0
  }

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^[\d:]*$/.test(value) && (value.match(/:/g)?.length ?? 0) <= 1) {
      setDurationDisplay(value)
    }
  }

  const handleSubmit = async () => {
    setError(null)
    if (!videoUrl.trim() || !isValidated) {
      setError('Please validate the URL first')
      return
    }

    const duration = parseDurationToSeconds(durationDisplay)
    if (!duration || duration < 180) {
      setError('Video must be at least 3 minutes (180 seconds)')
      return
    }

    if (analysis && !analysis.isValid) {
      const proceed = confirm('AI analysis detected issues. Are you sure you want to submit? It may be rejected.')
      if (!proceed) return
    }

    setIsSubmitting(true)
    try {
      await submitTest({
        taskId,
        videoUrl: videoUrl.trim(),
        videoDurationSeconds: duration,
        notes: notes.trim() || undefined,
        aiAnalysis: analysis || undefined
      })
      router.push('/tester/my-tests')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400'
    if (score >= 40) return 'text-yellow-400'
    return 'text-red-400'
  }

  if (isLoadingTask) {
    return (
      <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <Link
          href={`/tester/tasks/${taskId}`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Task Brief
        </Link>
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </div>
    )
  }

  const appUrl = task?.app_url || task?.url
  const steps = task?.steps?.length > 0 ? task.steps : (task?.instructions ? [task.instructions] : [])
  const reqs = task?.requirements || []

  return (
    <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
      {/* Back Button */}
      <Link
        href={`/tester/tasks/${taskId}`}
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Task Brief
      </Link>

      {/* Top Header (Full Width) */}
      <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4 bg-white/5 border border-white/10 p-6 rounded-xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-3">{task?.title || 'User Test Submission'}</h1>
          <div className="flex flex-wrap items-center gap-2">
            {task?.difficulty && <Badge variant="default" className="capitalize">{task.difficulty}</Badge>}
            {task?.estimated_duration_minutes && (
              <Badge variant="default"><Clock className="w-3 h-3 mr-1" /> {task.estimated_duration_minutes} min</Badge>
            )}
            {task?.budget && <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">${task.budget}</Badge>}
          </div>
        </div>
        
        {appUrl && (
          <a href={appUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
            <Button className="w-full md:w-auto bg-white text-black hover:bg-gray-200">
              <ExternalLink className="w-4 h-4 mr-2" /> Open App in New Tab
            </Button>
          </a>
        )}
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (Sticky Reference) - 40% width on desktop */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 space-y-6">
            <Card variant="glass" className="p-6 border-white/5 bg-black/40">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" /> Task Context
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Keep this tab open side-by-side or use a secondary monitor to follow these steps while recording.
              </p>
              {task?.about && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">About this Task</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{task.about}</p>
                </div>
              )}

              {reqs.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ListChecks className="w-4 h-4" /> Requirements
                  </h3>
                  <ul className="space-y-2">
                    {reqs.map((req: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {steps.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <LayoutList className="w-4 h-4" /> What to test (Steps)
                  </h3>
                  <ol className="space-y-3">
                    {steps.map((step: string, i: number) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-medium shrink-0">
                          {i + 1}
                        </span>
                        <span className="mt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Right Column (Action) - 60% width on desktop */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Step 1: URL Input */}
          <Card variant="glass" className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">1</span>
              <h2 className="font-semibold text-lg">Upload your Video</h2>
            </div>
            
            <label className="block mb-2 font-medium text-sm text-gray-300">
              Video URL <span className="text-gray-500 font-normal">(YouTube, Vimeo, Loom, Google Drive)</span>
            </label>
            
            <div className="relative mb-4">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Link2 className="w-5 h-5 text-gray-500" />
              </div>
              <input
                type="url"
                value={videoUrl}
                onChange={handleUrlChange}
                placeholder="https://..."
                disabled={isSubmitting || isAnalyzing}
                className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-colors"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={validateUrl}
                disabled={!videoUrl.trim() || isValidating || isAnalyzing || isSubmitting}
                className="border-white/10 bg-white/5 hover:bg-white/10"
              >
                {isValidating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Validating...</>
                ) : (
                  <><Brain className="w-4 h-4 mr-2 text-purple-400" /> Validate & Analyze</>
                )}
              </Button>

              {isValidated && !isAnalyzing && (
                <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20">
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">Verified</span>
                </div>
              )}
            </div>

            {validationError && (
              <div className="flex items-center gap-2 text-sm text-red-400 mt-4 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {validationError}
              </div>
            )}
          </Card>

          {/* Step 2: AI Analysis */}
          {(isAnalyzing || analysis) && (
            <Card variant="glass" className="p-6 border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold shadow-lg shadow-purple-500/20">2</span>
                <h2 className="font-semibold text-lg">AI Verification</h2>
                {isAnalyzing && <Loader2 className="w-4 h-4 text-purple-400 animate-spin ml-auto" />}
              </div>

              {isAnalyzing ? (
                <div className="text-center py-8">
                  <Brain className="w-16 h-16 text-purple-400 mx-auto mb-6 animate-pulse" />
                  <p className="text-lg font-medium mb-2">Analyzing your video...</p>
                  <p className="text-sm text-gray-400 mb-6">Checking requirements, relevance, and quality.</p>
                  <div className="w-full bg-black/50 rounded-full h-3 overflow-hidden max-w-md mx-auto border border-white/5">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-blue-500 h-full transition-all duration-500 rounded-full" 
                      style={{ width: `${Math.min(analysisProgress, 100)}%` }} 
                    />
                  </div>
                  <p className="text-sm text-purple-400 mt-3 font-medium">{Math.round(analysisProgress)}%</p>
                </div>
              ) : analysis && (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className={`flex items-start gap-4 p-5 rounded-xl border ${
                    analysis.isValid 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    {analysis.isValid ? (
                      <ShieldCheck className="w-8 h-8 text-green-400 shrink-0" />
                    ) : (
                      <ShieldAlert className="w-8 h-8 text-red-400 shrink-0" />
                    )}
                    <div>
                      <p className={`text-lg font-bold mb-1 ${analysis.isValid ? 'text-green-400' : 'text-red-400'}`}>
                        {analysis.isValid ? 'Video Passed AI Verification' : 'Issues Detected'}
                      </p>
                      <p className="text-sm text-gray-300 leading-relaxed">{analysis.summary}</p>
                    </div>
                  </div>

                  {/* Scores Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-black/40 rounded-xl p-4 text-center border border-white/5">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">Relevance</p>
                      <p className={`text-3xl font-bold ${getScoreColor(analysis.relevanceScore)}`}>
                        {analysis.relevanceScore}%
                      </p>
                    </div>
                    <div className="bg-black/40 rounded-xl p-4 text-center border border-white/5">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">Effort</p>
                      <p className={`text-3xl font-bold ${getScoreColor(analysis.effortScore)}`}>
                        {analysis.effortScore}%
                      </p>
                    </div>
                    <div className="bg-black/40 rounded-xl p-4 text-center border border-white/5">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">Quality</p>
                      <p className={`text-3xl font-bold ${getScoreColor(analysis.qualityScore)}`}>
                        {analysis.qualityScore}%
                      </p>
                    </div>
                  </div>

                  {/* Requirements Split View */}
                  {(analysis.requirementsMet.length > 0 || analysis.requirementsMissed.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysis.requirementsMet.length > 0 && (
                        <div className="bg-green-500/5 rounded-xl p-4 border border-green-500/10">
                          <p className="text-sm font-bold text-green-400 mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Covered in Video
                          </p>
                          <ul className="space-y-2">
                            {analysis.requirementsMet.map((req, i) => (
                              <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">•</span> {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {analysis.requirementsMissed.length > 0 && (
                        <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/10">
                          <p className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
                            <XCircle className="w-4 h-4" /> Missed
                          </p>
                          <ul className="space-y-2">
                            {analysis.requirementsMissed.map((req, i) => (
                              <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                <span className="text-red-500 mt-0.5">•</span> {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Critical Issues */}
                  {analysis.issues.length > 0 && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                      <p className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Critical Flags
                      </p>
                      <ul className="text-sm text-gray-300 space-y-2">
                        {analysis.issues.map((issue, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-yellow-500 mt-0.5">•</span> {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* Step 3: Details & Final Submit */}
          {isValidated && !isAnalyzing && (
            <Card variant="glass" className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold shadow-lg shadow-green-500/20">3</span>
                <h2 className="font-semibold text-lg">Final Details</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block mb-2 font-medium text-sm text-gray-300">
                    Video Duration <span className="text-gray-500 font-normal">(minutes:seconds)</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Clock className="w-5 h-5 text-gray-500" />
                      </div>
                      <input
                        type="text"
                        value={durationDisplay}
                        onChange={handleDurationChange}
                        placeholder="e.g. 5:30"
                        disabled={isSubmitting}
                        className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                      />
                    </div>
                    {durationDisplay && parseDurationToSeconds(durationDisplay) >= 180 && (
                      <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30 shrink-0">
                        ✓ Valid Length
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Required minimum: 3:00</p>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-sm text-gray-300">
                    Notes for Developer <span className="text-gray-500 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any blockers or feedback regarding the test?"
                    rows={4}
                    disabled={isSubmitting}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 resize-none transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400 mt-6 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-white/10">
                <Link href={`/tester/tasks/${taskId}`} className="w-full sm:w-auto">
                  <Button variant="secondary" className="w-full border-white/10 bg-transparent hover:bg-white/5" disabled={isSubmitting}>
                    Cancel
                  </Button>
                </Link>
                <Button 
                  onClick={handleSubmit}
                  disabled={!isValidated || !durationDisplay || parseDurationToSeconds(durationDisplay) < 180 || isSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none"
                >
                  <Send className="w-4 h-4 mr-2" /> {isSubmitting ? 'Submitting Test...' : 'Submit for Review'}
                </Button>
              </div>
            </Card>
          )}

        </div>
      </div>
    </div>
  )
}
