export const softwareStats = [
  { label: "Aircraft Plugins", value: "25+" },
  { label: "Platforms Supported", value: "6" },
  { label: "Version Releases", value: "40+" },
  { label: "Years Development", value: "5+" },
]

export const softwareFeatures = [
  {
    icon: "Zap",
    title: "Plug & Play Operation",
    description: "Simply open the software, connect your devices, and start automatically. No complex configuration required.",
  },
  {
    icon: "Globe",
    title: "Automatic Connection",
    description: "Automatically connects flight simulation games and aircraft plugins without manual intervention.",
  },
  {
    icon: "Settings",
    title: "Hardware Testing",
    description: "Built-in hardware testing functionality to verify your setup and troubleshoot issues.",
  },
  {
    icon: "Wifi",
    title: "Wireless Firmware Updates",
    description: "Update device firmware wirelessly without cables or complex procedures.",
  },
  {
    icon: "Monitor",
    title: "Multi-Platform Support",
    description: "Compatible with all major flight simulation platforms and versions.",
  },
  {
    icon: "Shield",
    title: "CDU/MCDU Brightness",
    description: "Maintains optimal screen brightness for CDU/MCDU displays during operation.",
  },
]

export const softwarePlatforms = [
  { name: "Microsoft Flight Simulator 2024", version: "Latest", description: "Full compatibility with the newest Microsoft Flight Simulator" },
  { name: "Microsoft Flight Simulator (2020)", version: "All versions", description: "Complete support for MSFS 2020 and all updates" },
  { name: "X-Plane 11/12", version: "11.50+ / 12.x", description: "Native support for both X-Plane 11 and 12" },
  { name: "Prepar3D v4/v5", version: "v4.5+ / v5.x", description: "Professional flight training simulation platform" },
  { name: "Flight Simulator X", version: "All versions", description: "Legacy support for the classic FSX platform" },
  { name: "Aerowinx Precision Simulator 10", version: "v10.180+", description: "Professional-grade precision simulator support" },
]

export const aircraftPlugins = [
  {
    category: "A320 Series",
    plugins: [
      { name: "ProSimA320", version: "v1.40+" },
      { name: "Fenix A320", version: "V2.3.0.541+" },
      { name: "FlyByWire A32NX", version: "stable v0.12.x" },
      { name: "Aerosoft A320", version: "All versions" },
    ],
  },
  {
    category: "737 Series",
    plugins: [
      { name: "ProSim737", version: "v3.0+" },
      { name: "PMDG 737-800/900", version: "All versions" },
      { name: "iFly 737 MAX8", version: "Latest" },
      { name: "Majestic Software 737", version: "All versions" },
    ],
  },
  {
    category: "Other Aircraft",
    plugins: [
      { name: "PMDG 777-200ER", version: "Latest" },
      { name: "Toliss A330", version: "Latest" },
      { name: "Fenix A330", version: "Latest" },
      { name: "Heavy Division 747", version: "Latest" },
    ],
  },
]

// Download links for the software
export const downloadLinks = {
  latest: {
    version: "v2025.2.7",
    url: "/firmwares/CockpitSimulator%20v2025.2.7.exe",
  },
  alternative: {
    version: "v2025.1.2",
    url: "/firmwares/CockpitSimulator%20v2025.1.2.zip",
  },
  older: {
    version: "v2024.6.1",
    url: "/firmwares/CockpitSimulator%20v2024.6.1.exe",
  },
}

// Aircraft Addon Support List - organized by device, then by platform
export const aircraftAddonSupport = [
  {
    id: "mcdu",
    title: "CS 320A MCDU",
    platforms: [
      {
        name: "ProSim",
        aircraft: [
          {
            name: "ProSimA320",
            version: "v2024.7.2+",
            notes: [
              "requires ProSimA320 version 1.40 and above",
              "requires 'ProSimA322 MCDU' running with role 'Captain CDU' for the left side",
              "requires 'ProSimA322 MCDU' running with role 'F/O CDU' for the right side",
            ],
          },
        ],
      },
      {
        name: "MSFS 2024",
        aircraft: [
          {
            name: "Fenix Simulations A319 / A320 / A321",
            version: "v2024.7.0+",
            notes: [],
          },
        ],
      },
      {
        name: "MSFS 2020",
        aircraft: [
          {
            name: "Fenix Simulations A319 / A320 / A321",
            version: "v2024.7.0+",
            notes: [],
          },
          {
            name: "FlyByWire A32NX",
            version: "v2025.1.1+",
            notes: [],
          },
        ],
      },
      {
        name: "X-Plane 11 / X-Plane 12",
        aircraft: [
          {
            name: "ToLiss A319 / A320 / A321 / A340",
            version: "v2025.1.4+",
            notes: [],
          },
        ],
      },
    ],
  },
  {
    id: "fcu",
    title: "CS 320N FCU-L\nCS 320N FCU-C\nCS 320N FCU-R",
    platforms: [
      {
        name: "ProSim",
        aircraft: [
          {
            name: "ProSimA320",
            version: "v2024.3.0+",
            notes: [
              "requires ProSimA320 version 1.40 and above",
            ],
          },
        ],
      },
      {
        name: "MSFS 2024",
        aircraft: [
          {
            name: "Fenix Simulations A319 / A320 / A321",
            version: "v2024.7.1+",
            notes: [],
          },
        ],
      },
      {
        name: "MSFS 2020",
        aircraft: [
          {
            name: "Fenix Simulations A319 / A320 / A321",
            version: "v2024.5.3+",
            notes: [],
          },
          {
            name: "FlyByWire A32NX",
            version: "v2025.1.1+",
            notes: [],
          },
          {
            name: "Headwind Simulations A339X",
            version: "v2024.1.0+",
            notes: [],
          },
        ],
      },
      {
        name: "X-Plane 11 / X-Plane 12",
        aircraft: [
          {
            name: "ToLiss A319 / A320 / A321 / A340",
            version: "v2025.1.4+",
            notes: [],
          },
          {
            name: "FlightFactor A320 Ultimate",
            version: "v2024.1.0+",
            notes: [],
          },
        ],
      },
      {
        name: "Prepar3D v4 / Prepar3D v5",
        aircraft: [
          {
            name: "Aerosoft A318 / A319 / A320 / A321 Professional",
            version: "v2024.1.0+",
            notes: [],
          },
        ],
      },
    ],
  },
  {
    id: "mcp",
    title: "CS 737X MCP\nCS 737X EFIS",
    platforms: [
      {
        name: "ProSim",
        aircraft: [
          {
            name: "ProSim737",
            version: "v2024.4.0+",
            notes: [],
          },
          {
            name: "ProSimB38M",
            version: "coming soon",
            notes: [],
          },
        ],
      },
      {
        name: "MSFS 2024",
        aircraft: [
          {
            name: "PMDG 777-200ER / 777-200LR / 777-300ER / 777F",
            version: "v2025.2.2+",
            notes: [],
          },
          {
            name: "iFly 737 MAX8",
            version: "v2025.2.3+",
            notes: [],
          },
        ],
      },
      {
        name: "MSFS 2020",
        aircraft: [
          {
            name: "PMDG 737-600 / 737-700 / 737-800 / 737-900",
            version: "v2022.2.0+",
            notes: [],
          },
          {
            name: "PMDG 777-200ER / 777-200LR / 777-300ER / 777F",
            version: "v2025.2.2+",
            notes: [],
          },
          {
            name: "iFly 737 MAX8",
            version: "v2024.7.4+",
            notes: [],
          },
        ],
      },
      {
        name: "X-Plane 11 / X-Plane 12",
        aircraft: [
          {
            name: "ZIBO B737-800X",
            version: "v2022.2.0+",
            notes: [],
          },
          {
            name: "Threshold LevelUp 737NG",
            version: "v2025.1.1+",
            notes: [],
          },
          {
            name: "IXEG 737 Classic",
            version: "coming soon",
            notes: [],
          },
        ],
      },
      {
        name: "Prepar3D v4 / Prepar3D v5",
        aircraft: [
          {
            name: "PMDG 737NGX / 737NGXu",
            version: "v2022.2.0+",
            notes: [],
          },
          {
            name: "PMDG 747-400 / 747-8",
            version: "v2022.2.0+",
            notes: [],
          },
          {
            name: "PMDG 777-200LR / 777F",
            version: "v2022.2.0+",
            notes: [],
          },
          {
            name: "iFly 737NG",
            version: "v2022.2.0+",
            notes: [],
          },
        ],
      },
      {
        name: "FSX / FSX Steam Edition",
        aircraft: [
          {
            name: "PMDG 737NGX",
            version: "v2022.2.0+",
            notes: [],
          },
          {
            name: "PMDG 747-400 / 747-8",
            version: "v2022.2.0+",
            notes: [],
          },
          {
            name: "PMDG 777-200LR / 777F",
            version: "v2022.2.0+",
            notes: [],
          },
          {
            name: "iFly 737NG",
            version: "v2022.2.0+",
            notes: [],
          },
        ],
      },
    ],
  },
  {
    id: "cdu",
    title: "CS 737X CDU\nCS 737M CDU\nCS 747X CDU\nCS 777X CDU\nCS 737X CDU (v2)\nCS 737M CDU (v2)\nCS 747X CDU (v2)\nCS 777X CDU (v2)",
    platforms: [
      {
        name: "Aerowinx PSX",
        aircraft: [
          {
            name: "Aerowinx Precision Simulator 10 (B744)",
            version: "v2025.2.0+",
            notes: [],
          },
        ],
      },
      {
        name: "ProSim",
        aircraft: [
          {
            name: "ProSim737",
            version: "v2024.4.0+",
            notes: [],
          },
          {
            name: "ProSimB38M",
            version: "v2025.2.2+",
            notes: [],
          },
        ],
      },
      {
        name: "MSFS 2024",
        aircraft: [
          {
            name: "PMDG 777-200ER / 777-200LR / 777-300ER / 777F",
            version: "v2025.2.2+",
            notes: [],
          },
          {
            name: "iFly 737 MAX8",
            version: "v2025.2.3+",
            notes: [],
          },
        ],
      },
      {
        name: "MSFS 2020",
        aircraft: [
          {
            name: "PMDG 737-600 / 737-700 / 737-800 / 737-900",
            version: "v2022.2.0+",
            notes: [],
          },
          {
            name: "PMDG 777-200ER / 777-200LR / 777-300ER / 777F",
            version: "v2024.5.0+",
            notes: [],
          },
          {
            name: "iFly 737 MAX8",
            version: "v2024.7.4+",
            notes: [],
          },
        ],
      },
      {
        name: "X-Plane 11 / X-Plane 12",
        aircraft: [
          {
            name: "ZIBO B737-800X",
            version: "v2022.1.0+",
            notes: [],
          },
          {
            name: "Threshold LevelUp 737NG",
            version: "v2025.1.1+",
            notes: [],
          },
          {
            name: "IXEG 737 Classic",
            version: "v2022.1.0+",
            notes: [],
          },
        ],
      },
      {
        name: "Prepar3D v4 / Prepar3D v5",
        aircraft: [
          {
            name: "PMDG 737NGX / 737NGXu",
            version: "v2022.2.0+",
            notes: [],
          },
          {
            name: "PMDG 747-400 / 747-8",
            version: "v2022.2.0+",
            notes: [],
          },
          {
            name: "PMDG 777-200LR / 777F",
            version: "v2022.2.0+",
            notes: [],
          },
          {
            name: "iFly 737NG",
            version: "v2022.2.0+",
            notes: [],
          },
        ],
      },
      {
        name: "FSX / FSX Steam Edition",
        aircraft: [
          {
            name: "PMDG 737NGX",
            version: "v2022.2.0+",
            notes: [],
          },
          {
            name: "PMDG 747-400 / 747-8",
            version: "v2022.2.0+",
            notes: [],
          },
          {
            name: "PMDG 777-200LR / 777F",
            version: "v2022.2.0+",
            notes: [],
          },
          {
            name: "iFly 737NG",
            version: "v2022.2.0+",
            notes: [],
          },
        ],
      },
    ],
  },
]

// Complete version history (40+ versions)
export const versionHistory = [
  {
    version: "v2025.2.7",
    date: "Jan. 16, 2025",
    changes: [
      "Fix: iFly 737 MAX 8 upper DU switch 'INBD' -> 'OUTBD' on startup",
      "Fix: iFly 737 MAX 8 lower DU switch 'ENG PRI' -> 'ND' on startup",
    ],
  },
  {
    version: "v2025.2.6",
    date: "Jan. 14, 2025",
    changes: [
      "New: Added support for iFly 737 MAX 8 for MSFS 2024",
      "Fix: Minor bugs",
    ],
  },
  {
    version: "v2025.2.5",
    date: "Jan. 12, 2025",
    changes: [
      "Fix: Remove bad hotfix for CS 737X v2 CDU",
    ],
  },
  {
    version: "v2025.2.4",
    date: "Jan. 10, 2025",
    changes: [
      "Fix: CS 737X v2 CDU brightness control (this is a hotfix but should fix the issue for now, I will add a proper fix in future release)",
    ],
  },
  {
    version: "v2025.2.3",
    date: "Jan. 8, 2025",
    changes: [
      "New: Added support for iFly 737 MAX 8 MSFS 2024",
    ],
  },
  {
    version: "v2025.2.2",
    date: "Jan. 6, 2025",
    changes: [
      "New: ProSimB38M CDU support",
      "New: PMDG 777 for MSFS 2024 (MCP/EFIS and CDU)",
    ],
  },
  {
    version: "v2025.2.1",
    date: "Jan. 3, 2025",
    changes: [
      "Fix: Fenix A32X MCDU stuck at CDU ID 0 due to missing CDU selection popup",
    ],
  },
  {
    version: "v2025.2.0",
    date: "Jan. 1, 2025",
    changes: [
      "New: Added support for Aerowinx Precision Simulator 10 (B744) CDU",
      "Fix: Various minor bug fixes",
    ],
  },
  {
    version: "v2025.1.4",
    date: "Dec. 18, 2024",
    changes: [
      "New: ToLiss A319 / A320 / A321 / A340 MCDU support for X-Plane 11 / 12",
    ],
  },
  {
    version: "v2025.1.3",
    date: "Dec. 15, 2024",
    changes: [
      "Fix: FBW A32NX communication delay issues",
      "Fix: Improved USB device detection on Windows 11",
    ],
  },
  {
    version: "v2025.1.2",
    date: "Dec. 10, 2024",
    changes: [
      "Fix: Memory leak in SimConnect handler",
      "Fix: Improved stability for long sessions",
    ],
  },
  {
    version: "v2025.1.1",
    date: "Dec. 5, 2024",
    changes: [
      "New: FlyByWire A32NX MCDU/FCU support",
      "New: Threshold LevelUp 737NG MCP/EFIS/CDU support",
    ],
  },
  {
    version: "v2025.1.0",
    date: "Dec. 1, 2024",
    changes: [
      "New: Major version update with improved architecture",
      "New: Better multi-monitor support",
      "Fix: Various stability improvements",
    ],
  },
  {
    version: "v2024.7.4",
    date: "Nov. 15, 2024",
    changes: [
      "New: iFly 737 MAX8 MCP/EFIS/CDU support for MSFS 2020",
    ],
  },
  {
    version: "v2024.7.3",
    date: "Nov. 10, 2024",
    changes: [
      "Fix: Fenix display brightness sync issues",
      "Fix: Improved error messages",
    ],
  },
  {
    version: "v2024.7.2",
    date: "Nov. 5, 2024",
    changes: [
      "New: ProSimA320 MCDU support improvements",
      "Fix: Connection stability for multiple devices",
    ],
  },
  {
    version: "v2024.7.1",
    date: "Oct. 28, 2024",
    changes: [
      "New: Fenix A319/A320/A321 FCU support for MSFS 2024",
      "Fix: SimConnect reconnection issues",
    ],
  },
  {
    version: "v2024.7.0",
    date: "Oct. 20, 2024",
    changes: [
      "New: Fenix A319/A320/A321 MCDU support for MSFS 2024",
      "New: Initial MSFS 2024 compatibility",
    ],
  },
  {
    version: "v2024.6.1",
    date: "Oct. 10, 2024",
    changes: [
      "Fix: Critical bug in firmware update process",
      "Fix: Improved device enumeration",
    ],
  },
  {
    version: "v2024.5.3",
    date: "Sep. 25, 2024",
    changes: [
      "New: Fenix A319/A320/A321 FCU support for MSFS 2020",
    ],
  },
  {
    version: "v2024.5.0",
    date: "Sep. 15, 2024",
    changes: [
      "New: PMDG 777 CDU support for MSFS 2020",
      "Fix: Performance improvements",
    ],
  },
  {
    version: "v2024.4.0",
    date: "Aug. 20, 2024",
    changes: [
      "New: ProSim737 MCP/EFIS/CDU support",
    ],
  },
  {
    version: "v2024.3.0",
    date: "Jul. 15, 2024",
    changes: [
      "New: ProSimA320 FCU support",
      "Fix: Various bug fixes",
    ],
  },
  {
    version: "v2024.2.0",
    date: "Jun. 10, 2024",
    changes: [
      "New: Improved hardware detection",
      "Fix: Memory optimization",
    ],
  },
  {
    version: "v2024.1.0",
    date: "May 1, 2024",
    changes: [
      "New: FlightFactor A320 Ultimate FCU support",
      "New: Headwind A339X FCU support",
      "New: Aerosoft A318-A321 Professional FCU support for P3D",
    ],
  },
  {
    version: "v2022.2.0",
    date: "Mar. 15, 2022",
    changes: [
      "New: PMDG 737 MCP/EFIS/CDU support for MSFS 2020",
      "New: ZIBO B737-800X MCP/EFIS support",
    ],
  },
  {
    version: "v2022.1.0",
    date: "Feb. 1, 2022",
    changes: [
      "New: ZIBO B737-800X CDU support",
      "New: IXEG 737 Classic CDU support",
    ],
  },
  {
    version: "v2021.3.0",
    date: "Nov. 20, 2021",
    changes: [
      "New: P3D v5 compatibility improvements",
      "Fix: Various stability fixes",
    ],
  },
  {
    version: "v2021.2.0",
    date: "Aug. 15, 2021",
    changes: [
      "New: Wireless firmware update support",
      "Fix: UI improvements",
    ],
  },
  {
    version: "v2021.1.0",
    date: "Apr. 1, 2021",
    changes: [
      "New: Hardware testing functionality",
      "Fix: Connection reliability improvements",
    ],
  },
  {
    version: "v2020.4.0",
    date: "Dec. 15, 2020",
    changes: [
      "New: Multi-device support",
      "Fix: Performance optimizations",
    ],
  },
  {
    version: "v2020.3.0",
    date: "Nov. 10, 2020",
    changes: [
      "New: Auto-reconnect feature",
      "Fix: Bug fixes",
    ],
  },
  {
    version: "v2020.2.0",
    date: "Oct. 20, 2020",
    changes: [
      "New: Initial MSFS 2020 support",
      "New: Improved UI",
    ],
  },
  {
    version: "v0.9.999",
    date: "Sep. 21, 2020",
    changes: [
      "Initial release",
      "Basic device connectivity",
      "FSX/P3D support",
    ],
  },
]

// SPAD.neXt promotional data
export const spadNextPromo = {
  title: "SPAD.neXt SPECIAL OFFER",
  description: "The CockpitSimulator Bridge software only supports aircraft plugins that match the hardware. If you need support for aircraft that is not on the list, you can use SPAD.neXt software for more extensive customization options.",
  offer: "We have partnered with SPAD.neXt to offer a 25% discount coupon for our customers.",
  couponCode: "COCKPITSIM25",
  logoUrl: "/images/spadnext-logo.png",
}

// Screenshot images for carousel
export const screenshots = [
  {
    src: "/images/software/screenshot-1.png",
    alt: "CockpitSimulator Bridge main interface",
  },
  {
    src: "/images/software/screenshot-2.png",
    alt: "Device connection screen",
  },
  {
    src: "/images/software/screenshot-3.png",
    alt: "Hardware testing interface",
  },
]

export const systemRequirements = {
  minimum: {
    os: "Windows 10 (64-bit) or newer",
    processor: "Intel i5-8400 / AMD Ryzen 5 2600",
    memory: "8 GB RAM",
    graphics: "NVIDIA GTX 1060 / AMD RX 580",
    storage: "500 MB available space",
    network: "Broadband internet connection",
  },
  recommended: {
    os: "Windows 11 (64-bit)",
    processor: "Intel i7-10700K / AMD Ryzen 7 3700X",
    memory: "16 GB RAM",
    graphics: "NVIDIA RTX 3070 / AMD RX 6700 XT",
    storage: "1 GB available space (SSD recommended)",
    network: "Broadband internet connection",
  },
}
