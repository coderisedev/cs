import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import crypto from "crypto"

interface CustomerEventData {
  id: string
}

const DISCOURSE_URL = process.env.DISCOURSE_URL ?? ""
const DISCOURSE_SSO_SECRET = process.env.DISCOURSE_SSO_SECRET ?? ""
const DISCOURSE_API_KEY = process.env.DISCOURSE_API_KEY ?? ""
const DISCOURSE_API_USERNAME = process.env.DISCOURSE_API_USERNAME ?? "system"

function buildPayload(params: Record<string, string>): string {
  const qs = new URLSearchParams(params)
  return Buffer.from(qs.toString()).toString("base64")
}

function signPayload(payload: string): string {
  return crypto
    .createHmac("sha256", DISCOURSE_SSO_SECRET)
    .update(payload)
    .digest("hex")
}

export default async function discourseSyncHandler({
  event: { data, name: eventName },
  container,
}: SubscriberArgs<CustomerEventData>) {
  if (!DISCOURSE_URL || !DISCOURSE_SSO_SECRET || !DISCOURSE_API_KEY) {
    return
  }

  const query = container.resolve("query")

  const {
    data: [customer],
  } = await query.graph({
    entity: "customer",
    fields: ["id", "email", "first_name", "last_name"],
    filters: { id: data.id },
  })

  if (!customer || !customer.email) {
    console.warn(`[discourse-sync] Customer ${data.id} not found or has no email`)
    return
  }

  const name = [customer.first_name, customer.last_name]
    .filter(Boolean)
    .join(" ")

  const payloadParams: Record<string, string> = {
    nonce: crypto.randomUUID(),
    external_id: customer.id,
    email: customer.email,
  }

  if (name) payloadParams.name = name
  if (eventName === "customer.created") {
    payloadParams.suppress_welcome_message = "true"
  }

  const payload = buildPayload(payloadParams)
  const sig = signPayload(payload)

  try {
    const response = await fetch(`${DISCOURSE_URL}/admin/users/sync_sso`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Api-Key": DISCOURSE_API_KEY,
        "Api-Username": DISCOURSE_API_USERNAME,
      },
      body: new URLSearchParams({ sso: payload, sig }).toString(),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error(
        `[discourse-sync] sync_sso failed for ${customer.email} (${response.status}): ${text.slice(0, 200)}`
      )
    } else {
      console.log(
        `[discourse-sync] synced ${customer.email} (${eventName})`
      )
    }
  } catch (error) {
    console.error(`[discourse-sync] network error for ${customer.email}:`, error)
  }
}

export const config: SubscriberConfig = {
  event: ["customer.created", "customer.updated"],
}
