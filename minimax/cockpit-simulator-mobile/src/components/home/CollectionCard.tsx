import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Card } from '../ui/card'
import type { Collection } from '../../types'

interface CollectionCardProps {
  collection: Collection
}

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <Card className="group overflow-hidden cursor-pointer bg-background-secondary border-0 shadow-card card-hover rounded-md">
      <Link to={`/collections/${collection.handle}`}>
        <div className="relative overflow-hidden aspect-[4/3] bg-background-elevated">
          <img
            src={collection.image}
            alt={collection.title}
            className="w-full h-full object-cover image-hover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-foreground-primary transition-colors duration-300">
            <h3 className="text-xl font-bold mb-2">{collection.title}</h3>
            <p className="text-sm text-foreground-secondary mb-3 line-clamp-2 transition-colors duration-300">{collection.description}</p>
            <div className="flex items-center gap-2 text-sm font-medium text-primary-400 group-hover:text-primary-300 transition-colors">
              <span>Explore {collection.productCount} products</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>
    </Card>
  )
}
