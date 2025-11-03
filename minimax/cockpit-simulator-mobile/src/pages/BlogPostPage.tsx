import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Calendar, Clock, User, Tag, ArrowLeft, Share2, Heart, MessageCircle, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BlogPost } from '@/types'

// Mock data - 在实际应用中这些会从 API 获取
const mockPosts: BlogPost[] = [
  {
    id: '1',
    title: 'The Evolution of Flight Simulation Technology',
    slug: 'evolution-flight-simulation-technology',
    excerpt: 'Explore how flight simulation has transformed from simple computer programs to incredibly realistic experiences that rival actual flight training.',
    content: `# The Evolution of Flight Simulation Technology

Flight simulation has come a long way since its inception in the early days of computing. What started as simple programs displaying basic cockpit instruments has evolved into incredibly sophisticated systems that provide training experiences nearly indistinguishable from real flight.

## Early Days of Flight Simulation

In the 1970s and 1980s, flight simulators were primarily used for military training purposes. These early systems were expensive, complex, and required dedicated facilities. The graphics were rudimentary, often consisting of simple wireframe models and basic instrument displays.

## The Personal Computer Revolution

The advent of personal computers in the 1990s democratized flight simulation. Software like Microsoft Flight Simulator allowed enthusiasts to experience flying from their homes. These programs featured:

- Basic 3D graphics
- Real-world airport data
- Simple weather systems
- Instrument panel simulations

## Modern Flight Simulation

Today's flight simulation represents a quantum leap in technology and realism:

### Advanced Graphics
- Photorealistic environments
- Dynamic weather systems
- Realistic lighting and shadows
- Detailed aircraft models

### Sophisticated Systems
- Complete electrical systems simulation
- Hydraulic and pneumatic system modeling
- Advanced autopilot systems
- Realistic failure scenarios

### Hardware Integration
- Professional-grade flight controls
- Multiple monitor setups
- Motion platforms
- Virtual reality integration

## The Future of Flight Simulation

As technology continues to advance, we can expect to see:

- **Virtual Reality Integration**: VR technology is making flight simulation more immersive than ever before
- **AI-Powered Systems**: Artificial intelligence will enable more sophisticated training scenarios
- **Cloud-Based Simulation**: Remote servers will provide access to high-end simulation environments
- **Enhanced Haptics**: Touch feedback systems will provide more realistic control feel

## Impact on Aviation Training

Flight simulation has revolutionized aviation training by:

1. **Reducing Training Costs**: Simulators eliminate the need for expensive fuel and aircraft wear
2. **Improving Safety**: Dangerous scenarios can be practiced without risk
3. **Standardizing Training**: Consistent scenarios ensure all pilots receive the same training
4. **Enabling Repetition**: Complex procedures can be practiced repeatedly

## Conclusion

The evolution of flight simulation technology represents one of the most significant developments in aviation history. As we look to the future, these systems will continue to play an increasingly important role in pilot training and aviation safety.

The journey from simple computer programs to today's sophisticated simulation environments demonstrates the incredible pace of technological advancement in our industry.`,
    author: 'Sarah Johnson',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    publishDate: '2024-10-28',
    readTime: 8,
    category: 'flight-simulation',
    tags: ['technology', 'innovation', 'simulation', 'aviation', 'training'],
    featuredImage: 'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=1200&h=600&fit=crop',
    isPublished: true,
    views: 1250
  },
  {
    id: '2',
    title: 'A320 CDU vs Traditional Instruments: A Comprehensive Comparison',
    slug: 'a320-cdu-vs-traditional-instruments',
    excerpt: 'Detailed analysis of how the A320 Control Display Unit compares to traditional flight instruments in terms of functionality and user experience.',
    content: `# A320 CDU vs Traditional Instruments: A Comprehensive Comparison

The Airbus A320 series introduced a revolutionary approach to cockpit design with the Control Display Unit (CDU), moving away from traditional analog instruments. This comparison explores the advantages and considerations of this modern interface.

## What is the CDU?

The Control Display Unit (CDU) is the primary interface for the A320's Flight Management System (FMS). It features a monochrome display screen and alphanumeric keypad, serving as the brain of the aircraft's navigation and flight planning systems.

## Traditional Instrument Panel

Traditional instrument panels typically include:

- Analog gauges for airspeed, altitude, and attitude
- Separate navigation instruments
- Individual control panels for each system
- Physical switches and knobs for various functions

## Advantages of the CDU

### Integrated Information Display
The CDU consolidates multiple functions into a single interface:
- Flight planning and route management
- Performance calculations
- Navigation data
- System status monitoring

### Reduced Workload
Pilots can access all necessary information through one interface, reducing the need to scan multiple instruments.

### Error Reduction
Digital input reduces the possibility of misreading analog instruments and provides clear, unambiguous data.

### Flexibility
The CDU can be reprogrammed and updated with new software, unlike fixed analog instruments.

## Advantages of Traditional Instruments

### Immediate Visual Feedback
Analog instruments provide instant visual feedback through needle positions and mechanical indicators.

### No Learning Curve
Traditional instruments are intuitive and require minimal training for basic operation.

### Reliability
Simple mechanical systems have fewer points of failure compared to complex digital systems.

### Backup Systems
Analog instruments can serve as reliable backups when digital systems fail.

## User Experience Comparison

### Learning Curve
- **CDU**: Requires significant training and practice to master
- **Traditional**: Minimal learning curve for basic operation

### Information Density
- **CDU**: Can display complex information in a compact format
- **Traditional**: Information spread across multiple instruments

### Error Prevention
- **CDU**: Digital input reduces transcription errors
- **Traditional**: Prone to misreading and calculation errors

## Modern Implementation

Today's cockpit designs often combine both approaches:

### Hybrid Systems
- Primary flight displays with digital integration
- Traditional backup instruments
- Touchscreen interfaces for secondary functions

### Redundancy
Multiple systems ensure reliability
- Digital primary systems
- Analog backup instruments
- Independent power sources

## Training Implications

### CDU Training Requirements
- Extended ground school sessions
- Computer-based training modules
- Simulator practice sessions
- Regular proficiency checks

### Traditional Instrument Training
- Shorter training periods
- Direct hands-on experience
- Visual learning emphasis

## Cost Considerations

### Initial Investment
- CDU systems require significant upfront investment
- Traditional instruments have lower initial costs
- Long-term maintenance costs vary significantly

### Training Costs
- CDU training requires more extensive programs
- Traditional instrument training is more straightforward
- Ongoing proficiency requirements differ

## Future Trends

### Digital Integration
- Increased use of digital displays
- Touchscreen interfaces
- Voice control systems

### Artificial Intelligence
- AI-assisted flight planning
- Predictive maintenance alerts
- Automated system monitoring

## Conclusion

The choice between CDU and traditional instruments depends on various factors:

- **Training Philosophy**: Modern airlines favor integrated digital systems
- **Operational Requirements**: Complex flight operations benefit from CDU integration
- **Budget Constraints**: Traditional systems offer lower initial costs
- **Reliability Needs**: Redundant systems provide maximum safety

The A320's CDU represents a significant advancement in cockpit technology, offering improved efficiency and reduced workload for modern flight operations. However, traditional instruments continue to play important roles as reliable backup systems.

The future of cockpit design will likely see continued integration of digital technologies while maintaining the reliability and simplicity that traditional instruments provide.`,
    author: 'Michael Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    publishDate: '2024-10-25',
    readTime: 12,
    category: 'product-reviews',
    tags: ['a320', 'cdu', 'comparison', 'instruments', 'airbus'],
    featuredImage: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=1200&h=600&fit=crop',
    isPublished: true,
    views: 890
  },
  {
    id: '3',
    title: 'Building Your First Home Cockpit Simulator',
    slug: 'building-first-home-cockpit-simulator',
    excerpt: 'A complete guide to setting up your first home cockpit simulator, from hardware selection to software configuration.',
    content: `# Building Your First Home Cockpit Simulator

Creating a home cockpit simulator is an exciting project that can provide countless hours of realistic flight training and entertainment. This comprehensive guide will walk you through the entire process, from initial planning to final configuration.

## Planning Your Simulator

### Define Your Goals
Before starting, consider:
- **Primary Use**: Training, entertainment, or both?
- **Budget Range**: Determine your spending limit
- **Space Available**: Measure your designated area
- **Experience Level**: Beginner, intermediate, or advanced?

### Choose Your Aircraft
Popular choices for home simulators:
- **Boeing 737**: Most popular commercial aircraft
- **Airbus A320**: Modern fly-by-wire technology
- **Cessna 172**: Perfect for basic flight training
- **Piper Cherokee**: Great for instrument training

## Essential Hardware Components

### Flight Controls
1. **Yoke or Joystick**
   - Professional-grade yokes provide realistic feel
   - Force feedback enhances immersion
   - Consider left-hand throttle quadrant

2. **Throttle Quadrant**
   - Separate throttle, mixture, and prop controls
   - Multiple engine support
   - Backlit controls for night flying

3. **Pedals**
   - Rudder pedals for realistic control
   - Toe brakes for landing operations
   - Adjustable tension settings

### Instrument Panels
1. **Primary Flight Display (PFD)**
   - Essential flight instruments
   - Attitude indicator
   - Airspeed and altitude tapes

2. **Navigation Display (ND)**
   - Moving map functionality
   - Navigation aids
   - Traffic information

3. **Engine Indicating and Crew Alerting System (EICAS)**
   - Engine parameters
   - System warnings
   - Status messages

### Computer Requirements
- **Processor**: Intel i7 or AMD Ryzen 7 minimum
- **Graphics Card**: NVIDIA RTX 3070 or equivalent
- **Memory**: 16GB RAM minimum
- **Storage**: SSD for fast loading
- **Multiple Monitors**: 3-4 displays recommended

## Software Selection

### Flight Simulator Platform
1. **Microsoft Flight Simulator (2020)**
   - Excellent graphics and weather
   - Active development community
   - Built-in aircraft and airports

2. **X-Plane 11/12**
   - Realistic flight modeling
   - Extensive aircraft library
   - Customization options

3. **Prepar3D**
   - Professional-grade simulation
   - Military and civilian aircraft
   - Extensive add-on support

### Essential Add-ons
1. **Aircraft Payware**
   - High-fidelity aircraft models
   - Professional systems modeling
   - Detailed sound packages

2. **Scenery Packages**
   - Real-world airports
   - Enhanced terrain
   - Seasonal variations

3. **Weather Plugins**
   - Real weather integration
   - Dynamic weather systems
   - Historical weather data

## Building the Cockpit Structure

### Frame Construction
1. **Material Selection**
   - Aluminum extrusion: Lightweight and modular
   - Steel tubing: Strong and durable
   - Wood: Cost-effective and easy to work

2. **Design Considerations**
   - Ergonomic positioning
   - Cable management
   - Ventilation for electronics
   - Accessibility for maintenance

### Panel Integration
1. **Monitor Mounting**
   - Adjustable monitor arms
   - Proper viewing angles
   - Sun visor considerations

2. **Switch Panel Construction**
   - Toggle switches and buttons
   - LED indicators
   - Custom labeling

3. **Backlighting**
   - LED strip lighting
   - Dimmable controls
   - Color-coded systems

## Electronics and Wiring

### Power Distribution
- **12V DC Power Supply**: For LED lighting and switches
- **USB Hubs**: Multiple devices connection
- **Power Strips**: Organized power distribution

### Signal Processing
- **Arduino Microcontrollers**: Switch input processing
- **USB Interface Cards**: Multiple input handling
- **Network Cards**: System integration

### Cable Management
- **Cable Trays**: Organized wiring paths
- **Cable Ties**: Secure connections
- **Labeling System**: Easy identification

## Software Configuration

### Initial Setup
1. **Calibration**
   - Control sensitivity settings
   - Dead zone configuration
   - Force feedback adjustment

2. **Key Assignments**
   - Essential functions mapping
   - Custom key combinations
   - Emergency procedures

3. **Display Configuration**
   - Multi-monitor setup
   - Resolution optimization
   - Field of view settings

### Advanced Configuration
1. **Lua Scripting**: Custom automation
2. **Plugin Integration**: Third-party add-ons
3. **Network Setup**: Multi-player configuration

## Testing and Calibration

### Control Testing
- **Flight Test Procedures**: Systematic validation
- **Emergency Scenarios**: Failure mode testing
- **Precision Approaches**: IFR procedure validation

### System Integration
- **Communication Tests**: Radio and intercom verification
- **Navigation Accuracy**: GPS and instrument validation
- **Performance Verification**: Real-world comparison

## Maintenance and Upgrades

### Regular Maintenance
- **Cleaning Procedures**: Dust and debris removal
- **Connection Checks**: Loose wire inspection
- **Software Updates**: Keep systems current

### Upgrade Planning
- **Incremental Improvements**: Gradual enhancement
- **Technology Integration**: New hardware adoption
- **Feature Expansion**: Additional capabilities

## Budget Considerations

### Starter Setup ($1,000 - $3,000)
- Basic flight controls
- Single monitor setup
- Entry-level software

### Intermediate Setup ($3,000 - $8,000)
- Professional controls
- Multiple monitors
- High-quality add-ons

### Advanced Setup ($8,000+)
- Full cockpit replica
- Motion platform
- Professional-grade equipment

## Common Mistakes to Avoid

1. **Over-engineering**: Start simple and build gradually
2. **Poor Planning**: Measure twice, build once
3. **Inadequate Power**: Ensure sufficient electrical capacity
4. **Neglecting Ergonomics**: Comfort affects performance
5. **Insufficient Testing**: Validate all systems thoroughly

## Conclusion

Building a home cockpit simulator is a rewarding project that combines technical skills with aviation passion. Start with a solid plan, invest in quality components, and don't be afraid to iterate and improve over time.

Remember that the journey is as important as the destination. Each component you add and each configuration you perfect brings you closer to the ultimate goal: a realistic, functional flight simulation environment that provides endless hours of aviation enjoyment.

The key to success is patience, planning, and a willingness to learn. With the right approach, your home cockpit simulator will become a source of pride and a testament to your dedication to flight simulation.`,
    author: 'David Rodriguez',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    publishDate: '2024-10-22',
    readTime: 15,
    category: 'tutorials',
    tags: ['tutorial', 'beginner', 'setup', 'hardware', 'guide'],
    featuredImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=600&fit=crop',
    isPublished: true,
    views: 2100
  }
]

const relatedPosts = [
  {
    id: '4',
    title: 'The Future of Virtual Reality in Flight Training',
    slug: 'future-vr-flight-training',
    excerpt: 'How VR technology is revolutionizing flight training programs.',
    featuredImage: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc696?w=400&h=200&fit=crop',
    publishDate: '2024-10-20'
  },
  {
    id: '5',
    title: 'Boeing 737 Series: Most Popular Cockpit Simulator Platform',
    slug: 'boeing-737-most-popular-simulator',
    excerpt: 'Understanding why the Boeing 737 series remains the most popular choice.',
    featuredImage: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop',
    publishDate: '2024-10-18'
  },
  {
    id: '6',
    title: 'Advanced FCU Programming Techniques',
    slug: 'advanced-fcu-programming-techniques',
    excerpt: 'Master advanced programming techniques for Flight Control Units.',
    featuredImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop',
    publishDate: '2024-10-15'
  }
]

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(0)

  useEffect(() => {
    const foundPost = mockPosts.find(p => p.slug === slug)
    if (foundPost) {
      setPost(foundPost)
      setLikes(foundPost.views / 10) // Mock likes based on views
    }
  }, [slug])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(prev => isLiked ? prev - 1 : prev + 1)
  }

  const handleShare = () => {
    if (navigator.share && post) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href
      })
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 lg:px-12 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground-primary mb-4">Article Not Found</h1>
          <p className="text-foreground-secondary mb-6">The article you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/blog')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 lg:px-12 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/blog')} className="text-foreground-primary hover:text-primary-400">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Button>
      </div>

      {/* Article Header */}
      <article className="max-w-4xl mx-auto">
        <header className="mb-8">
          {/* Category and Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="px-3 py-1 bg-primary-500 text-white text-sm rounded-full">
              {post.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            <div className="flex items-center text-foreground-muted text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(post.publishDate)}
            </div>
            <div className="flex items-center text-foreground-muted text-sm">
              <Clock className="h-4 w-4 mr-1" />
              {post.readTime} min read
            </div>
            <div className="flex items-center text-foreground-muted text-sm">
              <Eye className="h-4 w-4 mr-1" />
              {post.views} views
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-bold mb-6 text-foreground-primary leading-tight transition-colors duration-300">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-xl text-foreground-secondary mb-8 leading-relaxed transition-colors duration-300">
            {post.excerpt}
          </p>

          {/* Author and Actions */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <div className="flex items-center space-x-4">
              <img
                src={post.authorAvatar}
                alt={post.author}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-medium text-foreground-primary">{post.author}</p>
                <p className="text-sm text-foreground-muted">Flight Simulation Expert</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLike}
                className={`transition-colors duration-300 ${isLiked ? 'text-red-500 border-red-500' : 'text-foreground-primary'}`}
              >
                <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {likes}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="mb-8">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-64 lg:h-96 object-cover rounded-base shadow-lg"
          />
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <div 
            className="text-foreground-primary leading-relaxed transition-colors duration-300"
            dangerouslySetInnerHTML={{ 
              __html: post.content
                .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-6 mt-8 text-foreground-primary">$1</h1>')
                .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mb-4 mt-8 text-foreground-primary">$1</h2>')
                .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mb-3 mt-6 text-foreground-primary">$1</h3>')
                .replace(/^\* (.*$)/gm, '<li class="mb-2">$1</li>')
                .replace(/^\d+\. (.*$)/gm, '<li class="mb-2">$1</li>')
                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground-primary">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                .replace(/\n\n/g, '</p><p class="mb-4">')
                .replace(/^/, '<p class="mb-4">')
                .replace(/$/, '</p>')
            }}
          />
        </div>

        {/* Tags */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-foreground-primary">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-background-elevated text-foreground-secondary text-sm rounded-full hover:bg-primary-500 hover:text-white transition-colors duration-300 cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Author Bio */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <img
                src={post.authorAvatar}
                alt={post.author}
                className="w-16 h-16 rounded-full"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground-primary mb-2">{post.author}</h3>
                <p className="text-foreground-secondary mb-3">
                  Sarah is a certified flight instructor with over 15 years of experience in both real and simulated flight environments. 
                  She specializes in advanced flight simulation techniques and cockpit technology integration.
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Follow</Button>
                  <Button variant="outline" size="sm">Message</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </article>

      {/* Related Posts */}
      <section className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-foreground-primary">Related Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedPosts.map((relatedPost) => (
            <Card key={relatedPost.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:transform hover:-translate-y-1">
              <div className="relative">
                <img
                  src={relatedPost.featuredImage}
                  alt={relatedPost.title}
                  className="w-full h-48 object-cover"
                />
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg leading-tight hover:text-primary-500 transition-colors duration-300">
                  <Link to={`/blog/${relatedPost.slug}`}>
                    {relatedPost.title}
                  </Link>
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {relatedPost.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-foreground-muted">
                  <span>{formatDate(relatedPost.publishDate)}</span>
                  <Link to={`/blog/${relatedPost.slug}`}>
                    <Button variant="ghost" size="sm" className="text-primary-500 hover:text-primary-400 p-0">
                      Read More
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Comments Section */}
      <section className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold mb-6 text-foreground-primary">Comments</h2>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground-primary mb-2">Join the Discussion</h3>
              <p className="text-foreground-secondary mb-4">Be the first to share your thoughts on this article.</p>
              <Button>Sign in to Comment</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}