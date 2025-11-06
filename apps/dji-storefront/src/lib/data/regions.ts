"use server"

import { sdk } from "@/lib/medusa"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "@/lib/server/cookies"
import { getMockRegionByCountry, getMockRegionById, getMockRegions } from "@/lib/data/mock-regions"

export const listRegions = async () => {
  const next = {
    ...(await getCacheOptions("regions")),
  }

  try {
    return await sdk.client
      .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
        method: "GET",
        next,
        cache: "force-cache",
      })
      .then(({ regions }) => regions)
  } catch {
    return getMockRegions()
  }
}

export const retrieveRegion = async (id: string) => {
  const next = {
    ...(await getCacheOptions(`regions-${id}`)),
  }

  try {
    return await sdk.client
      .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
        method: "GET",
        next,
        cache: "force-cache",
      })
      .then(({ region }) => region)
  } catch {
    return getMockRegionById(id)
  }
}

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const getRegion = async (countryCode: string) => {
  if (!countryCode) return null

  if (regionMap.has(countryCode)) {
    return regionMap.get(countryCode) ?? null
  }

  const regions = await listRegions()

  regions?.forEach((region) => {
    region.countries?.forEach((country) => {
      if (country?.iso_2) {
        regionMap.set(country.iso_2, region)
      }
    })
  })

  return regionMap.get(countryCode) ?? getMockRegionByCountry(countryCode) ?? null
}
