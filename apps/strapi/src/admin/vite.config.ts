import { mergeConfig, type UserConfig } from "vite"

const allowedHosts = [
  "api.aidenlux.com",
  "dev-api.aidenlux.com",
  "localhost",
  "127.0.0.1",
  "::1",
]

export default (config: UserConfig) => {
  return mergeConfig(config, {
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    server: {
      allowedHosts,
    },
    preview: {
      allowedHosts,
    },
  })
}
