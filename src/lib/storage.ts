import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs/promises'

const USE_S3 = Boolean(
  process.env.STORAGE_ENDPOINT &&
  process.env.STORAGE_BUCKET &&
  process.env.STORAGE_ACCESS_KEY &&
  process.env.STORAGE_SECRET_KEY
)

// Detect if using Supabase storage
const isSupabase = process.env.STORAGE_ENDPOINT?.includes('supabase.co')

const s3Client = USE_S3
  ? new S3Client({
      endpoint: process.env.STORAGE_ENDPOINT,
      region: process.env.STORAGE_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY!,
        secretAccessKey: process.env.STORAGE_SECRET_KEY!,
      },
      forcePathStyle: true,
    })
  : null

const BUCKET = process.env.STORAGE_BUCKET || ''
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

// Get the public URL for an uploaded file
function getPublicUrl(key: string): string {
  if (isSupabase) {
    // Supabase public URL format: https://[project-ref].supabase.co/storage/v1/object/public/[bucket]/[key]
    const endpoint = process.env.STORAGE_ENDPOINT!
    // Extract project ref from endpoint like:
    // https://xxx.supabase.co/storage/v1/s3 OR https://xxx.storage.supabase.co/storage/v1/s3
    const match = endpoint.match(/https:\/\/([^.]+)(?:\.storage)?\.supabase\.co/)
    if (match) {
      return `https://${match[1]}.supabase.co/storage/v1/object/public/${BUCKET}/${key}`
    }
  }
  // Standard S3 URL format
  return `${process.env.STORAGE_ENDPOINT}/${BUCKET}/${key}`
}

async function ensureLocalDir() {
  try {
    await fs.access(LOCAL_UPLOAD_DIR)
  } catch {
    await fs.mkdir(LOCAL_UPLOAD_DIR, { recursive: true })
  }
}

export async function uploadFile(
  file: Buffer,
  originalName: string,
  contentType: string
): Promise<{ url: string; key: string }> {
  const ext = path.extname(originalName)
  const key = `properties/${uuidv4()}${ext}`

  // Log storage config for debugging (remove in production)
  console.log('Storage config:', {
    USE_S3,
    isSupabase,
    endpoint: process.env.STORAGE_ENDPOINT ? 'set' : 'not set',
    bucket: BUCKET || 'not set',
    hasAccessKey: !!process.env.STORAGE_ACCESS_KEY,
    hasSecretKey: !!process.env.STORAGE_SECRET_KEY,
  })

  if (USE_S3 && s3Client) {
    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: file,
          ContentType: contentType,
          // Supabase doesn't support ACL, bucket must be set to public in dashboard
          ...(isSupabase ? {} : { ACL: 'public-read' }),
        })
      )

      const url = getPublicUrl(key)
      console.log('Upload successful:', { key, url })
      return { url, key }
    } catch (s3Error) {
      console.error('S3 upload error:', s3Error)
      throw new Error(`S3 upload failed: ${s3Error instanceof Error ? s3Error.message : 'Unknown error'}`)
    }
  } else {
    // Local storage fallback - won't work on Vercel serverless
    throw new Error('S3 storage not configured. Please set STORAGE_ENDPOINT, STORAGE_BUCKET, STORAGE_ACCESS_KEY, and STORAGE_SECRET_KEY environment variables.')
  }
}

export async function deleteFile(key: string): Promise<void> {
  if (USE_S3 && s3Client) {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      })
    )
  } else {
    const localPath = path.join(LOCAL_UPLOAD_DIR, key.replace('properties/', ''))
    try {
      await fs.unlink(localPath)
    } catch (error) {
      console.error('Failed to delete local file:', error)
    }
  }
}

export async function getPresignedUploadUrl(
  fileName: string,
  contentType: string
): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  const ext = path.extname(fileName)
  const key = `properties/${uuidv4()}${ext}`

  if (USE_S3 && s3Client) {
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
    })

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    const publicUrl = getPublicUrl(key)

    return { uploadUrl, key, publicUrl }
  }

  // For local storage, we don't use presigned URLs
  throw new Error('Presigned URLs not supported for local storage')
}

export function isS3Enabled(): boolean {
  return USE_S3
}
