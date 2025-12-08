import type { Metadata } from "next"
import Link from "next/link"
import { Play, Music2, Headphones, Plane } from "lucide-react"

export const metadata: Metadata = {
  title: "Bring the Sky Home · Cockpit Simulator",
  description: "原创品牌主题曲 - 专为飞行模拟创作，家用驾驶舱沉浸配乐",
}

// YouTube video ID extracted from the URL
const YOUTUBE_VIDEO_ID = "X-yIEMduRXk"

export default function MVPage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://img.aidenlux.com/medusa-uploads/hero.jpg')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-transparent to-neutral-950" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Music2 className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">Official Brand MV</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight">
              Bring the Sky Home
            </h1>
            <p className="text-xl md:text-2xl text-blue-400 font-medium mb-4">
              飞行之梦，一听即燃
            </p>
            <p className="text-gray-400 max-w-2xl mx-auto">
              原创品牌主题曲 | 专为飞行模拟创作 | 家用驾驶舱沉浸配乐
            </p>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="relative py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Video Container with Glow Effect */}
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500" />

              {/* Video Wrapper */}
              <div className="relative bg-neutral-900 rounded-2xl overflow-hidden border border-white/10">
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1`}
                    title="Bring the Sky Home - Cockpit Simulator Official MV"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-colors">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Music2 className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">原创主题曲</h3>
                <p className="text-sm text-gray-400">
                  专为 Cockpit Simulator 品牌创作的原创音乐作品
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-colors">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plane className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">飞行灵感</h3>
                <p className="text-sm text-gray-400">
                  将翱翔天际的梦想融入每一个音符
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-colors">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Headphones className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">沉浸体验</h3>
                <p className="text-sm text-gray-400">
                  家用驾驶舱沉浸配乐，提升飞行模拟体验
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center mt-16">
              <p className="text-gray-400 mb-6">探索我们的专业飞行模拟硬件</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/us/products"
                  className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-200 transition-colors"
                >
                  浏览产品
                </Link>
                <Link
                  href="/us/collections"
                  className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-full font-medium hover:bg-white/20 transition-colors border border-white/20"
                >
                  查看系列
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
