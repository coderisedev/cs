import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Width of the skeleton. Can be a Tailwind class or CSS value */
  width?: string
  /** Height of the skeleton. Can be a Tailwind class or CSS value */
  height?: string
  /** Whether to use a circular shape */
  circle?: boolean
}

/**
 * Skeleton loading placeholder component for perceived performance optimization.
 * Use this to show loading states while content is being fetched.
 *
 * @example
 * // Basic usage
 * <Skeleton className="h-4 w-[200px]" />
 *
 * @example
 * // Avatar placeholder
 * <Skeleton circle className="h-12 w-12" />
 *
 * @example
 * // Card placeholder
 * <div className="space-y-3">
 *   <Skeleton className="h-[200px] w-full" />
 *   <Skeleton className="h-4 w-3/4" />
 *   <Skeleton className="h-4 w-1/2" />
 * </div>
 */
function Skeleton({
  className,
  width,
  height,
  circle = false,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-background-elevated",
        circle ? "rounded-full" : "rounded-md",
        className
      )}
      style={{
        width: width,
        height: height,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  )
}

/**
 * Skeleton text line - simulates a line of text
 */
function SkeletonText({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton
      className={cn("h-4 w-full", className)}
      {...props}
    />
  )
}

/**
 * Skeleton card - simulates a product or content card
 */
function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      <Skeleton className="h-[200px] xs:h-[250px] w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-10 w-full mt-4" />
    </div>
  )
}

/**
 * Skeleton avatar - circular placeholder for profile images
 */
function SkeletonAvatar({ className, size = "md", ...props }: React.HTMLAttributes<HTMLDivElement> & {
  size?: "sm" | "md" | "lg"
}) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  }

  return (
    <Skeleton
      circle
      className={cn(sizeClasses[size], className)}
      {...props}
    />
  )
}

/**
 * Skeleton button - placeholder for button elements
 */
function SkeletonButton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton
      className={cn("h-10 xs:h-11 w-full rounded-pill min-h-[44px]", className)}
      {...props}
    />
  )
}

/**
 * Skeleton product grid - shows a grid of product card placeholders
 */
function SkeletonProductGrid({
  count = 4,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { count?: number }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 xs:gap-6",
        className
      )}
      {...props}
    >
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  )
}

export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonProductGrid,
}
