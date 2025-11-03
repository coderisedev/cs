"use client"

import { Fragment, useState, useEffect } from "react"
import { Dialog, DialogPanel, Transition } from "@headlessui/react"
import { XMark } from "@medusajs/icons"
import { useRouter } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

type SearchModalProps = {
  isOpen: boolean
  onClose: () => void
}

type SearchResult = {
  id: string
  title: string
  handle: string
  thumbnail?: string
  price?: string
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Mock search function - replace with actual Medusa search API
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const searchProducts = async () => {
      setLoading(true)
      try {
        // TODO: Replace with actual Medusa product search
        // const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        // const data = await response.json()
        // setResults(data.products)
        
        // Mock results for now
        setResults([])
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(searchProducts, 300)
    return () => clearTimeout(debounce)
  }, [query])

  const handleClose = () => {
    setQuery("")
    setResults([])
    onClose()
  }

  const handleResultClick = (handle: string) => {
    handleClose()
    router.push(`/products/${handle}`)
  }

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={handleClose} className="relative z-50">
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal Panel */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4 pt-20">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-background-primary shadow-2xl transition-all">
                {/* Search Input */}
                <div className="flex items-center gap-4 p-4 border-b border-border">
                  <svg
                    className="w-5 h-5 text-foreground-secondary flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products..."
                    className="flex-1 bg-transparent text-lg outline-none text-foreground-primary placeholder:text-foreground-secondary"
                    autoFocus
                    data-testid="search-input"
                  />
                  <button
                    onClick={handleClose}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-background-secondary transition-colors"
                    data-testid="close-search-button"
                  >
                    <XMark className="w-6 h-6" />
                  </button>
                </div>

                {/* Results */}
                <div className="max-h-96 overflow-y-auto p-4">
                  {loading && (
                    <div className="text-center py-8 text-foreground-secondary">
                      Searching...
                    </div>
                  )}

                  {!loading && query && results.length === 0 && (
                    <div className="text-center py-8 text-foreground-secondary">
                      No products found for "{query}"
                    </div>
                  )}

                  {!loading && results.length > 0 && (
                    <div className="space-y-2">
                      {results.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleResultClick(result.handle)}
                          className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-background-secondary transition-colors text-left"
                        >
                          {result.thumbnail && (
                            <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-background-secondary">
                              <Image
                                src={result.thumbnail}
                                alt={result.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-medium text-foreground-primary">
                              {result.title}
                            </h3>
                            {result.price && (
                              <p className="text-sm text-foreground-secondary">
                                {result.price}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {!query && (
                    <div className="text-center py-8 text-foreground-secondary">
                      <p className="mb-4">Start typing to search products</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <LocalizedClientLink
                          href="/store"
                          onClick={handleClose}
                          className="px-4 py-2 rounded-full bg-background-secondary hover:bg-primary hover:text-white transition-colors text-sm"
                        >
                          Browse All Products
                        </LocalizedClientLink>
                        <LocalizedClientLink
                          href="/collections"
                          onClick={handleClose}
                          className="px-4 py-2 rounded-full bg-background-secondary hover:bg-primary hover:text-white transition-colors text-sm"
                        >
                          View Collections
                        </LocalizedClientLink>
                      </div>
                    </div>
                  )}
                </div>
              </DialogPanel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
