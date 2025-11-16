import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { DiscordAuthService } from "./service"

export default ModuleProvider(Modules.AUTH, {
  services: [DiscordAuthService],
})

export * from "./service"
