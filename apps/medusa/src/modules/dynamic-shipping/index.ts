import {
  ModuleProvider,
  Modules,
} from "@medusajs/framework/utils"
import DynamicShippingProviderService from "./service"

export default ModuleProvider(Modules.FULFILLMENT, {
  services: [DynamicShippingProviderService],
})
