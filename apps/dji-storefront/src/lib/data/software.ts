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

export const versionHistory = [
  {
    version: "v2025.2.3",
    date: "June 12, 2025",
    changes: [
      "Added iFly 737 MAX8 support for MSFS 2024",
      "Improved connection stability for X-Plane 12",
      "Enhanced hardware detection algorithms",
      "Fixed CDU brightness persistence issues",
    ],
  },
  {
    version: "v2025.2.2",
    date: "May 28, 2025",
    changes: [
      "Added PMDG 777-200ER support for MSFS",
      "Optimized memory usage for large plugin sets",
      "Improved wireless firmware update reliability",
      "Enhanced error reporting and diagnostics",
    ],
  },
  {
    version: "v2025.2.0",
    date: "April 15, 2025",
    changes: [
      "Added Aerowinx Precision Simulator 10 support",
      "Redesigned user interface with dark mode",
      "Implemented automatic plugin detection",
      "Enhanced multi-platform compatibility",
    ],
  },
]

export const aircraftAddonSupport = [
  {
    id: "mcdu",
    title: "CS 320A MCDU",
    description: "MCDU device support for Airbus aircraft",
    aircraft: [
      { name: "ProSimA320", platform: "ProSim", version: "v2024.7.2+", notes: "Requires version 1.40+" },
      { name: "Fenix A319/A320/A321", platform: "MSFS 2024", version: "v2024.7.1+" },
      { name: "FlyByWire A32NX", platform: "MSFS 2020", version: "v2025.1.1+" },
      { name: "ToLiss A319/A320/A321/A340", platform: "X-Plane 11/12", version: "v2025.1.4+" },
      { name: "Aerosoft A318-A321", platform: "Prepar3D v4/v5", version: "All versions" },
    ],
  },
  {
    id: "fcu",
    title: "CS 320N FCU Series",
    description: "FCU device support for Airbus aircraft",
    aircraft: [
      { name: "ProSimA320", platform: "ProSim", version: "v2024.7.2+", notes: "Requires version 1.40+" },
      { name: "Fenix A319/A320/A321", platform: "MSFS 2024", version: "v2024.7.1+" },
      { name: "FlyByWire A32NX", platform: "MSFS 2020", version: "v2025.1.1+" },
      { name: "ToLiss A319/A320/A321/A340", platform: "X-Plane 11/12", version: "v2025.1.4+" },
      { name: "Aerosoft A318-A321", platform: "Prepar3D v4/v5", version: "All versions" },
    ],
  },
  {
    id: "boeing",
    title: "Boeing Devices",
    subtitle: "CS 737X / CS 747X / CS 777X",
    description: "Boeing device support",
    aircraft: [
      { name: "ProSim737", platform: "ProSim", version: "v3.0+" },
      { name: "ProSimB38M", platform: "ProSim", version: "Latest" },
      { name: "PMDG 737-700/800/900", platform: "MSFS 2024/2020", version: "All versions" },
      { name: "PMDG 777-200ER/300ER", platform: "MSFS 2024/2020", version: "All versions" },
      { name: "PMDG 747-8", platform: "MSFS 2024/2020", version: "All versions" },
      { name: "iFly 737 MAX8", platform: "MSFS 2024", version: "Latest" },
      { name: "Aerowinx B744 PSX", platform: "Precision Simulator 10", version: "v10.180+" },
      { name: "Threshold LevelUp 737NG", platform: "MSFS 2024/2020", version: "Latest" },
      { name: "ZIBO B737-800X", platform: "X-Plane 11/12", version: "Latest" },
    ],
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
