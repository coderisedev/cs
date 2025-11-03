"use client"

interface CheckoutProgressProps {
  currentStep: number
  steps?: string[]
}

export default function DjiCheckoutProgress({
  currentStep,
  steps = ["Shipping", "Payment", "Review"],
}: CheckoutProgressProps) {
  return (
    <div className="mb-8">
      {/* Progress Circles */}
      <div className="flex items-center justify-center space-x-4 mb-4">
        {steps.map((_, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                currentStep >= index + 1
                  ? "bg-primary-500 text-white"
                  : "bg-background-elevated text-foreground-muted"
              }`}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-1 mx-2 transition-all duration-300 ${
                  currentStep > index + 1 ? "bg-primary-500" : "bg-background-elevated"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="flex justify-center space-x-16 text-sm">
        {steps.map((step, index) => (
          <span
            key={index}
            className={`transition-colors duration-300 ${
              currentStep >= index + 1
                ? "text-primary-400 font-medium"
                : "text-foreground-muted"
            }`}
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  )
}
