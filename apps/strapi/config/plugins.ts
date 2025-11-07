export default ({ env }) => ({
  upload: {
    config: {
      provider: "@strapi/provider-upload-aws-s3",
      providerOptions: {
        baseUrl: env(
          "AWS_PUBLIC_URL",
          env("AWS_ENDPOINT") && env("AWS_BUCKET_NAME")
            ? `${env("AWS_ENDPOINT")!.replace(/\/$/, "")}/${env("AWS_BUCKET_NAME")}`
            : undefined
        ),
        rootPath: env("AWS_S3_PATH_PREFIX", ""),
        s3Options: {
          credentials: {
            accessKeyId: env("AWS_ACCESS_KEY_ID"),
            secretAccessKey: env("AWS_ACCESS_SECRET"),
          },
          endpoint: env("AWS_ENDPOINT"),
          region: env("AWS_REGION", "auto"),
          forcePathStyle: env.bool("AWS_FORCE_PATH_STYLE", true),
          signatureVersion: "v4",
          params: {
            Bucket: env("AWS_BUCKET_NAME"),
            ACL: env("AWS_ACL", "public-read"),
          },
        },
      },
    },
  },
})
