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
        <div className="relative overflow-hidden rounded-xl bg-card border border-border p-6 hover:border-primary hover:shadow-lg transition-all duration-300 h-full flex flex-col hover:scale-[1.02]">
          {featured && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-accent text-white text-xs font-semibold px-2 py-1 rounded-full">
              <Heart className="w-3 h-3 fill-current" />
              Featured
            </div>
          )}

          <div className="flex-1">
            <div className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
              {category}
            </div>

            <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition">
              {title}
            </h3>

            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{problem}</p>
          </div>

          <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
            {tags.slice(0, 2).map((tag, i) => (
              <span key={i} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                #{tag}
              </span>
            ))}
            {tags.length > 2 && <span className="text-xs text-primary font-medium">+{tags.length - 2}</span>}
          </div>
        </div>
      </div>
    </Link>
  )
}
