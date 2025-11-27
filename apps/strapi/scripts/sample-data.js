/**
 * Sample data for Featured Products
 * This data mimics Apple's homepage product layout
 */

module.exports = {
  featuredProducts: [
    // Primary Hero - iPhone 16 Pro
    {
      title: "iPhone 16 Pro",
      subtitle: "钛金属。强得很。Pro 得很。",
      description: "全新 A18 Pro 芯片 | 焕然一新的摄像头控制 | 4K 120fps 杜比视界",
      productName: "iPhone 16 Pro",
      theme: "dark",
      backgroundColor: "#000000",
      textColor: "#ffffff",
      displaySize: "hero",
      priority: 100,
      isActive: true,
      slug: "iphone-16-pro",
      ctaButtons: [
        {
          label: "进一步了解",
          url: "/iphone-16-pro",
          style: "primary",
          openInNewTab: false
        },
        {
          label: "购买",
          url: "/buy/iphone-16-pro",
          style: "secondary",
          openInNewTab: false
        }
      ],
      highlights: [
        {
          title: "A18 Pro 芯片",
          description: "更快的处理器，更流畅的性能"
        },
        {
          title: "钛金属设计",
          description: "坚固耐用，轻盈舒适"
        },
        {
          title: "Pro 级摄像头系统",
          description: "4K 120fps 杜比视界视频拍摄"
        }
      ],
      seo: {
        meta_title: "iPhone 16 Pro - Apple (中国大陆)",
        meta_description: "全新 iPhone 16 Pro，配备 A18 Pro 芯片、钛金属设计和 Pro 级摄像头系统。",
        canonical_url: "https://www.apple.com/cn/iphone-16-pro/"
      }
    },

    // Secondary Hero - Apple Watch Series 10
    {
      title: "Apple Watch Series 10",
      subtitle: "精彩时刻，一目了然",
      description: "更大的显示屏 | 更纤薄的设计 | 全天候健康监测",
      productName: "Apple Watch Series 10",
      theme: "light",
      backgroundColor: "#f5f5f7",
      textColor: "#1d1d1f",
      displaySize: "secondary",
      priority: 90,
      isActive: true,
      slug: "apple-watch-series-10",
      ctaButtons: [
        {
          label: "进一步了解",
          url: "/apple-watch-series-10",
          style: "primary",
          openInNewTab: false
        },
        {
          label: "购买",
          url: "/buy/apple-watch-series-10",
          style: "secondary",
          openInNewTab: false
        }
      ],
      highlights: [
        {
          title: "更大显示屏",
          description: "视野更开阔，信息一目了然"
        },
        {
          title: "健康监测",
          description: "心率、血氧、睡眠全方位监测"
        }
      ],
      seo: {
        meta_title: "Apple Watch Series 10 - Apple (中国大陆)",
        meta_description: "全新 Apple Watch Series 10，更大的显示屏，更纤薄的设计。",
        canonical_url: "https://www.apple.com/cn/apple-watch-series-10/"
      }
    },

    // Product Grid Items
    {
      title: "AirPods 4",
      subtitle: "全新设计。降噪黑科技。",
      description: "主动降噪 | 个性化空间音频 | USB-C 充电",
      productName: "AirPods 4",
      theme: "light",
      backgroundColor: "#fbfbfd",
      textColor: "#1d1d1f",
      displaySize: "tile",
      priority: 80,
      isActive: true,
      slug: "airpods-4",
      ctaButtons: [
        {
          label: "进一步了解",
          url: "/airpods-4",
          style: "text",
          openInNewTab: false
        },
        {
          label: "购买",
          url: "/buy/airpods-4",
          style: "text",
          openInNewTab: false
        }
      ],
      seo: {
        meta_title: "AirPods 4 - Apple (中国大陆)",
        meta_description: "全新设计的 AirPods 4，主动降噪和个性化空间音频。",
        canonical_url: "https://www.apple.com/cn/airpods-4/"
      }
    },

    {
      title: "MacBook Air",
      subtitle: "强大实力，轻装上阵",
      description: "M3 芯片 | 最长 18 小时电池续航 | 液态视网膜显示屏",
      productName: "MacBook Air",
      theme: "dark",
      backgroundColor: "#000000",
      textColor: "#f5f5f7",
      displaySize: "tile",
      priority: 75,
      isActive: true,
      slug: "macbook-air",
      ctaButtons: [
        {
          label: "进一步了解",
          url: "/macbook-air",
          style: "text",
          openInNewTab: false
        },
        {
          label: "购买",
          url: "/buy/macbook-air",
          style: "text",
          openInNewTab: false
        }
      ],
      seo: {
        meta_title: "MacBook Air - Apple (中国大陆)",
        meta_description: "搭载 M3 芯片的 MacBook Air，强大实力，轻装上阵。",
        canonical_url: "https://www.apple.com/cn/macbook-air/"
      }
    },

    {
      title: "iPad Pro",
      subtitle: "史上最强大的 iPad",
      description: "M4 芯片 | Ultra Retina XDR 显示屏 | Apple Pencil Pro",
      productName: "iPad Pro",
      theme: "light",
      backgroundColor: "#f5f5f7",
      textColor: "#1d1d1f",
      displaySize: "tile",
      priority: 70,
      isActive: true,
      slug: "ipad-pro",
      ctaButtons: [
        {
          label: "进一步了解",
          url: "/ipad-pro",
          style: "text",
          openInNewTab: false
        },
        {
          label: "购买",
          url: "/buy/ipad-pro",
          style: "text",
          openInNewTab: false
        }
      ],
      seo: {
        meta_title: "iPad Pro - Apple (中国大陆)",
        meta_description: "搭载 M4 芯片的 iPad Pro，史上最强大的 iPad。",
        canonical_url: "https://www.apple.com/cn/ipad-pro/"
      }
    },

    {
      title: "Apple TV+",
      subtitle: "精彩好剧，应有尽有",
      description: "Apple Original 原创剧集和电影 | 无广告 | 随时随地观看",
      productName: "Apple TV+",
      theme: "dark",
      backgroundColor: "#000000",
      textColor: "#ffffff",
      displaySize: "tile",
      priority: 65,
      isActive: true,
      slug: "apple-tv-plus",
      ctaButtons: [
        {
          label: "免费试用",
          url: "/apple-tv-plus/trial",
          style: "text",
          openInNewTab: false
        },
        {
          label: "进一步了解",
          url: "/apple-tv-plus",
          style: "text",
          openInNewTab: false
        }
      ],
      seo: {
        meta_title: "Apple TV+ - Apple (中国大陆)",
        meta_description: "观看 Apple Original 原创剧集和电影，无广告，随时随地。",
        canonical_url: "https://www.apple.com/cn/apple-tv-plus/"
      }
    }
  ],

  homepageLayout: {
    gridColumns: "cols_2",
    gridLayout: "grid",
    isActive: true,
    // Note: Relations are defined by product slugs, will be resolved during import
    primaryHeroSlug: "iphone-16-pro",
    secondaryHeroSlug: "apple-watch-series-10",
    productGridSlugs: [
      "airpods-4",
      "macbook-air",
      "ipad-pro",
      "apple-tv-plus"
    ]
  }
};
