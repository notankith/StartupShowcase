"use client"

import React, { useEffect, useRef, useState } from "react"

type CountUpProps = {
  end: number | string
  duration?: number
  suffix?: string
  className?: string
}

export default function CountUp({ end, duration = 1200, suffix = "", className = "" }: CountUpProps) {
  const [value, setValue] = useState<number>(0)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  // parse numeric part if `end` is a string with suffix
  const parsed = typeof end === "string" ? parseFloat(end.replace(/[^0-9.\-]/g, "")) || 0 : end
  const target = Number(parsed || 0)

  useEffect(() => {
    const start = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp
      const elapsed = timestamp - (startRef.current || 0)
      const progress = Math.min(elapsed / duration, 1)
      const current = Math.round(target * progress)
      setValue(current)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(start)
      }
    }

    rafRef.current = requestAnimationFrame(start)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      startRef.current = null
    }
  }, [target, duration])

  // choose display: if original end was a string and contains a non-digit suffix, show suffix
  let suffixToShow = suffix
  if (!suffixToShow && typeof end === "string") {
    const m = end.match(/[^0-9.\-]+$/)
    if (m) suffixToShow = m[0]
  }

  return (
    <div className={className}>
      {value}
      {suffixToShow}
    </div>
  )
}
