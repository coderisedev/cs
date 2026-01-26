import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import TenantModuleService from "../../../modules/tenant/service"
import { TENANT_MODULE } from "../../../modules/tenant"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const tenantService: TenantModuleService = req.scope.resolve(TENANT_MODULE)
  const tenants = await tenantService.listTenants()

  res.json({ tenants })
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const tenantService: TenantModuleService = req.scope.resolve(TENANT_MODULE)

  const { name, slug, supabase_tenant_id, plan } = req.body as {
    name: string
    slug: string
    supabase_tenant_id: string
    plan?: string
  }

  if (!name || !slug || !supabase_tenant_id) {
    res.status(400).json({
      message: "name, slug, and supabase_tenant_id are required",
    })
    return
  }

  const existing = await tenantService.findBySlug(slug)
  if (existing) {
    res.status(409).json({ message: "Slug already taken" })
    return
  }

  const tenant = await tenantService.createTenants({
    name,
    slug,
    supabase_tenant_id,
    plan: plan ?? "free",
  })

  res.status(201).json({ tenant })
}
