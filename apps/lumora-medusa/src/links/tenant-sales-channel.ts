import { defineLink, Modules } from "@medusajs/framework/utils"
import TenantModule from "../modules/tenant"

export default defineLink(
  TenantModule.linkable.tenant,
  {
    linkable: {
      serviceName: Modules.SALES_CHANNEL,
      field: "sales_channel",
      linkable: "sales_channel_id",
      primaryKey: "id",
    },
  }
)
