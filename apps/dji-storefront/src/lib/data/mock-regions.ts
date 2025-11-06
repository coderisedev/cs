import { HttpTypes } from "@medusajs/types"

const mockRegions: HttpTypes.StoreRegion[] = [
  {
    id: "reg_mock_us",
    name: "United States",
    currency_code: "usd",
    tax_rate: 0,
    countries: [{ iso_2: "us", name: "United States" }],
  },
  {
    id: "reg_mock_eu",
    name: "European Union",
    currency_code: "eur",
    tax_rate: 0,
    countries: [
      { iso_2: "de", name: "Germany" },
      { iso_2: "fr", name: "France" },
      { iso_2: "es", name: "Spain" },
    ],
  },
]

export const getMockRegions = () => mockRegions

export const getMockRegionByCountry = (countryCode: string) =>
  mockRegions.find((region) => region.countries?.some((c) => c.iso_2 === countryCode))

export const getMockRegionById = (id: string) => mockRegions.find((region) => region.id === id)
