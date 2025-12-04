import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

interface PasswordResetData {
  entity_id: string
  token: string
  actor_type: string
}

export default async function resetPasswordTokenHandler({
  event: {
    data: { entity_id: email, token, actor_type },
  },
  container,
}: SubscriberArgs<PasswordResetData>) {
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)

  // Determine the URL prefix based on actor type
  let urlPrefix: string

  if (actor_type === "customer") {
    // Storefront URL for customers
    urlPrefix = process.env.STORE_URL || "https://cockpitsimulator.com"
  } else {
    // Admin URL for admin users
    const backendUrl = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
    urlPrefix = `${backendUrl}/app`
  }

  // Build the reset URL with token and email
  const resetUrl = `${urlPrefix}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`

  // Send password reset email
  await notificationModuleService.createNotifications({
    to: email,
    channel: "email",
    template: "password-reset",
    data: {
      url: resetUrl,
      email: email,
    },
  })

  console.log(`Password reset email sent to ${email}`)
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
}
