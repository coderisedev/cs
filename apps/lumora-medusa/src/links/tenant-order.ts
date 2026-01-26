import { defineLink, Modules } from "@medusajs/framework/utils"
import TenantModule from "../modules/tenant"

export default defineLink(
  TenantModule.linkable.tenant,
  {
    linkable: {
      serviceName: Modules.ORDER,
      field: "order",
      linkable: "order_id",
      primaryKey: "id",
    },
    isList: true,
  }
)
