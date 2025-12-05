export default ({ env }) => {
  // Validate S3/R2 credentials in production
  const isProduction = env("NODE_ENV") === "production"
  const accessKeyId = env("AWS_ACCESS_KEY_ID")
  const secretAccessKey = env("AWS_ACCESS_SECRET")
  const bucketName = env("AWS_BUCKET_NAME")

  if (isProduction) {
    const missingVars: string[] = []
    if (!accessKeyId) missingVars.push("AWS_ACCESS_KEY_ID")
    if (!secretAccessKey) missingVars.push("AWS_ACCESS_SECRET")
    if (!bucketName) missingVars.push("AWS_BUCKET_NAME")

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required S3/R2 upload configuration: ${missingVars.join(", ")}. ` +
        `These environment variables must be set in production.`
      )
    }
  }

  return {
    upload: {
      config: {
        provider: "@strapi/provider-upload-aws-s3",
        providerOptions: {
          baseUrl: env(
            "AWS_PUBLIC_URL",
            env("AWS_ENDPOINT") && bucketName
              ? `${env("AWS_ENDPOINT")!.replace(/\/$/, "")}/${bucketName}`
              : undefined
          ),
          rootPath: env("AWS_S3_PATH_PREFIX", ""),
          s3Options: {
            credentials: {
              accessKeyId,
              secretAccessKey,
            },
            endpoint: env("AWS_ENDPOINT"),
            region: env("AWS_REGION", "auto"),
            forcePathStyle: env.bool("AWS_FORCE_PATH_STYLE", true),
            signatureVersion: "v4",
            params: {
              Bucket: bucketName,
            },
          },
        },
        // File size limit: 50MB
        sizeLimit: 50 * 1024 * 1024,
      },
    },
  }
}
