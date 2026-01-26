import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { SupabaseAuthService } from "./service"

export default ModuleProvider(Modules.AUTH, {
  services: [SupabaseAuthService],
})

export { SupabaseAuthService }
