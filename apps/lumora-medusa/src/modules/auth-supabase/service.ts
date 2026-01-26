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
import * as jose from "jose"

type SupabaseAuthOptions = {
  jwtSecret: string
}

type ConstructorDeps = {
  logger: Logger
}

export class SupabaseAuthService extends AbstractAuthModuleProvider {
  static identifier = "supabase"
  static DISPLAY_NAME = "Supabase JWT"

  protected logger_: Logger
  protected options_: SupabaseAuthOptions
  protected secretKey_: Uint8Array

  static validateOptions(options: SupabaseAuthOptions) {
    if (!options?.jwtSecret) {
      throw new Error("Supabase JWT secret is required")
    }
  }

  constructor({ logger }: ConstructorDeps, options: SupabaseAuthOptions) {
    // @ts-expect-error upstream base class expects broader deps signature
    super(...arguments)
    this.logger_ = logger
    this.options_ = options
    this.secretKey_ = new TextEncoder().encode(options.jwtSecret)
  }

  async register(): Promise<AuthenticationResponse> {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Registration is handled by Supabase. Use authenticate instead."
    )
  }

  async authenticate(
    data: AuthenticationInput,
    authIdentityService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    try {
      const token = this.extractToken(data)
      if (!token) {
        return { success: false, error: "Missing authorization token" }
      }

      const payload = await this.verifyToken(token)
      if (!payload.sub) {
        return { success: false, error: "Token missing subject claim" }
      }

      const entityId = `supabase:${payload.sub}`
      const authIdentity = await this.resolveAuthIdentity(
        entityId,
        payload,
        authIdentityService
      )

      return {
        success: true,
        authIdentity,
      }
    } catch (error) {
      const message =
        error instanceof MedusaError
          ? error.message
          : "Unable to authenticate with Supabase"
      this.logger_?.error?.("auth-supabase", error)
      return { success: false, error: message }
    }
  }

  async validateCallback(
    data: AuthenticationInput,
    authIdentityService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    return this.authenticate(data, authIdentityService)
  }

  protected extractToken(data: AuthenticationInput): string | undefined {
    const bearer = data.headers?.authorization
    if (bearer?.startsWith("Bearer ")) {
      return bearer.slice(7)
    }
    const bodyToken = data.body?.token ?? data.body?.access_token
    return bodyToken ?? undefined
  }

  protected async verifyToken(token: string): Promise<jose.JWTPayload> {
    try {
      const { payload } = await jose.jwtVerify(token, this.secretKey_, {
        algorithms: ["HS256"],
      })
      return payload
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.UNAUTHORIZED,
        "Invalid or expired Supabase token"
      )
    }
  }

  protected async resolveAuthIdentity(
    entityId: string,
    payload: jose.JWTPayload,
    authIdentityService: AuthIdentityProviderService
  ) {
    try {
      return await authIdentityService.retrieve({ entity_id: entityId })
    } catch (error: any) {
      if (error?.type !== MedusaError.Types.NOT_FOUND) {
        throw error
      }
    }

    return authIdentityService.create({
      entity_id: entityId,
      user_metadata: {
        supabase_user_id: payload.sub,
        email: payload.email as string | undefined,
        role: payload.role as string | undefined,
      },
    })
  }
}
