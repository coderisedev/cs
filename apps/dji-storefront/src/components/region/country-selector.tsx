"use client"

import { useState, useTransition } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Globe, ChevronDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCountriesByRegion, getRegionForCountry, COUNTRY_NAMES } from "@/lib/config/regions"
import { switchCountry } from "@/lib/actions/region"

type CountrySelectorProps = {
  currentCountry: string
}

export function CountrySelector({ currentCountry }: CountrySelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const currentRegionCode = getRegionForCountry(currentCountry)
  const regionsByGroup = getCountriesByRegion()

  const handleCountryChange = (newCountry: string) => {
    if (newCountry === currentCountry) {
      setIsOpen(false)
      return
    }

    setIsOpen(false)
    startTransition(async () => {
      await switchCountry(newCountry)
      // Update URL to new country
      const newPathname = pathname.replace(/^\/[a-z]{2}/, `/${newCountry}`)
      router.push(newPathname)
      router.refresh()
    })
  }

  const currentCountryName = COUNTRY_NAMES[currentCountry] || currentCountry.toUpperCase()
  const currentRegion = regionsByGroup.find(r => r.code === currentRegionCode)

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-1.5 text-foreground-secondary hover:text-foreground-primary"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{currentCountryName}</span>
        <span className="sm:hidden">{currentCountry.toUpperCase()}</span>
        <span className="text-xs text-foreground-muted">({currentRegion?.currency})</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-2 w-72 bg-background-primary border border-border-primary rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            {regionsByGroup.map((region) => (
              <div key={region.code} className="p-2">
                <div className="text-xs font-semibold text-foreground-muted px-3 py-2 uppercase tracking-wide">
                  {region.name} ({region.currency})
                </div>
                <div className="space-y-0.5">
                  {region.countries.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => handleCountryChange(country.code)}
                      disabled={isPending}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center justify-between transition-colors ${
                        country.code === currentCountry
                          ? 'bg-primary-500/10 text-primary-600 font-medium'
                          : 'hover:bg-background-secondary text-foreground-primary'
                      } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span>{country.name}</span>
                      {country.code === currentCountry && (
                        <Check className="h-4 w-4 text-primary-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
