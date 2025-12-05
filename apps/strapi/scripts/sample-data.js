/**
 * Sample data for Featured Products
 * This data mimics Apple's homepage product layout
 */

module.exports = {
  featuredProducts: [
    // Primary Hero - iPhone 16 Pro
    {
      title: "CS737 全功能油门操作台",
      subtitle: "CS737 Throttle Pro",
      description: "全金属机身 | 4 无刷 + 5 步进电机随动联动 | 自动扰流板、电动配平与背光面板",
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
          title: "全电动随动油门",
          description: "更快的处理器，更流畅的性能"
        },
        {
          title: "737NG / MAX 双构型",
          description: "可选 737NG 与 737MAX 两种构型"
        },
        {
          title: "专业配平与减速板系统",
          description: "电动配平轮、自动扰流板与 9 档襟翼手柄联动工作"
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
      title: "Bring the Sky Home",
      subtitle: "飞行之梦，一听即燃",
      description: "原创品牌主题曲 | 专为飞行模拟创作 | 家用驾驶舱沉浸配乐",
      productName: "Cockpit Simulator",
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
      title: "A320 Series",
      subtitle: "空客原机手感，一触即真。",
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
      title: "737 Series",
      subtitle: "波音经典质感，一推到位。",
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
      title: "Accessories",
      subtitle: "真机级配件，十年放心飞。",
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
      title: "User Story+",
      subtitle: "真实飞行故事，让每套硬件都有灵魂。",
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
          label: "观看故事",
          url: "/apple-tv-plus/trial",
          style: "text",
          openInNewTab: false
        },
        {
          label: "我要分享",
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
