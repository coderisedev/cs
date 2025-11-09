export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  /**
   * When running behind Cloudflare Tunnel or any reverse proxy that terminates TLS,
   * Strapi must be told what the public URL is and to trust the proxy headers.
   * Otherwise, secure admin cookies cannot be sent (login will fail).
   */
  url: env('STRAPI_PUBLIC_URL', env('STRAPI_ADMIN_BACKEND_URL')),
  proxy: env.bool('STRAPI_ENABLE_PROXY', true),
  app: {
    keys: env.array('APP_KEYS'),
  },
});
