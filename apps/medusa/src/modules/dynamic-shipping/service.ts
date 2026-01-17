import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils"
import {
  Logger,
  CreateShippingOptionDTO
} from "@medusajs/framework/types"

type DynamicShippingOptions = {
  base_price?: number
  weight_multiplier?: number
}

type InjectedDependencies = {
  logger: Logger
}

/**
 * Product-specific shipping rates configuration
 * Key: product handle, Value: { region_code: price_in_cents }
 *
 * To add shipping for a product:
 * 1. Find the product handle in Medusa Admin (e.g., "cs-737x-tq")
 * 2. Add an entry here with regional prices in cents
 *
 * Products NOT listed here get FREE shipping.
 */
const PRODUCT_SHIPPING_RATES: Record<string, Record<string, number>> = {
  "cs-737x-tq": {
    us: 100,      // $1.00 for US
    eu: 200,      // $2.00 for Europe
    default: 200, // Default for other regions
  },
  // Add more products here as needed:
  // "another-product-handle": {
  //   us: 500,      // $5.00 for US
  //   eu: 800,      // $8.00 for Europe
  //   default: 800,
  // },
}

// Map country codes to region keys for shipping rate lookup
// Americas = USD, International = EUR
const COUNTRY_TO_REGION: Record<string, string> = {
  // Americas (USD)
  us: "us", ca: "us", mx: "us",
  gt: "us", hn: "us", sv: "us", ni: "us", cr: "us", pa: "us",
  do: "us", jm: "us", tt: "us", bs: "us", bb: "us",
  ar: "us", cl: "us", co: "us", pe: "us", ec: "us", ve: "us", uy: "us", py: "us", bo: "us",
  // International (EUR) - Western Europe
  de: "eu", fr: "eu", it: "eu", es: "eu", nl: "eu", be: "eu", at: "eu", ch: "eu", lu: "eu", mc: "eu", li: "eu",
  // Northern Europe
  gb: "eu", ie: "eu", se: "eu", dk: "eu", fi: "eu", no: "eu", is: "eu",
  // Southern Europe
  pt: "eu", gr: "eu", mt: "eu", cy: "eu",
  // Central & Eastern Europe
  pl: "eu", cz: "eu", sk: "eu", hu: "eu", ro: "eu", bg: "eu", hr: "eu", si: "eu", ee: "eu", lv: "eu", lt: "eu",
  // Balkans
  rs: "eu", me: "eu", mk: "eu", al: "eu", ba: "eu", md: "eu", ua: "eu",
  // Middle East
  ae: "eu", sa: "eu", qa: "eu", kw: "eu", bh: "eu", om: "eu", jo: "eu", lb: "eu", il: "eu", tr: "eu", eg: "eu",
  // Africa
  za: "eu", ng: "eu", ke: "eu", ma: "eu", tn: "eu", gh: "eu",
  // Asia-Pacific
  jp: "eu", kr: "eu", au: "eu", nz: "eu", sg: "eu", hk: "eu", tw: "eu", my: "eu", th: "eu", vn: "eu", ph: "eu", id: "eu", cn: "eu",
}

class DynamicShippingProviderService extends AbstractFulfillmentProviderService {
  static identifier = "dynamic-shipping"
  static DISPLAY_NAME = "Dynamic Shipping Provider"

  protected logger: Logger
  protected options: DynamicShippingOptions

  constructor({ logger }: InjectedDependencies, options: DynamicShippingOptions) {
    super()
    this.logger = logger
    this.options = options
  }

  /**
   * Calculate total shipping cost for all items
   * Multiplies each product's shipping rate by its quantity
   */
  private calculateTotalShippingRate(
    items: any[],
    countryCode: string | undefined
  ): number {
    if (!countryCode) return 0

    const regionKey = COUNTRY_TO_REGION[countryCode.toLowerCase()] || "default"

    this.logger.info(`Shipping calculation - items: ${items.length}, country: ${countryCode}, region: ${regionKey}`)

    let totalShipping = 0

    for (const item of items) {
      // Get product handle from various possible paths
      const handle = item.variant?.product?.handle || item.product?.handle || item.product_handle
      const quantity = item.quantity || 1

      this.logger.info(`Checking item - handle: ${handle || 'NOT FOUND'}, quantity: ${quantity}`)

      if (handle && PRODUCT_SHIPPING_RATES[handle]) {
        const rates = PRODUCT_SHIPPING_RATES[handle]
        const ratePerUnit = rates[regionKey] ?? rates.default

        if (ratePerUnit !== undefined) {
          const itemShipping = ratePerUnit * quantity
          this.logger.info(`Shipping for "${handle}": ${ratePerUnit} cents x ${quantity} = ${itemShipping} cents`)
          totalShipping += itemShipping
        }
      }
    }

    this.logger.info(`Total shipping cost: ${totalShipping} cents`)
    return totalShipping
  }

  async getFulfillmentOptions(): Promise<any[]> {
    return [
      {
        id: "dynamic-standard",
        name: "Standard Shipping (Calculated)",
      },
      {
        id: "dynamic-express",
        name: "Express Shipping (Calculated)",
      }
    ]
  }

  async validateFulfillmentData(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    return data
  }

  async validateOption(data: Record<string, unknown>): Promise<boolean> {
    return true
  }

  async canCalculate(data: CreateShippingOptionDTO): Promise<boolean> {
    return true
  }

  async calculatePrice(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    context: any
  ): Promise<any> {
    this.logger.info("Calculating dynamic shipping price...")

    const items = (context?.items || []) as any[]
    const address = context.shipping_address
    const countryCode = address?.country_code

    // Calculate total shipping based on all items and their quantities
    const totalShipping = this.calculateTotalShippingRate(items, countryCode)

    if (totalShipping > 0) {
      return {
        calculated_amount: totalShipping,
        is_calculated_price_tax_inclusive: false
      }
    }

    // Free shipping if no products have configured rates
    this.logger.info("Free shipping applied (no product-specific rates configured)")
    return {
      calculated_amount: 0,
      is_calculated_price_tax_inclusive: false
    }
  }

  async createFulfillment(
    data: Record<string, unknown>,
    items: any[],
    order: any,
    fulfillment: any
  ): Promise<any> {
    return {
      data: {
        tracking_number: `DYN-${Date.now()}`,
        provider_id: "dynamic-shipping",
      },
      labels: []
    }
  }

  async cancelFulfillment(fulfillment: Record<string, unknown>): Promise<any> {
    return {}
  }

  async retrieveDocuments(data: Record<string, unknown>, documentType: string): Promise<any> {
    return []
  }

  async getReturnItems(data: Record<string, unknown>): Promise<any> {
    return []
  }

  async getSaveReturnItems(data: Record<string, unknown>): Promise<any> {
    return []
  }

  async validateReturnReason(reason: Record<string, unknown>): Promise<any> {
    return true
  }
}

export default DynamicShippingProviderService