export interface SoftwareFeature {
  icon: string
  title: string
  description: string
}

export interface Platform {
  name: string
  status: "supported" | "planned" | "deprecated"
  version: string
  description: string
}

export interface CompatibilityItem {
  name: string
  version: string
  status: "supported" | "planned" | "deprecated"
}

export interface CompatibilityCategory {
  category: string
  items: CompatibilityItem[]
}

export interface VersionRelease {
  version: string
  date: string
  changes: string[]
}

export interface SystemRequirements {
  os: string
  node: string
  memory: string
  storage: string
  database: string
  cache: string
}

export interface SoftwareData {
  title: string
  version: string
  releaseDate: string
  description: string
  features: SoftwareFeature[]
  platforms: Platform[]
  compatibility: CompatibilityCategory[]
  versions: VersionRelease[]
  systemRequirements: {
    minimum: SystemRequirements
    recommended: SystemRequirements
  }
}
