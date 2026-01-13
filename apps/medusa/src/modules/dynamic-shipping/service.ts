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
    
    let totalWeight = 0
    let totalQuantity = 0
    
    for (const item of items) {
      const quantity = Number(item.quantity)
      const weight = Number(item.variant?.weight || 0)
      
      totalWeight += weight * quantity
      totalQuantity += quantity
    }

    const basePrice = this.options.base_price || 1000 
    const weightMult = this.options.weight_multiplier || 100 

    const address = context.shipping_address
    let zoneMultiplier = 1

    if (address?.country_code) {
      const code = address.country_code.toLowerCase()
      if (code === 'us') {
        zoneMultiplier = 1
      } else if (code === 'ca') {
        zoneMultiplier = 1.2
      } else {
        zoneMultiplier = 1.5 
      }
    }

    let calcPrice = basePrice
    
    if (totalWeight > 0) {
      calcPrice += totalWeight * weightMult
    } else {
      calcPrice += (totalQuantity - 1) * 200
    }

    const isExpress = (optionData?.id as string)?.includes('express')
    if (isExpress) {
      calcPrice *= 2
    }

    calcPrice = Math.ceil(calcPrice * zoneMultiplier)
    
    this.logger.info(`Calculated Price: ${calcPrice} (Weight: ${totalWeight}, Zone: ${zoneMultiplier})`)

    return {
      calculated_amount: calcPrice,
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