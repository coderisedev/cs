"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"
import {
  getMockRegionByCountry,
  getMockRegionById,
  getMockRegions,
} from "./mock-data"

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
  } catch (error) {
    return getMockRegions()
  }
}

export const retrieveRegion = async (id: string) => {
  const next = {
    ...(await getCacheOptions(["regions", id].join("-"))),
  }

  try {
    return await sdk.client
      .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
        method: "GET",
        next,
        cache: "force-cache",
      })
      .then(({ region }) => region)
  } catch (error) {
    const mock = getMockRegionById(id)
    if (!mock) {
      throw medusaError(error)
    }
    return mock
  }
}

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const getRegion = async (countryCode: string) => {
  try {
    const normalizedCode = countryCode?.toLowerCase()

    if (normalizedCode && regionMap.has(normalizedCode)) {
      return regionMap.get(normalizedCode)
    }

    const regions = await listRegions()

    if (!regions || !regions.length) {
      return null
    }

    regions.forEach((region) => {
      region.countries?.forEach((c) => {
        const iso = c?.iso_2?.toLowerCase() ?? ""
        if (iso) {
          regionMap.set(iso, region)
        }
      })
    })

    const defaultRegion =
      regions.find((region) =>
        region.countries?.some((c) => c?.iso_2?.toLowerCase() === normalizedCode)
      ) ?? regions[0]

    const region = normalizedCode
      ? regionMap.get(normalizedCode) ?? defaultRegion
      : regionMap.get("us") ?? defaultRegion

    return (
      region ||
      (normalizedCode
        ? getMockRegionByCountry(normalizedCode)
        : getMockRegions()[0]) ||
      null
    )
  } catch (e: any) {
    return countryCode
      ? getMockRegionByCountry(countryCode.toLowerCase())
      : getMockRegions()[0] || null
  }
}
