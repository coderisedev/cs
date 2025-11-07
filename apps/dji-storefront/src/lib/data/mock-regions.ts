import { HttpTypes } from "@medusajs/types"
import { US_REGION_ID } from "@/lib/constants"

// Plan A: Only US region for global USD site
const mockRegions: HttpTypes.StoreRegion[] = [
  {
    id: US_REGION_ID,
    name: "United States",
    currency_code: "usd",
    countries: [
      { id: "us", iso_2: "us", name: "United States" },
      { id: "cn", iso_2: "cn", name: "China" },
      { id: "tw", iso_2: "tw", name: "Taiwan" },
    ],
  },
]

export const getMockRegions = () => mockRegions

export const getMockRegionByCountry = (countryCode: string) => {
  // Always return US region regardless of country code
  return mockRegions[0]
}

export const getMockRegionById = (id: string) => {
  // Always return US region
  return mockRegions[0]
}
