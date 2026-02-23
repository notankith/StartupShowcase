"use client"

import React from "react"

function isValidUrl(u: unknown): u is string {
  if (typeof u !== 'string') return false
  if (!u || u === '[object Object]' || u === '[object Promise]') return false
  return true
}

export function FileOpener({ url, name, ideaId }: { url: unknown; name?: string; ideaId?: string }) {
  const [loading, setLoading] = React.useState(false)

  const open = React.useCallback(
    async (e: React.MouseEvent) => {
      try { e.preventDefault() } catch {}
      try { e.stopPropagation() } catch {}
      try {
        const native = (e as unknown as { nativeEvent?: any }).nativeEvent
        if (native && typeof native.stopImmediatePropagation === 'function') {
          native.stopImmediatePropagation()
        }
      } catch {}

      setLoading(true)
      try {
        let targetUrl: string | null = null

        if (isValidUrl(url)) {
          // For R2-hosted files, request a time-limited signed URL from the server
          if (url.includes('.r2.cloudflarestorage.com')) {
            const res = await fetch('/api/files/signed', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ fileUrl: url }),
            })
            if (res.ok) {
              const data = await res.json()
              targetUrl = data.url || url
            } else {
              targetUrl = url
            }
          } else {
            targetUrl = url
          }
        }

        // If URL is broken/empty but we have ideaId, try listing files via idea-files API
        if (!targetUrl && ideaId && name) {
          // Ask the signed endpoint with a reconstructed key pattern
          // The key is ideaId/timestamp-filename — we can't know timestamp, but
          // we can use the /api/idea-files endpoint to get the actual file_url first
          const listRes = await fetch(`/api/idea-files/${ideaId}`)
          if (listRes.ok) {
            const listData = await listRes.json()
            const files = listData.data || listData || []
            const match = Array.isArray(files)
              ? files.find((f: any) => f.file_name === name && isValidUrl(f.file_url))
              : null
            if (match) {
              const res = await fetch('/api/files/signed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ fileUrl: match.file_url }),
              })
              if (res.ok) {
                const data = await res.json()
                targetUrl = data.url || match.file_url
              }
            }
          }
        }

        if (!targetUrl) {
          alert('File URL is broken. Please run the migration endpoint to fix file URLs.')
          return
        }

        window.open(targetUrl, '_blank', 'noopener,noreferrer')
      } catch (err) {
        console.error('FileOpener: failed to open url', err)
        if (isValidUrl(url)) window.open(url, '_blank', 'noopener,noreferrer')
      } finally {
        setLoading(false)
      }
    },
    [url, ideaId, name]
  )

  return (
    <button
      type="button"
      onClickCapture={open}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border border-border hover:bg-primary/5"
      disabled={loading}
    >
      {loading ? 'Opening...' : name ? `Open ${name}` : 'Open'}
    </button>
  )
}
