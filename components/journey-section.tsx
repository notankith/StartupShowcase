"use client"

import { useScrollReveal } from "@/components/use-scroll-reveal"
import { useEffect, useRef, useState } from "react"

const STEPS = [
  { title: "Acquire", description: "Accelerate growth with targeted audience outreach." },
  { title: "Engage", description: "Immerse customers in seamless digital experiences." },
  { title: "Empower", description: "Support customers with AI-powered care in their channel of choice." },
  { title: "Safeguard", description: "Protect your customers and brand with trust and safety services." },
  { title: "Expand", description: "Grow lifetime value with personalized, data-driven engagement." },
]

const DOT_POSITIONS = [
  { x: 108, y: 102.7 },
  { x: 354, y: 84.5 },
  { x: 600, y: 155.5 },
  { x: 846, y: 155.9 },
  { x: 1092, y: 75.7 },
]

export function JourneySection() {
  const [ref, visible] = useScrollReveal<HTMLDivElement>(0.15)
  const containerRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const [progress, setProgress] = useState(0)

  const activeIndex = Math.floor(progress * STEPS.length)

  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength()
      pathRef.current.style.strokeDasharray = length.toString()
    }
  }, [])

  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength()
      pathRef.current.style.strokeDashoffset = (length * (1 - progress)).toString()
    }
  }, [progress])

  useEffect(() => {
    if (!visible) {
      setProgress(0)
      return
    }

    let startTime: number
    const duration = 2000
    const animate = (time: number) => {
      if (!startTime) startTime = time
      const elapsed = time - startTime
      const p = Math.min(elapsed / duration, 1)
      setProgress(p)
      if (p < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [visible])

  return (
    <section ref={ref} className="relative px-4 sm:px-6 lg:px-8 py-24 overflow-hidden bg-white">
      <div ref={containerRef} className="max-w-7xl mx-auto">
        {/* Heading */}
        <div
          className={`text-center mb-20 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Win the <span className="font-black">moments</span> that matter
          </h2>
          <p className="text-violet-600 font-medium">
            End-to-end solutions across the customer journey
          </p>
        </div>

        {/* Desktop */}
        <div className="hidden md:block relative">
          {/* Curve */}
          <svg
            className="absolute -top-20 left-0 w-full h-[300px] pointer-events-none"
            viewBox="0 0 1200 300"
            preserveAspectRatio="none"
            fill="none"
          >
            <defs>
              <linearGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#5B21B6" />
              </linearGradient>

              <filter id="glow">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <path
              ref={pathRef}
              d="M 0 140 
                 C 220 50, 360 70, 520 130
                 S 780 180, 940 130
                 S 1120 45, 1200 80"
              stroke="url(#curveGrad)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              filter="url(#glow)"
            />

            {DOT_POSITIONS.map((pos, i) => (
              <line
                key={`line-${i}`}
                x1={pos.x}
                y1={pos.y}
                x2={pos.x}
                y2="280"
                stroke="#E5E7EB"
                strokeWidth="1"
              />
            ))}

            {DOT_POSITIONS.map((pos, i) => {
              const isActive = i <= activeIndex
              return (
                <g key={`dot-${i}`}>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="2.5"
                    fill={isActive ? "#8B5CF6" : "#D1D5DB"}
                    filter={isActive ? "url(#glow)" : ""}
                  />
                  {isActive && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="10"
                      fill="none"
                      stroke="#C4B5FD"
                      strokeWidth="2"
                      opacity="0.4"
                      filter="url(#glow)"
                    />
                  )}
                </g>
              )
            })}
          </svg>

          {/* Steps */}
          <div className="grid grid-cols-5 gap-8 pt-[280px] relative z-10">
            {STEPS.map((step, i) => {
              const isActive = i <= activeIndex

              return (
                <div
                  key={step.title}
                  className={`flex flex-col items-center text-center transition-all duration-500 ${
                    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  } ${isActive ? "shadow-[0_0_16px_rgba(139,92,246,0.4)]" : ""}`}
                  style={{ transitionDelay: `${200 + i * 120}ms` }}
                >
                  <h3 className={`text-sm font-semibold mb-1 transition-colors duration-500 ${
                    isActive ? "text-violet-600" : "text-foreground"
                  }`}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-foreground/60 max-w-[160px] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden space-y-6 pt-8">
          {STEPS.map((step, i) => {
            const isActive = i <= activeIndex

            return (
              <div
                key={step.title}
                className={`flex gap-4 items-start transition-all duration-500 ${
                  visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                }`}
                style={{ transitionDelay: `${150 + i * 100}ms` }}
              >
                <div className={`flex-shrink-0 mt-3 w-2 h-2 rounded-full transition-all duration-500 ${
                  isActive 
                    ? "bg-violet-600 shadow-[0_0_10px_rgba(139,92,246,0.5)]" 
                    : "bg-gray-300"
                }`} />
                <div>
                  <h3 className={`text-sm font-semibold transition-colors duration-500 ${
                    isActive ? "text-violet-600" : "text-foreground"
                  }`}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-foreground/60 mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}