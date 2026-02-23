import Link from "next/link"
import { Heart } from "lucide-react"

export function IdeaGridCard({
  id,
  title,
  problem,
  category,
  tags,
  featured,
}: {
  id: string
  title: string
  problem: string
  category: string
  tags: string[]
  featured?: boolean
}) {
  return (
    <Link href={`/ideas/${id}`}>
      <div className="group h-full cursor-pointer">
        <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-border/60 p-6 card-hover h-full flex flex-col">
          {featured && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
              <Heart className="w-3 h-3 fill-current" />
              Featured
            </div>
          )}

          <div className="flex-1">
            <div className="inline-block text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full mb-3">
              {category}
            </div>

            <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors duration-200">
              {title}
            </h3>

            <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">{problem}</p>
          </div>

          <div className="flex flex-wrap gap-2 pt-4 border-t border-border/40">
            {tags.slice(0, 2).map((tag, i) => (
              <span key={i} className="text-xs bg-muted/80 text-muted-foreground px-2.5 py-1 rounded-full">
                #{tag}
              </span>
            ))}
            {tags.length > 2 && <span className="text-xs text-emerald-600 font-medium">+{tags.length - 2}</span>}
          </div>
        </div>
      </div>
    </Link>
  )
}
