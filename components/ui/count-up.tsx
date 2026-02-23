"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"

type CountUpProps = {
  end: number | string
  duration?: number
  suffix?: string
  className?: string
}

export default function CountUp({ end, duration = 1400, suffix = "", className = "" }: CountUpProps) {
  const [value, setValue] = useState<number>(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  const parsed = typeof end === "string" ? parseFloat(end.replace(/[^0-9.\-]/g, "")) || 0 : end
  const target = Number(parsed || 0)

  // Intersection observer — start counting only when visible
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); obs.disconnect() } },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    const animate = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp
      const elapsed = timestamp - (startRef.current || 0)
      // Ease-out quad
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - (1 - t) * (1 - t)
      const current = Math.round(target * eased)
      setValue(current)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      startRef.current = null
    }
  }, [started, target, duration])

  let suffixToShow = suffix
  if (!suffixToShow && typeof end === "string") {
    const m = end.match(/[^0-9.\-]+$/)
    if (m) suffixToShow = m[0]
  }

  return (
    <div ref={ref} className={className}>
      {value}
      {suffixToShow}
    </div>
  )
}
