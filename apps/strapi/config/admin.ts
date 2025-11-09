export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
    cookie: {
      secure: env.bool('ADMIN_COOKIE_SECURE', env('NODE_ENV') === 'production'),
    },
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY'),
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
});
