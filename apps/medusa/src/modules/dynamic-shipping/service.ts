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
const COUNTRY_TO_REGION: Record<string, string> = {
  // US
  us: "us",
  // Europe
  at: "eu", be: "eu", bg: "eu", hr: "eu", cy: "eu", cz: "eu", dk: "eu",
  ee: "eu", fi: "eu", fr: "eu", de: "eu", gr: "eu", hu: "eu", ie: "eu",
  it: "eu", lv: "eu", lt: "eu", lu: "eu", mt: "eu", nl: "eu", pl: "eu",
  pt: "eu", ro: "eu", sk: "eu", si: "eu", es: "eu", se: "eu", gb: "eu",
  ch: "eu", no: "eu",
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
   * Get product-specific shipping rate from PRODUCT_SHIPPING_RATES config
   */
  private getProductShippingRate(
    items: any[],
    countryCode: string | undefined
  ): number | null {
    if (!countryCode) return null

    const regionKey = COUNTRY_TO_REGION[countryCode.toLowerCase()] || "default"

    this.logger.info(`Shipping calculation - items: ${items.length}, country: ${countryCode}, region: ${regionKey}`)

    for (const item of items) {
      // Get product handle from various possible paths
      const handle = item.variant?.product?.handle || item.product?.handle || item.product_handle

      this.logger.info(`Checking item - handle: ${handle || 'NOT FOUND'}`)

      if (handle && PRODUCT_SHIPPING_RATES[handle]) {
        const rates = PRODUCT_SHIPPING_RATES[handle]
        const rate = rates[regionKey] ?? rates.default

        if (rate !== undefined) {
          this.logger.info(`Found shipping rate for "${handle}": ${rate} cents (region: ${regionKey})`)
          return rate
        }
      }
    }

    return null
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

    // Check for product-specific shipping rate
    const productRate = this.getProductShippingRate(items, countryCode)
    if (productRate !== null) {
      return {
        calculated_amount: productRate,
        is_calculated_price_tax_inclusive: false
      }
    }

    // Free shipping for all other products
    this.logger.info("Free shipping applied (no product-specific rate configured)")
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