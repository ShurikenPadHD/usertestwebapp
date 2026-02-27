import { createClient } from '@/lib/supabase/client'

const VIDEO_BUCKET = 'videos'

/**
 * Storage service for video uploads using Supabase Storage
 */
export const storage = {
  /**
   * Upload a video file to Supabase Storage
   * @param file - The video file to upload
   * @param onProgress - Optional callback for upload progress (0-100)
   * @returns The public URL of the uploaded video
   */
  async upload(file: File, onProgress?: (progress: number) => void): Promise<string> {
    const supabase = createClient()
    
    // Generate unique filename: userId/timestamp-filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `submissions/${timestamp}-${sanitizedName}`
    
    // Upload with progress tracking using XHR
    const url = await new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100)
          onProgress(progress)
        }
      })
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(filePath)
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      })
      
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed - network error'))
      })
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      
      xhr.open('POST', `${supabaseUrl}/storage/v1/object/${VIDEO_BUCKET}/${filePath}`)
      xhr.setRequestHeader('Authorization', `Bearer ${anonKey}`)
      xhr.setRequestHeader('Content-Type', file.type)
      
      xhr.send(file)
    })
    
    // Get public URL
    return this.getUrl(url)
  },

  /**
   * Get the public URL for an uploaded video
   * @param path - The storage path of the video
   * @returns The full public URL
   */
  getUrl(path: string): string {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    // Transform path to get public URL
    // path is like "submissions/timestamp-filename"
    return `${supabaseUrl}/storage/v1/object/public/${VIDEO_BUCKET}/${path}`
  },

  /**
   * Delete a video from storage
   * @param path - The storage path of the video to delete
   */
  async delete(path: string): Promise<void> {
    const supabase = createClient()
    
    // Extract relative path from full URL if needed
    let relativePath = path
    if (path.includes('storage/v1/object')) {
      relativePath = path.split(`/object/public/${VIDEO_BUCKET}/`)[1] || path
    }
    
    const { error } = await supabase.storage
      .from(VIDEO_BUCKET)
      .remove([relativePath])
    
    if (error) {
      console.error('Storage delete error:', error)
      throw new Error('Failed to delete video')
    }
  },

  /**
   * Validate video file before upload
   * @param file - The file to validate
   * @throws Error if file is invalid
   */
  validateFile(file: File): void {
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm']
    const maxSize = 100 * 1024 * 1024 // 100MB
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed: MP4, MOV, WebM`)
    }
    
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size: 100MB`)
    }
  }
}

/**
 * Extract video duration from a file
 * @param file - The video file
 * @returns Duration in seconds
 */
export async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src)
      resolve(video.duration)
    }
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      reject(new Error('Failed to load video metadata'))
    }
    
    video.src = URL.createObjectURL(file)
  })
}
