import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, User, Tag, Search, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BlogPost, BlogCategory } from '@/types'

// Mock data
const mockCategories: BlogCategory[] = [
  { id: '1', name: 'Flight Simulation', slug: 'flight-simulation', description: 'Latest trends and insights in flight simulation', postCount: 12 },
  { id: '2', name: 'Product Reviews', slug: 'product-reviews', description: 'In-depth reviews of cockpit simulator products', postCount: 8 },
  { id: '3', name: 'Tutorials', slug: 'tutorials', description: 'Step-by-step guides and tutorials', postCount: 15 },
  { id: '4', name: 'Industry News', slug: 'industry-news', description: 'Latest news from the aviation industry', postCount: 6 },
  { id: '5', name: 'Technology', slug: 'technology', description: 'Cutting-edge technology in flight simulation', postCount: 9 },
]

const mockPosts: BlogPost[] = [
  {
    id: '1',
    title: 'The Evolution of Flight Simulation Technology',
    slug: 'evolution-flight-simulation-technology',
    excerpt: 'Explore how flight simulation has transformed from simple computer programs to incredibly realistic experiences that rival actual flight training.',
    content: 'Full article content here...',
    author: 'Sarah Johnson',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    publishDate: '2024-10-28',
    readTime: 8,
    category: 'flight-simulation',
    tags: ['technology', 'innovation', 'simulation'],
    featuredImage: 'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800&h=400&fit=crop',
    isPublished: true,
    views: 1250
  },
  {
    id: '2',
    title: 'A320 CDU vs Traditional Instruments: A Comprehensive Comparison',
    slug: 'a320-cdu-vs-traditional-instruments',
    excerpt: 'Detailed analysis of how the A320 Control Display Unit compares to traditional flight instruments in terms of functionality and user experience.',
    content: 'Full article content here...',
    author: 'Michael Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    publishDate: '2024-10-25',
    readTime: 12,
    category: 'product-reviews',
    tags: ['a320', 'cdu', 'comparison', 'instruments'],
    featuredImage: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=400&fit=crop',
    isPublished: true,
    views: 890
  },
  {
    id: '3',
    title: 'Building Your First Home Cockpit Simulator',
    slug: 'building-first-home-cockpit-simulator',
    excerpt: 'A complete guide to setting up your first home cockpit simulator, from hardware selection to software configuration.',
    content: 'Full article content here...',
    author: 'David Rodriguez',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    publishDate: '2024-10-22',
    readTime: 15,
    category: 'tutorials',
    tags: ['tutorial', 'beginner', 'setup', 'hardware'],
    featuredImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop',
    isPublished: true,
    views: 2100
  },
  {
    id: '4',
    title: 'The Future of Virtual Reality in Flight Training',
    slug: 'future-vr-flight-training',
    excerpt: 'How VR technology is revolutionizing flight training programs and making pilot education more accessible and effective.',
    content: 'Full article content here...',
    author: 'Emily Watson',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    publishDate: '2024-10-20',
    readTime: 10,
    category: 'technology',
    tags: ['vr', 'training', 'future', 'technology'],
    featuredImage: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc696?w=800&h=400&fit=crop',
    isPublished: true,
    views: 1567
  },
  {
    id: '5',
    title: 'Boeing 737 Series: Most Popular Cockpit Simulator Platform',
    slug: 'boeing-737-most-popular-simulator',
    excerpt: 'Understanding why the Boeing 737 series remains the most popular choice for cockpit simulator enthusiasts worldwide.',
    content: 'Full article content here...',
    author: 'Robert Kim',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    publishDate: '2024-10-18',
    readTime: 7,
    category: 'industry-news',
    tags: ['737', 'popular', 'platform', 'statistics'],
    featuredImage: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=400&fit=crop',
    isPublished: true,
    views: 980
  },
  {
    id: '6',
    title: 'Advanced FCU Programming Techniques',
    slug: 'advanced-fcu-programming-techniques',
    excerpt: 'Master advanced programming techniques for Flight Control Units to create more realistic and functional simulator experiences.',
    content: 'Full article content here...',
    author: 'Lisa Park',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    publishDate: '2024-10-15',
    readTime: 18,
    category: 'tutorials',
    tags: ['fcu', 'programming', 'advanced', 'techniques'],
    featuredImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
    isPublished: true,
    views: 743
  }
]

export function BlogPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 6

  const filteredPosts = useMemo(() => {
    return mockPosts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchTerm, selectedCategory])

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
  const startIndex = (currentPage - 1) * postsPerPage
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage)

  const getCategoryName = (slug: string) => {
    const category = mockCategories.find(cat => cat.slug === slug)
    return category ? category.name : 'All Posts'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="container mx-auto px-4 lg:px-12 py-8">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-foreground-primary transition-colors duration-300">
          Flight Simulation Blog
        </h1>
        <p className="text-xl text-foreground-secondary max-w-3xl mx-auto transition-colors duration-300">
          Discover the latest insights, tutorials, and industry news in flight simulation technology
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted h-5 w-5" />
          <Input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background-elevated border-border-primary text-foreground-primary placeholder:text-foreground-muted focus:border-primary-500 focus:ring-primary-500 transition-colors duration-300"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedCategory('all')
              setCurrentPage(1)
            }}
            className="transition-colors duration-300"
          >
            All Posts
          </Button>
          {mockCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.slug ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedCategory(category.slug)
                setCurrentPage(1)
              }}
              className="transition-colors duration-300"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Featured Post */}
      {currentPage === 1 && filteredPosts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-foreground-primary transition-colors duration-300">
            Featured Article
          </h2>
          <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img
                  src={filteredPosts[0].featuredImage}
                  alt={filteredPosts[0].title}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <span className="px-3 py-1 bg-primary-500 text-white text-sm rounded-full">
                    {getCategoryName(filteredPosts[0].category)}
                  </span>
                  <div className="flex items-center text-foreground-muted text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {filteredPosts[0].readTime} min read
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground-primary transition-colors duration-300">
                  {filteredPosts[0].title}
                </h3>
                <p className="text-foreground-secondary mb-4 transition-colors duration-300">
                  {filteredPosts[0].excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={filteredPosts[0].authorAvatar}
                      alt={filteredPosts[0].author}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground-primary">{filteredPosts[0].author}</p>
                      <p className="text-xs text-foreground-muted">{formatDate(filteredPosts[0].publishDate)}</p>
                    </div>
                  </div>
                  <Link to={`/blog/${filteredPosts[0].slug}`}>
                    <Button variant="outline" size="sm" className="group">
                      Read More
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Blog Posts Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-foreground-primary transition-colors duration-300">
          {selectedCategory === 'all' ? 'Latest Articles' : getCategoryName(selectedCategory)}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:transform hover:-translate-y-1">
              <div className="relative">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-background-primary/90 text-foreground-primary text-sm rounded-full backdrop-blur-sm">
                    {getCategoryName(post.category)}
                  </span>
                </div>
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg leading-tight hover:text-primary-500 transition-colors duration-300">
                  <Link to={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-foreground-muted mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(post.publishDate)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {post.readTime} min
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img
                      src={post.authorAvatar}
                      alt={post.author}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-foreground-primary">{post.author}</span>
                  </div>
                  <Link to={`/blog/${post.slug}`}>
                    <Button variant="ghost" size="sm" className="text-primary-500 hover:text-primary-400 p-0">
                      Read More
                    </Button>
                  </Link>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-background-elevated text-foreground-muted text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="transition-colors duration-300"
          >
            Previous
          </Button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className="transition-colors duration-300"
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="transition-colors duration-300"
          >
            Next
          </Button>
        </div>
      )}

      {/* No Results */}
      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-foreground-primary mb-2">No articles found</h3>
          <p className="text-foreground-secondary">Try adjusting your search terms or category filter.</p>
        </div>
      )}
    </div>
  )
}