import { Hono } from 'hono'
import type { Bindings } from '../types'
import { requireAuth } from '../utils/auth'

const app = new Hono<{ Bindings: Bindings }>()

// Upload image/video to R2
app.post('/', requireAuth, async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return c.json({ success: false, message: 'ファイルが選択されていません' }, 400)
    }

    // File type validation
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime']
    const isImage = allowedImageTypes.includes(file.type)
    const isVideo = allowedVideoTypes.includes(file.type)

    if (!isImage && !isVideo) {
      return c.json({ 
        success: false, 
        message: '対応していないファイル形式です。画像（JPEG, PNG, GIF, WebP）または動画（MP4, WebM, MOV）をアップロードしてください' 
      }, 400)
    }

    // File size validation
    const maxImageSize = 10 * 1024 * 1024 // 10MB
    const maxVideoSize = 100 * 1024 * 1024 // 100MB
    const maxSize = isVideo ? maxVideoSize : maxImageSize

    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024)
      return c.json({ 
        success: false, 
        message: `ファイルサイズが大きすぎます。${isVideo ? '動画' : '画像'}は最大${maxSizeMB}MBまでです` 
      }, 400)
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop()
    const filename = `${timestamp}-${randomString}.${extension}`
    const folder = isVideo ? 'videos' : 'images'
    const key = `${folder}/${filename}`

    // Upload to R2
    const arrayBuffer = await file.arrayBuffer()
    await c.env.UPLOADS.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    })

    // Generate public URL (for local development, use placeholder)
    // In production, this would be your R2 public URL or custom domain
    const publicUrl = `https://uploads.webapp.example.com/${key}`

    return c.json({ 
      success: true, 
      url: publicUrl,
      filename: filename,
      size: file.size,
      type: file.type
    })
  } catch (error) {
    console.error('Upload error:', error)
    return c.json({ 
      success: false, 
      message: 'アップロードに失敗しました: ' + (error as Error).message 
    }, 500)
  }
})

// Delete file from R2
app.delete('/:key', requireAuth, async (c) => {
  try {
    const key = c.req.param('key')
    
    // Extract key from URL if full URL is provided
    const actualKey = key.includes('/') ? key.split('/').slice(-2).join('/') : key

    await c.env.UPLOADS.delete(actualKey)

    return c.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return c.json({ 
      success: false, 
      message: '削除に失敗しました: ' + (error as Error).message 
    }, 500)
  }
})

// List files in R2 (for debugging)
app.get('/api/list', requireAuth, async (c) => {
  try {
    const folder = c.req.query('folder') || ''
    const limit = parseInt(c.req.query('limit') || '100')

    const listed = await c.env.UPLOADS.list({
      prefix: folder,
      limit: limit,
    })

    const files = listed.objects.map(obj => ({
      key: obj.key,
      size: obj.size,
      uploaded: obj.uploaded,
      url: `https://uploads.webapp.example.com/${obj.key}`
    }))

    return c.json({ 
      success: true, 
      files: files,
      truncated: listed.truncated
    })
  } catch (error) {
    console.error('List error:', error)
    return c.json({ 
      success: false, 
      message: 'ファイル一覧の取得に失敗しました: ' + (error as Error).message 
    }, 500)
  }
})

export default app
