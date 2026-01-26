import { model } from "@medusajs/framework/utils"

const Tenant = model.define("tenant", {
  id: model.id().primaryKey(),
  name: model.text(),
  slug: model.text().unique(),
  supabase_tenant_id: model.text().unique(),
  status: model.enum(["active", "suspended", "deleted"]).default("active"),
  plan: model.enum(["free", "pro", "enterprise"]).default("free"),
  settings: model.json().default({}),
})

export default Tenant
