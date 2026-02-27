/**
 * Video Analysis Service
 * 
 * Analyzes submitted videos to verify legitimacy and quality.
 * Uses Google Gemini 2.0 (native video understanding) or OpenAI.
 * 
 * Supported providers:
 * - Google Gemini 2.0 (recommended for video)
 * - OpenAI (GPT-4o with video support)
 */

const GEMINI_MODEL = 'gemini-2.5-flash'
const OPENAI_MODEL = 'gpt-4o'

export interface VideoAnalysisRequest {
  videoUrl: string
  taskTitle?: string
  taskDescription?: string
  expectedDurationSeconds?: number
}

export interface VideoAnalysisResult {
  relevanceScore: number // 0-100 - Video is related to the task
  requirementsMet: string[] // What requirements are met
  requirementsMissed: string[] // What requirements are missing
  effortScore: number // 0-100 - Real work put in
  qualityScore: number // 0-100 - Audio/visual quality
  issues: string[] // Issues found
  summary: string // 2-3 sentence summary
  analyzedAt: string
  provider: 'gemini' | 'openai'
}

/**
 * Analyze a video URL to verify it's a legitimate user test
 */
export async function analyzeVideo(request: VideoAnalysisRequest): Promise<VideoAnalysisResult> {
  const provider = getVideoAnalysisProvider()
  
  if (provider === 'gemini') {
    return analyzeWithGemini(request)
  } else if (provider === 'openai') {
    return analyzeWithOpenAI(request)
  }
  
  throw new Error('No AI provider configured. Set GEMINI_API_KEY or OPENAI_API_KEY')
}

function getVideoAnalysisProvider(): 'gemini' | 'openai' | null {
  if (process.env.GEMINI_API_KEY) return 'gemini'
  if (process.env.OPENAI_API_KEY) return 'openai'
  return null
}

/**
 * Analyze video using Google Gemini 2.0
 * Gemini 2.0 Flash has native video understanding capabilities
 */
async function analyzeWithGemini(request: VideoAnalysisRequest): Promise<VideoAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY!
  
  const prompt = `You are an expert quality assurance reviewer for user testing videos. 
Your job is to verify if a submitted video is a legitimate user test attempt.

Analyze the video at this URL: ${request.videoUrl}

${request.taskTitle ? `Task Title: ${request.taskTitle}` : ''}
${request.taskDescription ? `Task Description: ${request.taskDescription}` : ''}
${request.expectedDurationSeconds ? `Expected minimum duration: ${request.expectedDurationSeconds} seconds (3 minutes)` : ''}

Evaluate the video based on these criteria:

1. RELEVANCE (Is this video related to the task?)
   - Does the video actually show the tester using the specific App/Website URL provided in the task description?
   - Is it on-topic or completely off-topic?
   - IF THEY ARE TESTING THE WRONG WEBSITE, score relevance 0 and list it as a critical issue.

2. REQUIREMENTS MET (Did the tester fulfill the task requirements?)
   - Did they attempt the specific steps asked in the task description?
   - Did they follow the developer's exact instructions?
   - Did they cover the key points requested?

3. EFFORT (Did the tester put in real work?)
   - Is the video at least 3 minutes long?
   - Does the tester explain their actions and decisions?
   - Are there multiple tasks attempted?
   - Does the tester provide useful feedback/observations?

4. QUALITY (Is it a good submission?)
   - Is audio clear and understandable?
   - Is the screen clearly visible?
   - Is the feedback actionable and specific?

Provide your analysis in this exact JSON format:
{
  "relevanceScore": 0-100,
  "requirementsMet": ["requirement 1 that is met", "requirement 2 that is met"],
  "requirementsMissed": ["requirement 1 that was missed", "requirement 2 that was missed"],
  "effortScore": 0-100,
  "qualityScore": 0-100,
  "issues": ["issue 1 if any", "issue 2 if any"],
  "summary": "2-3 sentence summary of your analysis"
}

IMPORTANT - Output format:
- If the task description contains placeholder or gibberish text (e.g. "gzergzergrezgez"), do not quote it verbatim. Instead say "the task steps were unclear" or similar.
IMPORTANT - Tone and format:
- Address the tester directly in second person ("you", "your").
- Be gentle and constructive. Acknowledge effort when they've put in real work (e.g. "You did a great job with narration and screen recording. To pass, consider...").
- Frame issues as helpful suggestions, not accusations. Instead of "You failed to test X", say "To pass, make sure you test [correct URL] as specified in the task."
- When something is wrong, give actionable advice: "Try re-recording with the correct app/URL", "Consider adding voice narration to explain your steps", "Make sure your screen is clearly visible".
- Never be harsh or punitive. The goal is to help them improve and resubmit successfully.`

  // Build parts: include video URL for Gemini to analyze (YouTube, etc.)
  const parts: Array<{ text: string } | { fileData: { fileUri: string; mimeType?: string } }> = [
    { text: prompt }
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
          maxOutputTokens: 4096,
        }
      })
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error: ${error}`)
  }

  const data = await response.json()
  const responseParts = data.candidates?.[0]?.content?.parts ?? []
  let responseText = (typeof responseParts[0]?.text === 'string' ? responseParts[0].text : '') || ''
  if (!responseText && responseParts.length > 1) {
    responseText = responseParts.map((p: { text?: string }) => p.text || '').join('')
  }
  // #region agent log
  const partsPreview = responseParts.map((p: { text?: string }) => (p.text ? p.text.slice(0, 100) + '...' : '[no text]'))
  fetch('http://127.0.0.1:7470/ingest/6f3c770d-a54a-4d4c-827d-876e5cf3453c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'68a1f2'},body:JSON.stringify({sessionId:'68a1f2',location:'video-analysis.ts:parse',message:'Gemini response structure',data:{hasCandidates:!!data.candidates,candidatesLen:data.candidates?.length,partsLen:responseParts.length,partsPreview,responseTextLen:responseText.length,responseTextPreview:responseText.slice(0,600),finishReason:data.candidates?.[0]?.finishReason},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  
  // Extract JSON from response (handles markdown code blocks, raw JSON, and truncated responses)
  let jsonStr: string | null = null
  const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim()
    // #region agent log
    fetch('http://127.0.0.1:7470/ingest/6f3c770d-a54a-4d4c-827d-876e5cf3453c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'68a1f2'},body:JSON.stringify({sessionId:'68a1f2',location:'video-analysis.ts:codeBlock',message:'Matched code block',data:{jsonStrLen:jsonStr?.length},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
  } else {
    const braceMatch = responseText.match(/\{[\s\S]*\}/)
    if (braceMatch) {
      jsonStr = braceMatch[0]
    } else if (/```(?:json)?\s*\{/.test(responseText)) {
      // Truncated response: has ```json { but no closing ``` (e.g. MAX_TOKENS)
      const start = responseText.indexOf('{')
      if (start !== -1) {
        let extracted = responseText.slice(start)
        // Repair: close unclosed string (truncation often in "summary") then close braces
        if (!extracted.trim().endsWith('}')) {
          if (/"[^"]*$/.test(extracted)) {
            extracted += '"'
          }
          while ((extracted.match(/\{/g) || []).length > (extracted.match(/\}/g) || []).length) {
            extracted += '}'
          }
        }
        jsonStr = extracted
      }
    }
    // #region agent log
    fetch('http://127.0.0.1:7470/ingest/6f3c770d-a54a-4d4c-827d-876e5cf3453c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'68a1f2'},body:JSON.stringify({sessionId:'68a1f2',location:'video-analysis.ts:brace',message:'Matched brace or truncated fallback',data:{hasBraceMatch:!!braceMatch,jsonStrLen:jsonStr?.length,usedTruncatedFallback:!!jsonStr&&!braceMatch},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
  }
  if (!jsonStr) {
    // #region agent log
    fetch('http://127.0.0.1:7470/ingest/6f3c770d-a54a-4d4c-827d-876e5cf3453c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'68a1f2'},body:JSON.stringify({sessionId:'68a1f2',location:'video-analysis.ts:parseFail',message:'No JSON extracted',data:{responseTextFull:responseText,responseTextLen:responseText.length},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    console.error('Gemini raw response:', responseText)
    throw new Error(`Failed to parse Gemini response. Raw: ${responseText.slice(0, 200)}...`)
  }

  let analysis: Record<string, unknown>
  try {
    analysis = JSON.parse(jsonStr)
    // #region agent log
    fetch('http://127.0.0.1:7470/ingest/6f3c770d-a54a-4d4c-827d-876e5cf3453c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'68a1f2'},body:JSON.stringify({sessionId:'68a1f2',location:'video-analysis.ts:parseOk',message:'JSON parsed successfully',data:{keys:Object.keys(analysis)},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
  } catch (parseErr) {
    // #region agent log
    fetch('http://127.0.0.1:7470/ingest/6f3c770d-a54a-4d4c-827d-876e5cf3453c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'68a1f2'},body:JSON.stringify({sessionId:'68a1f2',location:'video-analysis.ts:parseErr',message:'JSON parse failed',data:{error:String(parseErr),jsonStrPreview:jsonStr?.slice(0,300)},timestamp:Date.now(),hypothesisId:'H5'})}).catch(()=>{});
    // #endregion
    console.error('Gemini JSON parse error:', parseErr)
    console.error('Extracted string:', jsonStr)
    throw new Error(`Invalid JSON from Gemini: ${(parseErr as Error).message}`)
  }
  
  return {
    relevanceScore: analysis.relevanceScore ?? (analysis.isLegitimate ? 100 : 0),
    requirementsMet: analysis.requirementsMet ?? [],
    requirementsMissed: analysis.requirementsMissed ?? [],
    effortScore: analysis.effortScore ?? 0,
    qualityScore: analysis.qualityScore ?? 0,
    issues: analysis.issues ?? [],
    summary: analysis.summary ?? 'No summary available',
    analyzedAt: new Date().toISOString(),
    provider: 'gemini'
  }
}

/**
 * Analyze video using OpenAI GPT-4o
 * Note: OpenAI charges per video minute for video analysis
 */
async function analyzeWithOpenAI(request: VideoAnalysisRequest): Promise<VideoAnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY!
  
  const prompt = `You are an expert quality assurance reviewer for user testing videos. 
Your job is to verify if a submitted video is a legitimate user test attempt.

Video URL: ${request.videoUrl}

${request.taskTitle ? `Task Title: ${request.taskTitle}` : ''}
${request.taskDescription ? `Task Description: ${request.taskDescription}` : ''}

Evaluate:
1. LEGITIMACY - Is this a real user test?
2. EFFORT - Did the tester put in real work? (minimum 3 minutes, voice narration, multiple tasks)
3. QUALITY - Is audio clear, screen visible, feedback actionable?

IMPORTANT: Address the tester in second person. Be gentle and constructive. Acknowledge effort when present. Frame issues as helpful suggestions with actionable advice (e.g. "To pass, try testing the correct URL"). Never be harsh.

Respond with exact JSON:
{
  "isLegitimate": true/false,
  "effortScore": 0-100,
  "qualityScore": 0-100,
  "issues": ["issue 1"],
  "summary": "2-3 sentences"
}`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'video_url', video_url: { url: request.videoUrl } }
          ]
        }
      ],
      max_tokens: 2048
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()
  const responseText = data.choices?.[0]?.message?.content || ''
  
  const jsonMatch = responseText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse OpenAI response')
  }

  const analysis = JSON.parse(jsonMatch[0])
  
  return {
    relevanceScore: analysis.relevanceScore ?? (analysis.isLegitimate ? 100 : 0),
    requirementsMet: analysis.requirementsMet ?? [],
    requirementsMissed: analysis.requirementsMissed ?? [],
    effortScore: analysis.effortScore ?? 0,
    qualityScore: analysis.qualityScore ?? 0,
    issues: analysis.issues ?? [],
    summary: analysis.summary ?? 'No summary available',
    analyzedAt: new Date().toISOString(),
    provider: 'openai'
  }
}

/**
 * Quick check if video URL is accessible by AI APIs
 * Returns true if the URL is likely to work with video analysis
 */
export function isVideoUrlCompatible(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    
    // Known compatible video sources
    const compatibleDomains = [
      'youtube.com', 'youtu.be', 'youtube-nocookie.com',
      'vimeo.com',
      'loom.com', 'www.loom.com',
      'dropbox.com', 'www.dropbox.com',
      'drive.google.com',
      'dailymotion.com',
      'cdn.loom.com',
      '校外'
    ]
    
    // Check if domain is known compatible
    if (compatibleDomains.some(domain => hostname.includes(domain))) {
      return true
    }
    
    // Check if it's a direct video file
    const pathname = urlObj.pathname.toLowerCase()
    const videoExtensions = ['.mp4', '.webm', '.mov', '.m4v', '.avi']
    if (videoExtensions.some(ext => pathname.endsWith(ext))) {
      return true
    }
    
    return false
  } catch {
    return false
  }
}
