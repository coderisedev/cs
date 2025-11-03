import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Collection } from '@/types'

interface CollectionCardProps {
  collection: Collection
}

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <Link
      to={`/collections/${collection.handle}`}
      className="group relative overflow-hidden rounded-lg aspect-square bg-gray-100"
    >
      <img
        src={collection.image}
        alt={collection.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">{collection.title}</h3>
        <p className="text-sm text-gray-200 mb-3">{collection.description}</p>
        <div className="flex items-center text-sm font-medium group-hover:translate-x-1 transition-transform">
          查看商品
          <ArrowRight className="ml-1 h-4 w-4" />
        </div>
      </div>
    </Link>
  )
}
