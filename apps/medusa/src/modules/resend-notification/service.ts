import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/framework/utils"
import type {
  Logger,
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from "@medusajs/framework/types"
import { Resend, CreateEmailOptions } from "resend"
import React from "react"

// Import email templates
import { orderConfirmationEmail } from "./emails/order-confirmation"
import { orderShippedEmail } from "./emails/order-shipped"
import { passwordResetEmail } from "./emails/password-reset"
import { welcomeEmail } from "./emails/welcome"
import { otpVerificationEmail } from "./emails/otp-verification"

export enum Templates {
  ORDER_PLACED = "order-placed",
  ORDER_SHIPPED = "order-shipped",
  PASSWORD_RESET = "password-reset",
  CUSTOMER_CREATED = "customer-created",
  OTP_VERIFICATION = "otp-verification",
}

type TemplateFunction = (props: unknown) => React.ReactNode

const templates: { [key in Templates]?: TemplateFunction } = {
  [Templates.ORDER_PLACED]: orderConfirmationEmail,
  [Templates.ORDER_SHIPPED]: orderShippedEmail,
  [Templates.PASSWORD_RESET]: passwordResetEmail,
  [Templates.CUSTOMER_CREATED]: welcomeEmail,
  [Templates.OTP_VERIFICATION]: otpVerificationEmail,
}

type ResendNotificationOptions = {
  apiKey: string
  fromEmail: string
  fromName?: string
  html_templates?: {
    [key: string]: {
      content: string
      subject?: string
    }
  }
}

type InjectedDependencies = {
  logger: Logger
}

class ResendNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "resend"
  static DISPLAY_NAME = "Resend Email Provider"

  protected logger: Logger
  protected options: ResendNotificationOptions
  protected resendClient: Resend

  static validateOptions(options: Record<string, unknown>) {
    if (!options?.apiKey) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Resend API key is required in the provider's options."
      )
    }
    if (!options?.fromEmail) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Resend from email is required in the provider's options."
      )
    }
  }

  constructor(
    { logger }: InjectedDependencies,
    options: ResendNotificationOptions
  ) {
    super()
    this.logger = logger
    this.options = options
    this.resendClient = new Resend(options.apiKey)
  }

  private getTemplate(template: Templates): string | TemplateFunction | null {
    // Check for custom HTML template first
    if (this.options.html_templates?.[template]) {
      return this.options.html_templates[template].content
    }

    const allowedTemplates = Object.keys(templates)
    if (!allowedTemplates.includes(template)) {
      return null
    }

    return templates[template] || null
  }

  private getTemplateSubject(template: Templates): string {
    // Check for custom subject first
    if (this.options.html_templates?.[template]?.subject) {
      return this.options.html_templates[template].subject
    }

    switch (template) {
      case Templates.ORDER_PLACED:
        return "Your Order Has Been Confirmed"
      case Templates.ORDER_SHIPPED:
        return "Your Order Has Shipped!"
      case Templates.PASSWORD_RESET:
        return "Reset Your Password"
      case Templates.CUSTOMER_CREATED:
        return "Welcome to Cockpit Simulator"
      case Templates.OTP_VERIFICATION:
        return "Your Verification Code"
      default:
        return "Notification from Cockpit Simulator"
    }
  }

  async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    const template = this.getTemplate(notification.template as Templates)

    if (!template) {
      this.logger.error(
        `Couldn't find an email template for ${notification.template}. ` +
        `The valid options are ${Object.values(Templates).join(", ")}`
      )
      return {}
    }

    const fromAddress = this.options.fromName
      ? `${this.options.fromName} <${this.options.fromEmail}>`
      : this.options.fromEmail

    const commonOptions = {
      from: fromAddress,
      to: [notification.to],
      subject: this.getTemplateSubject(notification.template as Templates),
    }

    let emailOptions: CreateEmailOptions

    if (typeof template === "string") {
      // HTML string template
      emailOptions = {
        ...commonOptions,
        html: template,
      }
    } else {
      // React component template
      emailOptions = {
        ...commonOptions,
        react: template(notification.data) as React.ReactElement,
      }
    }

    try {
      const { data, error } = await this.resendClient.emails.send(emailOptions)

      if (error || !data) {
        if (error) {
          this.logger.error("Failed to send email via Resend", error)
        } else {
          this.logger.error("Failed to send email via Resend: unknown error")
        }
        return {}
      }

      this.logger.info(`Email sent successfully to ${notification.to}, ID: ${data.id}`)
      return { id: data.id }
    } catch (err) {
      this.logger.error("Exception while sending email via Resend", err)
      return {}
    }
  }
}

export default ResendNotificationProviderService
