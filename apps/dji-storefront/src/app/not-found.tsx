import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <span className="text-8xl font-bold text-primary-500">404</span>
        </div>

        <h1 className="text-2xl font-semibold text-foreground-primary mb-3">
          Page not found
        </h1>

        <p className="text-foreground-secondary mb-6">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
          The page may have been moved, deleted, or never existed.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
          >
            Go to homepage
          </Link>

          <Link
            href="/us/store"
            className="inline-flex items-center justify-center px-6 py-3 border border-border-primary text-foreground-primary font-medium rounded-lg hover:bg-background-secondary transition-colors"
          >
            Browse products
          </Link>
        </div>

        <div className="mt-8">
          <p className="text-sm text-foreground-muted">
            Need help?{" "}
            <a
              href="mailto:support@cockpit-simulator.com"
              className="text-primary-500 hover:underline"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
