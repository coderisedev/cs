import type {
  AuthenticationInput,
  AuthenticationResponse,
  AuthIdentityProviderService,
  Logger,
} from "@medusajs/framework/types"
import {
  AbstractAuthModuleProvider,
  MedusaError,
} from "@medusajs/framework/utils"
import { OAuth2Client, TokenPayload } from "google-auth-library"

type GoogleOneTapOptions = {
  clientId: string
}

type ConstructorDeps = {
  logger: Logger
}

export class GoogleOneTapAuthService extends AbstractAuthModuleProvider {
  static identifier = "google-one-tap"
  static DISPLAY_NAME = "Google One Tap"

  protected logger_: Logger
  protected options_: GoogleOneTapOptions
  protected oauthClient_: OAuth2Client

  static validateOptions(options: GoogleOneTapOptions) {
    if (!options?.clientId) {
      throw new Error("Google One Tap clientId is required")
    }
  }

  constructor({ logger }: ConstructorDeps, options: GoogleOneTapOptions) {
    // @ts-expect-error upstream base class expects broader deps signature
    super(...arguments)
    this.logger_ = logger
    this.options_ = options
    this.oauthClient_ = new OAuth2Client(options.clientId)
  }

  async register(): Promise<AuthenticationResponse> {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Registration via Google One Tap is not supported. Use authenticate instead."
    )
  }

  async authenticate(
    data: AuthenticationInput,
    authIdentityService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    try {
      const idToken = this.extractCredential(data)
      if (!idToken) {
        return { success: false, error: "Missing Google credential" }
      }

      const payload = await this.verifyCredential(idToken)
      if (!payload?.email) {
        return { success: false, error: "Google response did not include an email address" }
      }
      if (!payload.email_verified) {
        return { success: false, error: "Google account email must be verified" }
      }

      const authIdentity = await this.resolveAuthIdentity(payload, authIdentityService)
      return {
        success: true,
        authIdentity,
      }
    } catch (error) {
      const message =
        error instanceof MedusaError ? error.message : "Unable to authenticate with Google"
      this.logger_?.error?.("google-one-tap-auth", error)
      return { success: false, error: message }
    }
  }

  async validateCallback(
    data: AuthenticationInput,
    authIdentityService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    return this.authenticate(data, authIdentityService)
  }

  protected extractCredential(data: AuthenticationInput) {
    const tokenFromBody = data.body?.credential ?? data.body?.id_token
    if (tokenFromBody) {
      return tokenFromBody
    }

    const bearer = data.headers?.authorization
    if (bearer?.startsWith("Bearer ")) {
      return bearer.slice("Bearer ".length)
    }

    return undefined
  }

  protected async verifyCredential(idToken: string) {
    try {
      const ticket = await this.oauthClient_.verifyIdToken({
        idToken,
        audience: this.options_.clientId,
      })
      return ticket.getPayload()
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Invalid Google credential. Please try again."
      )
    }
  }

  protected async resolveAuthIdentity(
    payload: TokenPayload,
    authIdentityService: AuthIdentityProviderService
  ) {
    const entityId = payload.sub as string
    if (!entityId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Google response did not include a subject identifier"
      )
    }

    try {
      return await authIdentityService.retrieve({ entity_id: entityId })
    } catch (error) {
      if (error?.type !== MedusaError.Types.NOT_FOUND) {
        throw error
      }
    }

    return authIdentityService.create({
      entity_id: entityId,
      user_metadata: {
        email: payload.email,
        email_verified: payload.email_verified,
        name: payload.name,
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name,
      },
      provider_metadata: {
        iss: payload.iss,
        aud: payload.aud,
      },
    })
  }
}
