/**
 * Video Insights Analysis Service
 *
 * Produces structured product/UX findings for developers.
 * Uses the UserTest Product Evaluation Framework + Developer test intent.
 * This is the value-creating analysis (vs. video-analysis.ts which is the guardrail).
 *
 * Supported providers: Google Gemini 2.0, OpenAI GPT-4o
 */

const GEMINI_MODEL = 'gemini-2.5-flash'
const OPENAI_MODEL = 'gpt-4o'

export interface DeveloperTestContext {
  testGoal?: string
  focusAreas?: string[]
  successDefinition?: string
  persona?: string
  keyFeature?: string
}

export interface InsightFinding {
  dimension: string
  dev_focus: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  timestamp_sec: number
  title: string
  problem: string
  impact: string
  cause: string
  recommendation: string
}

export interface VideoInsightsResult {
  findings: InsightFinding[]
  analyzedAt: string
  provider: 'gemini' | 'openai'
}

export interface VideoInsightsRequest {
  videoUrl: string
  developerContext: DeveloperTestContext
}

const SEVERITIES = ['critical', 'high', 'medium', 'low'] as const

function buildPrompt(request: VideoInsightsRequest): string {
  const ctx = request.developerContext
  const testGoal = ctx.testGoal || 'Not specified'
  const focusAreas = Array.isArray(ctx.focusAreas) && ctx.focusAreas.length > 0
    ? ctx.focusAreas.join(', ')
    : 'Not specified'
  const successDefinition = ctx.successDefinition || 'Not specified'
  const persona = ctx.persona || 'Not specified'
  const keyFeature = ctx.keyFeature || 'Not specified'

  return `You are a senior product and UX analyst evaluating a user test session.

Your goal is to identify product issues observed during the session.

Use both:
1) UserTest Product Evaluation Framework
2) Developer test intent

DEVELOPER TEST CONTEXT

Test goal: ${testGoal}
Focus areas: ${focusAreas}
Success definition: ${successDefinition}
Target persona: ${persona}
Key feature: ${keyFeature}

USERTEST FRAMEWORK DIMENSIONS

- Value Delivery
- Access to Value
- Understanding
- Experience Quality
- Emotional Signal
- Product Identity Fit

INSTRUCTIONS

From the video/transcript, detect usability or product issues.

For each issue:
- Assign the most relevant framework dimension
- If relevant, link to a developer focus area
- Create a short descriptive title (max 6 words)
- Apply RITE structure

Prioritize issues that relate to developer focus areas.

RITE

Problem
Impact
Cause
Recommendation

SEVERITY

critical — task blocked or invalid
high — major friction/confusion
medium — inefficiency
low — minor issue

OUTPUT JSON

Respond with ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "findings": [
    {
      "dimension": "one of: Value Delivery, Access to Value, Understanding, Experience Quality, Emotional Signal, Product Identity Fit",
      "dev_focus": "related focus area or empty string",
      "severity": "critical | high | medium | low",
      "timestamp_sec": number,
      "title": "short title max 6 words",
      "problem": "...",
      "impact": "...",
      "cause": "...",
      "recommendation": "..."
    }
  ]
}

Video URL to analyze: ${request.videoUrl}`
}

function getProvider(): 'gemini' | 'openai' | null {
  if (process.env.GEMINI_API_KEY) return 'gemini'
  if (process.env.OPENAI_API_KEY) return 'openai'
  return null
}

/**
 * Analyze a video to produce structured product/UX insights for developers.
 */
export async function analyzeVideoInsights(
  request: VideoInsightsRequest
): Promise<VideoInsightsResult> {
  const provider = getProvider()
  if (provider === 'gemini') {
    return analyzeInsightsWithGemini(request)
  }
  if (provider === 'openai') {
    return analyzeInsightsWithOpenAI(request)
  }
  throw new Error('No AI provider configured. Set GEMINI_API_KEY or OPENAI_API_KEY')
}

async function analyzeInsightsWithGemini(
  request: VideoInsightsRequest
): Promise<VideoInsightsResult> {
  const apiKey = process.env.GEMINI_API_KEY!
  const prompt = buildPrompt(request)

  const parts: Array<{ text: string } | { fileData: { fileUri: string; mimeType?: string } }> = [
    { text: prompt },
  ]
  const videoUrl = request.videoUrl.trim()
  if (videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'))) {
    parts.push({ fileData: { fileUri: videoUrl, mimeType: 'video/*' } })
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192,
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error: ${error}`)
  }

  const data = await response.json()
  const responseParts = data.candidates?.[0]?.content?.parts ?? []
  let responseText =
    (typeof responseParts[0]?.text === 'string' ? responseParts[0].text : '') || ''
  if (!responseText && responseParts.length > 1) {
    responseText = responseParts.map((p: { text?: string }) => p.text || '').join('')
  }

  return parseInsightsResponse(responseText, 'gemini')
}

async function analyzeInsightsWithOpenAI(
  request: VideoInsightsRequest
): Promise<VideoInsightsResult> {
  const apiKey = process.env.OPENAI_API_KEY!
  const prompt = buildPrompt(request)

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'video_url', video_url: { url: request.videoUrl } },
          ],
        },
      ],
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()
  const responseText = data.choices?.[0]?.message?.content || ''
  return parseInsightsResponse(responseText, 'openai')
}

function parseInsightsResponse(
  responseText: string,
  provider: 'gemini' | 'openai'
): VideoInsightsResult {
  let jsonStr: string | null = null
  const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim()
  } else {
    const braceMatch = responseText.match(/\{[\s\S]*\}/)
    if (braceMatch) jsonStr = braceMatch[0]
  }

  if (!jsonStr) {
    console.error('Insights raw response:', responseText)
    throw new Error(`Failed to parse insights response. Raw: ${responseText.slice(0, 200)}...`)
  }

  let parsed: { findings?: unknown[] }
  try {
    parsed = JSON.parse(jsonStr)
  } catch (err) {
    console.error('Insights JSON parse error:', err)
    throw new Error(`Invalid JSON from AI: ${(err as Error).message}`)
  }

  const rawFindings = Array.isArray(parsed.findings) ? parsed.findings : []
  const findings: InsightFinding[] = rawFindings
    .filter((f): f is Record<string, unknown> => f != null && typeof f === 'object')
    .map((f) => ({
      dimension: String(f.dimension ?? ''),
      dev_focus: String(f.dev_focus ?? ''),
      severity: SEVERITIES.includes((f.severity as (typeof SEVERITIES)[number]) ?? '')
        ? (f.severity as (typeof SEVERITIES)[number])
        : 'medium',
      timestamp_sec: Number(f.timestamp_sec) || 0,
      title: String(f.title ?? ''),
      problem: String(f.problem ?? ''),
      impact: String(f.impact ?? ''),
      cause: String(f.cause ?? ''),
      recommendation: String(f.recommendation ?? ''),
    }))

  return {
    findings,
    analyzedAt: new Date().toISOString(),
    provider,
  }
}
