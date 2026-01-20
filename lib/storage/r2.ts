import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { Readable } from "stream"

const endpoint = process.env.R2_ENDPOINT
const accessKey = process.env.R2_ACCESS_KEY
const secretKey = process.env.R2_SECRET_KEY
const bucket = process.env.R2_BUCKET

if (!endpoint || !accessKey || !secretKey || !bucket) {
  // We'll throw at runtime when used — keep startup tolerant for local dev.
}

const s3 = new S3Client({
  endpoint: endpoint,
  region: "auto",
  credentials: {
    accessKeyId: accessKey || "",
    secretAccessKey: secretKey || "",
  },
  forcePathStyle: false,
})

export async function uploadToR2(key: string, body: Buffer | Readable | Blob, contentType?: string) {
  const input = {
    Bucket: bucket!,
    Key: key,
    Body: (body as any),
    ContentType: contentType || undefined,
  }
  const cmd = new PutObjectCommand(input)
  await s3.send(cmd)
  // Public URL pattern for R2
  const publicUrl = `${endpoint}/${bucket}/${encodeURIComponent(key)}`
  return { publicUrl }
}

export async function createSignedUrlR2(key: string, expiresSeconds = 60) {
  const cmd = new GetObjectCommand({ Bucket: bucket!, Key: key })
  const url = await getSignedUrl(s3, cmd, { expiresIn: expiresSeconds })
  return url
}

export async function getPublicUrl(key: string) {
  return `${endpoint}/${bucket}/${encodeURIComponent(key)}`
}
