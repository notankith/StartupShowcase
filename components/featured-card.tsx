import Link from "next/link"

export function FeaturedCard({
  id,
  title,
  problem,
  category,
  tags,
}: {
  id: string
  title: string
  problem: string
  category: string
  tags: string[]
}) {
  return (
    <Link href={`/ideas/${id}`}>
      <div className="group cursor-pointer h-full">
        <div className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-sm p-6 border border-border/40 card-hover hover:border-emerald-200/60 duration-300">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-50/50 rounded-full -mr-14 -mt-14 group-hover:scale-150 transition-transform duration-500" />

          <div className="relative z-10">
            <span className="inline-block text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full mb-3">
              {category}
            </span>

            <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors duration-200">
              {title}
            </h3>

            <p className="text-sm text-foreground/55 line-clamp-3 mb-4 leading-relaxed">{problem}</p>

            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 2).map((tag, i) => (
                <span key={i} className="text-xs bg-foreground/5 px-2 py-1 rounded-full text-foreground/60">
                  #{tag}
                </span>
              ))}
              {tags.length > 2 && <span className="text-xs text-emerald-600 font-medium">+{tags.length - 2} more</span>}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
