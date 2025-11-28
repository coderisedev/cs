export default ({ env }) => {
  const assetHosts = [
    env('STRAPI_UPLOAD_CDN_HOST'),
    env('STRAPI_AWS_PUBLIC_URL'),
    env('AWS_PUBLIC_URL'),
  ].filter((value): value is string => typeof value === 'string' && value.length > 0)

  const withAssets = (directives: string[]) => {
    const hosts = Array.from(new Set(assetHosts))
    return hosts.length ? [...directives, ...hosts] : directives
  }

  return [
    'strapi::logger',
    'strapi::errors',
    {
      name: 'strapi::security',
      config: {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            'img-src': withAssets(["'self'", 'data:', 'blob:']),
            'media-src': withAssets(["'self'", 'data:', 'blob:']),
          },
        },
      },
    },
    'strapi::cors',
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    {
      name: 'strapi::favicon',
      config: {
        // Serve the shared favicon from the Strapi public folder
        path: 'public/favicon.ico',
      },
    },
    'strapi::public',
  ]
}
