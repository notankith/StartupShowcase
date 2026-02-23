"use client"

import { useScrollReveal } from "@/components/use-scroll-reveal"

const STEPS = [
  { title: "Ideate", description: "Start with a problem worth solving and shape it into a concept.", icon: "💡" },
  { title: "Validate", description: "Test your assumptions with real users and market data.", icon: "🔍" },
  { title: "Build", description: "Turn your validated idea into a working MVP with our builders.", icon: "🛠️" },
  { title: "Launch", description: "Go live, acquire early adopters, and start measuring impact.", icon: "🚀" },
  { title: "Scale", description: "Grow with mentors, partners, and strategic guidance.", icon: "📈" },
]

export function JourneySection() {
  const [ref, visible] = useScrollReveal<HTMLDivElement>(0.15)

  return (
    <section ref={ref} className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div
          className={`text-center mb-12 md:mb-16 transition-all duration-600 ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Your journey to launch</h2>
          <p className="text-foreground/60 max-w-lg mx-auto">
            From first spark to global scale — we guide you through every phase.
          </p>
        </div>

        {/* Desktop: horizontal curved path */}
        <div className="hidden md:block relative">
          {/* SVG curve connecting the nodes */}
          <svg
            className="absolute top-16 left-0 w-full h-12 pointer-events-none"
            viewBox="0 0 1000 50"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="M 0 25 Q 125 0, 250 25 T 500 25 T 750 25 T 1000 25"
              stroke="url(#curveGrad)"
              strokeWidth="2"
              strokeDasharray="1000"
              strokeDashoffset={visible ? "0" : "1000"}
              style={{ transition: "stroke-dashoffset 1.8s ease-in-out 0.3s" }}
            />
            <defs>
              <linearGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#059669" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#14b8a6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
              </linearGradient>
            </defs>
          </svg>

          <div className="grid grid-cols-5 gap-4 relative z-10">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className={`flex flex-col items-center text-center transition-all duration-500 ease-out ${
                  visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${300 + i * 150}ms` }}
              >
                {/* Glowing node */}
                <div className="group relative mb-4">
                  <div className="w-14 h-14 rounded-full bg-white border-2 border-emerald-200 shadow-md flex items-center justify-center text-2xl
                    group-hover:border-emerald-400 group-hover:shadow-lg group-hover:shadow-emerald-200/50 transition-all duration-300 group-hover:scale-110">
                    {step.icon}
                  </div>
                  {/* Pulse ring on hover */}
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-300/0 group-hover:border-emerald-300/40 group-hover:scale-150 transition-all duration-500 pointer-events-none" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1">{step.title}</h3>
                <p className="text-xs text-foreground/55 leading-relaxed max-w-[160px]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: vertical timeline */}
        <div className="md:hidden space-y-6">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className={`flex gap-4 items-start transition-all duration-500 ease-out ${
                visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              }`}
              style={{ transitionDelay: `${200 + i * 120}ms` }}
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-emerald-200 shadow-sm flex items-center justify-center text-xl">
                {step.icon}
              </div>
              <div className="pt-1">
                <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
                <p className="text-xs text-foreground/55 mt-0.5 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
