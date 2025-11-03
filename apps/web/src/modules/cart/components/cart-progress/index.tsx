"use client"

interface CartProgressProps {
  total: number
  threshold?: number
  currency?: string
}

export default function CartProgress({
  total,
  threshold = 299,
  currency = "$",
}: CartProgressProps) {
  const progressPercentage = Math.min((total / threshold) * 100, 100)
  const remaining = Math.max(threshold - total, 0)

  if (total >= threshold) {
    return (
      <div className="bg-background-elevated rounded-md p-4 mb-6">
        <div className="flex items-center space-x-2 text-semantic-success">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">You qualify for FREE shipping!</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background-secondary border border-border-primary rounded-md p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-foreground-primary font-medium">
          Add {currency}
          {remaining.toFixed(2)} more for free shipping
        </span>
        <span className="text-primary-400 font-bold text-sm">
          {Math.round(progressPercentage)}%
        </span>
      </div>
      <div className="w-full bg-background-elevated rounded-full h-2">
        <div
          className="bg-primary-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  )
}
