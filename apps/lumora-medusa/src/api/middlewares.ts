import {
  defineMiddlewares,
  authenticate,
  type MedusaNextFunction,
  type MedusaRequest,
  type MedusaResponse,
} from "@medusajs/framework/http"
import TenantModuleService from "../modules/tenant/service"
import { TENANT_MODULE } from "../modules/tenant"

declare module "@medusajs/framework/http" {
  interface MedusaRequest {
    tenant_id?: string
    tenant_slug?: string
  }
}

async function resolveTenantFromHeader(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  const tenantId = req.headers["x-tenant-id"] as string | undefined
  if (!tenantId) {
    res.status(400).json({ message: "Missing X-Tenant-Id header" })
    return
  }

  const tenantService: TenantModuleService = req.scope.resolve(TENANT_MODULE)
  const [tenant] = await tenantService.listTenants({ id: tenantId })

  if (!tenant || tenant.status !== "active") {
    res.status(404).json({ message: "Tenant not found or inactive" })
    return
  }

  req.tenant_id = tenant.id
  next()
}

async function resolveTenantFromSlug(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  const slug = req.params.tenant_slug
  if (!slug) {
    res.status(400).json({ message: "Missing tenant slug" })
    return
  }

  const tenantService: TenantModuleService = req.scope.resolve(TENANT_MODULE)
  const tenant = await tenantService.findBySlug(slug)

  if (!tenant || tenant.status !== "active") {
    res.status(404).json({ message: "Store not found" })
    return
  }

  req.tenant_id = tenant.id
  req.tenant_slug = tenant.slug
  next()
}

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/tenants",
      middlewares: [
        authenticate("user", ["bearer"]),
      ],
    },
    {
      matcher: "/admin/products*",
      middlewares: [
        authenticate("user", ["bearer"]),
        resolveTenantFromHeader,
      ],
    },
    {
      matcher: "/shop/:tenant_slug/*",
      middlewares: [
        resolveTenantFromSlug,
      ],
    },
  ],
})
