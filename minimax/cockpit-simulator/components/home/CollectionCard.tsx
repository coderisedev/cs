import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { Collection } from '@/types'

interface CollectionCardProps {
  collection: Collection
}

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <Card className="group overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300">
      <Link href={`/collections/${collection.handle}`}>
        <div className="relative overflow-hidden aspect-[4/3] bg-gray-100">
          <img
            src={collection.image}
            alt={collection.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
            <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">{collection.title}</h3>
            <p className="text-xs sm:text-sm text-white/90 mb-2 sm:mb-3 line-clamp-2">{collection.description}</p>
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium">
              <span>Explore {collection.productCount} products</span>
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>
    </Card>
  )
}
