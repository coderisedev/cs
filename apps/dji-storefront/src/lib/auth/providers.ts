export type OAuthProviderId = "google" | "discord" | "facebook"

type ProviderConfig = {
  id: OAuthProviderId
  label: string
  envFlag: string
  serverEnvFlag?: string
  stateCookiePrefix: string
}

const PROVIDERS: Record<OAuthProviderId, ProviderConfig> = {
  google: {
    id: "google",
    label: "Google",
    envFlag: "NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH_POPUP",
    serverEnvFlag: "ENABLE_GOOGLE_OAUTH_POPUP",
    stateCookiePrefix: "google_oauth_state",
  },
  discord: {
    id: "discord",
    label: "Discord",
    envFlag: "NEXT_PUBLIC_ENABLE_DISCORD_OAUTH",
    serverEnvFlag: "ENABLE_DISCORD_OAUTH",
    stateCookiePrefix: "discord_oauth_state",
  },
  facebook: {
    id: "facebook",
    label: "Facebook",
    envFlag: "NEXT_PUBLIC_ENABLE_FACEBOOK_OAUTH",
    serverEnvFlag: "ENABLE_FACEBOOK_OAUTH",
    stateCookiePrefix: "facebook_oauth_state",
  },
}

const truthy = (value?: string | null) => value?.toLowerCase() === "true"

export const getOAuthProviderConfig = (provider?: string | null) => {
  if (!provider) {
    return undefined
  }
  const key = provider.toLowerCase() as OAuthProviderId
  return PROVIDERS[key]
}

export const isOAuthProviderEnabled = (provider: OAuthProviderId) => {
  const config = PROVIDERS[provider]
  if (!config) {
    return false
  }

  const envValue =
    process.env[config.envFlag] ??
    (config.serverEnvFlag ? process.env[config.serverEnvFlag] : undefined)

  return truthy(envValue)
}

export const getStateCookieName = (provider: OAuthProviderId, state: string) => {
  const prefix = PROVIDERS[provider]?.stateCookiePrefix ?? "oauth_state"
  return `${prefix}_${state}`
}

export const listEnabledProviders = () =>
  (Object.keys(PROVIDERS) as OAuthProviderId[]).filter((id) => isOAuthProviderEnabled(id))
