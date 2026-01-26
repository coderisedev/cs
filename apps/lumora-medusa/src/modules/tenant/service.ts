import { MedusaService } from "@medusajs/framework/utils"
import Tenant from "./models/tenant"

class TenantModuleService extends MedusaService({
  Tenant,
}) {
  async findBySlug(slug: string) {
    const [tenant] = await this.listTenants({ slug })
    return tenant ?? null
  }

  async findBySupabaseId(supabaseTenantId: string) {
    const [tenant] = await this.listTenants({
      supabase_tenant_id: supabaseTenantId,
    })
    return tenant ?? null
  }
}

export default TenantModuleService
