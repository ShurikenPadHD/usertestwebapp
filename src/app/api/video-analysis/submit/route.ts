import { NextRequest, NextResponse } from 'next/server'
import { analyzeVideo } from '@/lib/ai/video-analysis'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { videoUrl, durationSeconds, taskId } = body

    if (!videoUrl) {
      return NextResponse.json({ error: 'videoUrl is required' }, { status: 400 })
    }

    // Fetch the actual task context from the database to instruct the AI
    let taskTitle = 'User Test'
    let taskDescription = ''
    
    if (taskId) {
      // Import createClient dynamically or at the top of the file
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      
      const { data: task } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single()
        
      if (task) {
        taskTitle = task.title || 'User Test'
        
        const appUrl = task.app_url || task.url || 'Not specified'
        const stepsList = Array.isArray(task.steps) && task.steps.length > 0 
          ? task.steps.join('\n- ') 
          : task.instructions || 'None'
          
        const reqList = Array.isArray(task.requirements) && task.requirements.length > 0
          ? task.requirements.join('\n- ')
          : 'None'

        taskDescription = `
TARGET APP/WEBSITE TO TEST: ${appUrl}

ABOUT THIS TASK:
${task.about || task.description || 'No general description provided.'}

EXACT STEPS TESTER MUST FOLLOW:
- ${stepsList}

SPECIFIC REQUIREMENTS:
- ${reqList}
`.trim()
      }
    }

    // Perform AI analysis with the exact developer requirements
    const result = await analyzeVideo({
      videoUrl,
      taskTitle,
      taskDescription,
      expectedDurationSeconds: durationSeconds || 180
    })

    // Determine if video is valid based on criteria
    const isValid = determineValidity(result)

    return NextResponse.json({
      analysis: {
        relevanceScore: result.relevanceScore,
        requirementsMet: result.requirementsMet,
        requirementsMissed: result.requirementsMissed,
        effortScore: result.effortScore,
        qualityScore: result.qualityScore,
        issues: result.issues,
        summary: result.summary,
        isValid
      }
    })

  } catch (error) {
    console.error('Video analysis error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    )
  }
}

function determineValidity(result: {
  relevanceScore: number
  effortScore: number
  qualityScore: number
  requirementsMet: string[]
  requirementsMissed: string[]
  issues: string[]
}): boolean {
  // Video is valid if:
  // - Relevance >= 60 (video is related to the task)
  // - Effort >= 50 (tester put in real work)
  // - Quality >= 40 (watchable quality)
  // - No critical issues (like "not a real user test")
  
  const hasCriticalIssues = result.issues.some(issue => 
    /not a real|fake|random video|generic|off.?topic/i.test(issue)
  )

  return (
    result.relevanceScore >= 60 &&
    result.effortScore >= 50 &&
    result.qualityScore >= 40 &&
    !hasCriticalIssues
  )
}
