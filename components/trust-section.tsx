"use client"

import CountUp from "@/components/ui/count-up"
import { useScrollReveal } from "@/components/use-scroll-reveal"

const METRICS = [
  { value: 100, suffix: "+", label: "Ideas mentored", color: "text-emerald-600" },
  { value: 25, suffix: "+", label: "MVPs built", color: "text-violet-600" },
  { value: 10, suffix: "+", label: "Industry mentors", color: "text-teal-600" },
  { value: 5, suffix: "+", label: "Partner labs", color: "text-amber-600" },
]

export function TrustSection() {
  const [ref, visible] = useScrollReveal<HTMLDivElement>(0.2)

  return (
    <section ref={ref} className="px-4 sm:px-6 lg:px-8 py-16 md:py-20 border-b border-border/30">
      <div className="max-w-5xl mx-auto">
        <p className={`text-center text-sm text-foreground/50 font-medium tracking-wide mb-8 transition-all duration-500 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>Trusted by students and mentors across disciplines</p>
        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 transition-all duration-700 ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {METRICS.map(({ value, suffix, label, color }, i) => (
            <div
              key={label}
              className="group relative rounded-2xl border border-border/50 bg-white/60 backdrop-blur-sm p-6 text-center hover:shadow-lg hover:border-border transition-all duration-300 hover:-translate-y-1"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className={`text-3xl sm:text-4xl font-bold ${color}`}>
                <CountUp end={value} suffix={suffix} className="inline-block" />
              </div>
              <div className="text-sm text-foreground/60 mt-1.5 font-medium">{label}</div>
              {/* Subtle glow on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-50/0 to-emerald-50/0 group-hover:from-emerald-50/50 group-hover:to-teal-50/30 transition-all duration-300 -z-10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
