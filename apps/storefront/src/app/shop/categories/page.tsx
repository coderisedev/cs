import Link from 'next/link'
import categories from '../../../lib/categories'

export const dynamic = 'force-dynamic'

export default function CategoriesPage() {
  const entries = Object.entries(categories as Record<string, { name: string; handles: string[] }>)
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Categories</h1>
      {!entries.length ? (
        <p className="text-gray-600">No categories available.</p>
      ) : (
        <ul className="space-y-3">
          {entries.map(([slug, c]) => (
            <li key={slug}>
              <Link className="text-blue-600 underline" href={`/shop/category/${slug}`}>
                {c.name} ({c.handles.length})
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
