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

type FacebookAuthOptions = {
  clientId: string
  clientSecret: string
  callbackUrl: string
  fields?: string
}

type ConstructorDeps = {
  logger: Logger
}

type FacebookTokenResponse = {
  access_token: string
  token_type: string
  expires_in: number
}

type FacebookUserResponse = {
  id: string
  name?: string
  email?: string
  picture?: {
    data?: {
      url?: string
    }
  }
}

const FACEBOOK_TOKEN_URL = "https://graph.facebook.com/v19.0/oauth/access_token"
const FACEBOOK_USER_URL = "https://graph.facebook.com/v19.0/me"

export class FacebookAuthService extends AbstractAuthModuleProvider {
  static identifier = "facebook"
  static DISPLAY_NAME = "Facebook OAuth"

  protected options_: FacebookAuthOptions
  protected logger_: Logger

  static validateOptions(options: FacebookAuthOptions) {
    if (!options?.clientId) {
      throw new Error("Facebook clientId is required")
    }
    if (!options?.clientSecret) {
      throw new Error("Facebook clientSecret is required")
    }
    if (!options?.callbackUrl) {
      throw new Error("Facebook callbackUrl is required")
    }
  }

  constructor({ logger }: ConstructorDeps, options: FacebookAuthOptions) {
    // @ts-expect-error upstream base class expects broader deps signature
    super(...arguments)
    this.logger_ = logger
    this.options_ = options
  }

  async register(): Promise<AuthenticationResponse> {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Registration via Facebook OAuth is not supported. Use authenticate instead."
    )
  }

  async authenticate(
    data: AuthenticationInput,
    authIdentityService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    try {
      const code = this.extractCode(data)
      if (!code) {
        return { success: false, error: "Missing Facebook authorization code" }
      }

      const token = await this.exchangeCode(code)
      const profile = await this.fetchUserProfile(token.access_token)

      if (!profile?.email) {
        return { success: false, error: "Facebook profile did not include an email" }
      }

      const authIdentity = await this.resolveAuthIdentity(profile, authIdentityService)
      return {
        success: true,
        authIdentity,
      }
    } catch (error) {
      const message =
        error instanceof MedusaError ? error.message : "Unable to authenticate with Facebook"
      this.logger_?.error?.("facebook-auth", error)
      return { success: false, error: message }
    }
  }

  async validateCallback(
    data: AuthenticationInput,
    authIdentityService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    return this.authenticate(data, authIdentityService)
  }

  protected extractCode(data: AuthenticationInput) {
    return data.body?.code ?? data.query?.code
  }

  protected async exchangeCode(code: string) {
    const params = new URLSearchParams({
      client_id: this.options_.clientId,
      client_secret: this.options_.clientSecret,
      redirect_uri: this.options_.callbackUrl,
      code,
    })

    const response = await fetch(`${FACEBOOK_TOKEN_URL}?${params.toString()}`, {
      method: "GET",
    })

    if (!response.ok) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Facebook token exchange failed (${response.status})`
      )
    }

    return (await response.json()) as FacebookTokenResponse
  }

  protected async fetchUserProfile(accessToken: string) {
    const fields =
      this.options_.fields ?? "id,name,email,picture.width(320).height(320)"
    const params = new URLSearchParams({
      fields,
      access_token: accessToken,
    })

    const response = await fetch(`${FACEBOOK_USER_URL}?${params.toString()}`)

    if (!response.ok) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Facebook profile lookup failed (${response.status})`
      )
    }

    return (await response.json()) as FacebookUserResponse
  }

  protected async resolveAuthIdentity(
    profile: FacebookUserResponse,
    authIdentityService: AuthIdentityProviderService
  ) {
    const entityId = profile.id

    if (!entityId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Facebook response did not include an id"
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
        email: profile.email,
        name: profile.name,
        avatar: profile.picture?.data?.url,
      },
      provider_metadata: {
        fields: this.options_.fields,
      },
    })
  }
}
