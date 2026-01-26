import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const tenantId = req.tenant_id

  if (!tenantId) {
    res.status(400).json({ message: "Tenant not resolved" })
    return
  }

  // Checkout will be implemented in Sprint 2
  // This placeholder ensures the route is registered
  res.status(501).json({
    message: "Checkout not yet implemented. Coming in Sprint 2.",
  })
}
