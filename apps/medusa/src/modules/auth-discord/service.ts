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

type DiscordAuthOptions = {
  clientId: string
  clientSecret: string
  callbackUrl: string
  scope?: string
}

type ConstructorDeps = {
  logger: Logger
}

type DiscordTokenResponse = {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope?: string
}

type DiscordUserResponse = {
  id: string
  username: string
  global_name?: string
  display_name?: string
  email?: string
  verified?: boolean
  avatar?: string
}

const DISCORD_TOKEN_URL = "https://discord.com/api/oauth2/token"
const DISCORD_USER_URL = "https://discord.com/api/users/@me"

export class DiscordAuthService extends AbstractAuthModuleProvider {
  static identifier = "discord"
  static DISPLAY_NAME = "Discord OAuth"

  protected options_: DiscordAuthOptions
  protected logger_: Logger

  static validateOptions(options: DiscordAuthOptions) {
    if (!options?.clientId) {
      throw new Error("Discord clientId is required")
    }
    if (!options?.clientSecret) {
      throw new Error("Discord clientSecret is required")
    }
    if (!options?.callbackUrl) {
      throw new Error("Discord callbackUrl is required")
    }
  }

  constructor({ logger }: ConstructorDeps, options: DiscordAuthOptions) {
    // @ts-expect-error upstream base class expects broader deps signature
    super(...arguments)
    this.logger_ = logger
    this.options_ = options
  }

  async register(): Promise<AuthenticationResponse> {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Registration via Discord OAuth is not supported. Use authenticate instead."
    )
  }

  async authenticate(
    data: AuthenticationInput,
    authIdentityService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    try {
      const code = this.extractCode(data)
      if (!code) {
        return { success: false, error: "Missing Discord authorization code" }
      }

      const token = await this.exchangeCode(code)
      const profile = await this.fetchUserProfile(token.access_token)

      if (!profile?.email) {
        return { success: false, error: "Discord profile did not include an email" }
      }

      if (profile.verified === false) {
        return { success: false, error: "Discord account email must be verified" }
      }

      const authIdentity = await this.resolveAuthIdentity(profile, authIdentityService)
      return {
        success: true,
        authIdentity,
      }
    } catch (error) {
      const message =
        error instanceof MedusaError ? error.message : "Unable to authenticate with Discord"
      this.logger_?.error?.("discord-auth", error)
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
    return data.body?.code ?? data.query?.code ?? data.headers?.["x-discord-code"]
  }

  protected async exchangeCode(code: string) {
    const params = new URLSearchParams({
      client_id: this.options_.clientId,
      client_secret: this.options_.clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: this.options_.callbackUrl,
      scope: this.options_.scope ?? "identify email",
    })

    const response = await fetch(DISCORD_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    })

    if (!response.ok) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Discord token exchange failed (${response.status})`
      )
    }

    return (await response.json()) as DiscordTokenResponse
  }

  protected async fetchUserProfile(accessToken: string) {
    const response = await fetch(DISCORD_USER_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Discord profile lookup failed (${response.status})`
      )
    }

    return (await response.json()) as DiscordUserResponse
  }

  protected async resolveAuthIdentity(
    profile: DiscordUserResponse,
    authIdentityService: AuthIdentityProviderService
  ) {
    const entityId = profile.id

    if (!entityId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Discord response did not include a user id"
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
        email_verified: profile.verified,
        username: profile.username,
        global_name: profile.global_name ?? profile.display_name,
        avatar: profile.avatar,
      },
      provider_metadata: {
        scope: this.options_.scope ?? "identify email",
      },
    })
  }
}
