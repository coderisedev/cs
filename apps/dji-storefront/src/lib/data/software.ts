export const softwareStats = [
  { label: "Aircraft Plugins", value: "25+" },
  { label: "Platforms Supported", value: "6" },
  { label: "Version Releases", value: "55+" },
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
    version: "v2026.1.0",
    url: "https://img.aidenlux.com/software/CockpitSimulator%20v2026.1.0.exe",
  },
  alternative: {
    version: "v2025.1.2",
    url: "https://img.aidenlux.com/software/CockpitSimulator%20v2025.1.2.zip",
  },
  older: {
    version: "v2024.6.1",
    url: "https://img.aidenlux.com/software/CockpitSimulator%20v2024.6.1.exe",
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

// Complete version history (55+ versions)
export const versionHistory = [
  {
    version: "v2025.2.3",
    date: "Jun. 12, 2025",
    changes: [
      "Added 'iFly 737 MAX8 for MSFS 2024' support for CS 737/747/777 series devices",
    ],
  },
  {
    version: "v2025.2.2",
    date: "May. 3, 2025",
    changes: [
      "Added 'PMDG 777-200ER for MSFS 2020 & 2024' support for CS 737/747/777 series devices",
      "Enhanced user experience for PMDG 777 series aircraft when using CS 737X EFIS",
      "Added ProSimB38M CDU support for CS 737/747/777 series CDUs",
    ],
  },
  {
    version: "v2025.2.1",
    date: "Feb. 5, 2025",
    changes: [
      "Fixed incorrect position handling in CDU v1",
    ],
  },
  {
    version: "v2025.2.0",
    date: "Feb. 3, 2025",
    changes: [
      "Added 'Aerowinx Precision Simulator 10 (Aerowinx B744)' support for CS 737/747/777 series CDUs",
      "Added 747 and 777 aircraft center CDU support for CS 737/747/777 v2 series CDUs",
      "Improved position selection experience for CS 737/747/777 v2 series CDUs",
      "Fixed inversed text style for CS 737/747/777 v2 series CDUs",
      "Fixed incorrect CDU CLR key response in iFly MAX8 MSFS",
      "Fixed incorrect status display in UI when platform is ProSim",
      "Improved FBW DataStorage handling",
      "Improved stability",
    ],
  },
  {
    version: "v2025.1.5",
    date: "Jan. 29, 2025",
    changes: [
      "Fixed incorrect content in MSFS module 'layout.json'",
      "Fixed incorrect button mapping in CS 737/747/777 v2 series CDU",
    ],
  },
  {
    version: "v2025.1.4",
    date: "Jan. 22, 2025",
    changes: [
      "Added 'ToLiss A330-900' support for CS 320 series devices",
    ],
  },
  {
    version: "v2025.1.3",
    date: "Jan. 21, 2025",
    changes: [
      "Detect if iFly MAX8 Plugin is running elevated",
      "Optimize startup process",
      "Serial port occupation detection and handling",
    ],
  },
  {
    version: "v2025.1.2",
    date: "Jan. 15, 2025",
    changes: [
      "Preserves manually adjusted CDU / MCDU screen brightness even when CS Bridge is restarted",
    ],
  },
  {
    version: "v2025.1.1",
    date: "Jan. 13, 2025",
    changes: [
      "Fixed FlyBywire A32NX compatibility issues",
      "Fixed autostart / autostop issues",
    ],
  },
  {
    version: "v2025.1.0",
    date: "Jan. 12, 2025",
    changes: [
      "Added FlyByWire A32NX stable version support for CS 320A MCDU",
      "Added LevelUp 737NG Series U1 support for CS 737/747/777 series devices",
      "Supports annunciator dimming for v2 series CDU / MCDU",
    ],
  },
  {
    version: "v2024.7.5",
    date: "Dec. 29, 2024",
    changes: [
      "Added ToLiss A320 family support for CS 320A MCDU",
    ],
  },
  {
    version: "v2024.7.4",
    date: "Dec. 27, 2024",
    changes: [
      "Added 'iFly 737 MAX8 for MSFS' support for CS 737/747/777 series devices",
      "Updated bridge software autostart / autostop feature for MSFS / P3D / X-Plane platforms",
      "Adjust the code structure to reduce false positives from antivirus software (separation of SimConnect 32bit parts, code signing, etc.)",
    ],
  },
  {
    version: "v2024.7.3",
    date: "Dec. 17, 2024",
    changes: [
      "Fixed FCU SPEED MANAGED/DASH display issue in Fenix",
      "Improved Fenix WebSocket client stability",
      "Added 'PMDG 777F for Microsoft Flight Simulator' support for CS 737/747/777 series devices",
      "Improved MCP A/T switch experience on 777 aircraft (hint: try rotating CRS knobs)",
    ],
  },
  {
    version: "v2024.7.2",
    date: "Dec. 17, 2024",
    changes: [
      "Added ProSimA320 MCDU support for CS 320A MCDU",
    ],
  },
  {
    version: "v2024.7.1",
    date: "Dec. 16, 2024",
    changes: [
      "Fixed MCDU screen 'Δ' display on Fenix",
      "Fixed FCU rotary on Fenix for MSFS 2024",
      "Fixed several issues for iFly737NG / Aerosoft A320 / PMDG for P3D",
    ],
  },
  {
    version: "v2024.7.0",
    date: "Dec. 13, 2024",
    changes: [
      "Added support for the CS 320A MCDU and v2 version CS 737/747/777 CDUs",
    ],
  },
  {
    version: "v2024.6.1",
    date: "Sep. 2, 2024",
    changes: [
      "Adjusted 737NG series aircraft electrical condition checks",
    ],
  },
  {
    version: "v2024.6.0",
    date: "Sep. 2, 2024",
    changes: [
      "Added 'CM MCP Lite' device support",
    ],
  },
  {
    version: "v2024.5.3",
    date: "Aug. 21, 2024",
    changes: [
      "Added 'Fenix A319 & A321 Expansion' support for CS 320N series devices",
    ],
  },
  {
    version: "v2024.5.2",
    date: "Jul. 23, 2024",
    changes: [
      "Added 'iFly Jets Advanced Series – The 737NG' support for CS 737X / 747X / 777X series devices",
    ],
  },
  {
    version: "v2024.5.1",
    date: "Jul. 1, 2024",
    changes: [
      "Fixed CDU brightness control in PMDG 777 for MSFS",
    ],
  },
  {
    version: "v2024.5.0",
    date: "Jun. 27, 2024",
    changes: [
      "Added 'PMDG 777-300ER for Microsoft Flight Simulator' support for CS 737X / 747X / 777X series devices",
    ],
  },
  {
    version: "v2024.4.4",
    date: "May. 12, 2024",
    changes: [
      "Improved MSFS installation directory detection",
    ],
  },
  {
    version: "v2024.4.3",
    date: "May. 11, 2024",
    changes: [
      "Improved 'detected simulator' content in about window",
      "Displays CS addon status and version on the main page",
    ],
  },
  {
    version: "v2024.4.2",
    date: "May. 7, 2024",
    changes: [
      "Refactored bridge software launcher (installer)",
      "Displays CS addon status and version on the main page",
      "Added an option to automatically launch the bridge software when P3D/X-Plane starts",
    ],
  },
  {
    version: "v2024.4.1",
    date: "Apr. 30, 2024",
    changes: [
      "ProSim737 minimum supported version lowered to V3.0",
      "ProSimA320 minimum supported version lowered to V1.40",
    ],
  },
  {
    version: "v2024.4.0",
    date: "Apr. 28, 2024",
    changes: [
      "Added ProSim737 support for CS 737X / 747X / 777X series devices",
      "Improved CS 737X series ELECTRICAL POWER and LIGHTS systems simulation",
      "View firmware update details in the status tab",
    ],
  },
  {
    version: "v2024.3.1",
    date: "Apr. 18, 2024",
    changes: [
      "Added 'skip device' feature when using CS Bridge and other software simultaneously",
    ],
  },
  {
    version: "v2024.3.0",
    date: "Apr. 14, 2024",
    changes: [
      "Added ProSimA320 support for CS 320N series devices",
      "Improved MSFS module installer to handle multiple MSFS installations",
    ],
  },
  {
    version: "v2024.2.0",
    date: "Apr. 7, 2024",
    changes: [
      "Added Fenix A320 support for CS 320N series devices",
      "Status page now shows a hint if the device has up-to-date firmware",
    ],
  },
  {
    version: "v2024.1.0",
    date: "Feb. 22, 2024",
    changes: [
      "Initial support for CS 320N series devices",
      "Added a P3Dv4/v5 addon for L-Vars based interaction",
      "Added a MSFS module for L-Vars based interaction",
      "Improved robustness for Auto Configurator",
      "Shows which configuration file was modified after the Auto Configurator run",
      "Shows where the MSFS / P3D / X-Plane plugins were installed after the Auto Configurator run",
      "Added a new 'About' window for detected platform / aircraft list",
      "Updated color schemes for dark mode",
      "Added an 'Update Rate' option in the X-Plane plugin",
      "Improved X-Plane plugin stability",
    ],
  },
  {
    version: "v2023.1.8",
    date: "Jan. 11, 2024",
    changes: [
      "Improved B737-800X knob handling",
    ],
  },
  {
    version: "v2023.1.7",
    date: "Dec. 13, 2023",
    changes: [
      "Improved IXEG detection",
    ],
  },
  {
    version: "v2023.1.6",
    date: "Sep. 07, 2023",
    changes: [
      "Improved installer for read-only file situation",
      "Added a 'start minimized' config entry",
    ],
  },
  {
    version: "v2023.1.5",
    date: "Jun. 06, 2023",
    changes: [
      "Fixed X-Plane plugin crash problem when aircraft DataRef type has changed",
    ],
  },
  {
    version: "v2023.1.4",
    date: "Mar. 15, 2023",
    changes: [
      "Standalone (no installer) version",
      "Fixed Auto Configurator settings could not be saved problem",
      "Updated device names",
      "Improved CS 737X CDU test page",
    ],
  },
  {
    version: "v2023.1.3",
    date: "Jan. 18, 2023",
    changes: [
      "Fixed a problem that caused PMDG 737 NGX not recognized in P3D v4/v5",
    ],
  },
  {
    version: "v2023.1.2",
    date: "Jan. 17, 2023",
    changes: [
      "Improved stability and experience with MSFS / Prepar3D",
      "Fixed a problem that may prevent CS 737X CDU leaving test mode",
    ],
  },
  {
    version: "v2023.1.1",
    date: "Jan. 16, 2023",
    changes: [
      "Added iFly 737NG support for CS 737X CDU",
      "Added 'power off' feature for connected devices when bridge software closing",
      "Improved SimConnect client stability",
      "Updated CS 737X CDU test page on the device screen",
    ],
  },
  {
    version: "v2023.1.0",
    date: "Jan. 04, 2023",
    changes: [
      "Initial support for CS 737X MCP / EFIS",
      "Nearly complete rewrite of bridge software base architecture",
    ],
  },
  {
    version: "v2022.3.0",
    date: "Dec. 27, 2022",
    changes: [],
  },
  {
    version: "v2022.1.0",
    date: "Nov. 20, 2022",
    changes: [],
  },
  {
    version: "v0.10.6",
    date: "Aug. 25, 2022",
    changes: [],
  },
  {
    version: "v0.10.5",
    date: "Aug. 15, 2022",
    changes: [],
  },
  {
    version: "v0.10.3",
    date: "Jun. 21, 2022",
    changes: [],
  },
  {
    version: "v0.10.0",
    date: "May. 24, 2022",
    changes: [
      "Supports MSFS PMDG 737NG",
    ],
  },
  {
    version: "v0.9.98",
    date: "Mar. 8, 2021",
    changes: [
      "Added device support (CDU right side)",
      "Fixed configurator may failed without administrative privileges",
    ],
  },
  {
    version: "v0.9.97",
    date: "Dec. 22, 2020",
    changes: [
      "Supports PMDG 737NGXu BBJ",
      "Added update notification",
      "Remapped 747 & 777 function keys",
    ],
  },
  {
    version: "v0.9.96",
    date: "Oct. 29, 2020",
    changes: [],
  },
  {
    version: "v0.9.94",
    date: "Oct. 19, 2020",
    changes: [],
  },
  {
    version: "v0.9.93",
    date: "Oct. 10, 2020",
    changes: [],
  },
  {
    version: "v0.9.92",
    date: "Sep. 25, 2020",
    changes: [],
  },
  {
    version: "v0.9.91",
    date: "Sep. 25, 2020",
    changes: [],
  },
  {
    version: "v0.999.99",
    date: "Sep. 24, 2020",
    changes: [],
  },
  {
    version: "v0.99.9999",
    date: "Sep. 24, 2020",
    changes: [],
  },
  {
    version: "v0.9.999",
    date: "Sep. 21, 2020",
    changes: [
      "First version where Cockpit Simulator and CS 737X CDU starts here",
    ],
  },
]

// SPAD.neXt promotional data
export const spadNextPromo = {
  title: "SPAD.neXt SPECIAL OFFER",
  description: "The CockpitSimulator Bridge software only supports aircraft plugins that match the hardware. If you want to use our hardware with more aircraft plugins, you can try the SPAD.neXt software, which offers a very wide range of aircraft plugin support.",
  offer: "We have partnered with SPAD.neXt to offer a 25% discount coupon for those who have purchased hardware from our official shop. If you are interested in purchasing SPAD.neXt software and would like to receive a coupon, please contact",
  contactEmail: "info@cockpit-simulator.com",
  logoUrl: "https://img.aidenlux.com/software/spadnext.png",
}

// Screenshot images for carousel
export const screenshots = [
  {
    src: "https://img.aidenlux.com/software/CockpitSimulatorBridge-2024-1.jpg",
    alt: "CockpitSimulator Bridge interface 1",
  },
  {
    src: "https://img.aidenlux.com/software/CockpitSimulatorBridge-2024-2.jpg",
    alt: "CockpitSimulator Bridge interface 2",
  },
  {
    src: "https://img.aidenlux.com/software/CockpitSimulatorBridge-2024-3.jpg",
    alt: "CockpitSimulator Bridge interface 3",
  },
  {
    src: "https://img.aidenlux.com/software/CockpitSimulatorBridge-2024-4.jpg",
    alt: "CockpitSimulator Bridge interface 4",
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
