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
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 p-6 border border-neutral-light hover:border-primary transition hover:shadow-lg transform hover:scale-105 duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-300" />

          <div className="relative z-10">
            <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
              {category}
            </span>

            <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition">
              {title}
            </h3>

            <p className="text-sm text-neutral-dark line-clamp-3 mb-4">{problem}</p>

            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 2).map((tag, i) => (
                <span key={i} className="text-xs bg-neutral-light px-2 py-1 rounded text-neutral-dark">
                  #{tag}
                </span>
              ))}
              {tags.length > 2 && <span className="text-xs text-primary">+{tags.length - 2} more</span>}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
