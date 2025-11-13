"use client"

import React from "react"

export function FileOpener({ url, name }: { url: string; name?: string }) {
  const [loading, setLoading] = React.useState(false)

  const open = React.useCallback(
    (e: React.MouseEvent) => {
      // Use preventDefault + stopImmediatePropagation to block any parent
      // or delegated handlers. This is important to avoid duplicate
      // navigation when the FileOpener sits inside other clickable UI.
      try {
        e.preventDefault()
      } catch (err) {}
      try {
        e.stopPropagation()
      } catch (err) {}
      try {
        const native = (e as unknown as { nativeEvent?: any }).nativeEvent
        if (native && typeof native.stopImmediatePropagation === 'function') {
          native.stopImmediatePropagation()
        }
      } catch (err) {
        // ignore
      }
      if (!url) {
        // eslint-disable-next-line no-console
        console.error('FileOpener: missing url')
        return
      }
      setLoading(true)
      try {
        // Open in the current tab deliberately per user's request.
        // Use assign so it behaves like a navigation but is explicit.
        window.location.assign(url)
      } catch (err) {
        try {
          const a = document.createElement('a')
          a.href = url
          a.target = '_self'
          a.rel = 'noopener noreferrer'
          document.body.appendChild(a)
          a.click()
          a.remove()
        } catch (err2) {
          // eslint-disable-next-line no-console
          console.error('FileOpener: failed to open url', err2)
        }
      } finally {
        setLoading(false)
      }
    },
    [url]
  )

  return (
    // Use onClickCapture so this handler runs in the capture phase before any
    // parent/bubbled handlers. That prevents parents (Links / delegated
    // listeners) from also navigating.
    <button
      type="button"
      onClickCapture={open}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border border-border hover:bg-primary/5"
      disabled={loading}
    >
      {loading ? 'Opening...' : 'Open'}
    </button>
  )
}
