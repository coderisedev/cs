import { defineLink, Modules } from "@medusajs/framework/utils"
import TenantModule from "../modules/tenant"

export default defineLink(
  TenantModule.linkable.tenant,
  {
    linkable: {
      serviceName: Modules.CUSTOMER,
      field: "customer",
      linkable: "customer_id",
      primaryKey: "id",
    },
    isList: true,
  }
)
