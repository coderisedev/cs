"use client"

import { useRef, useState, KeyboardEvent, ClipboardEvent } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  className,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  const handleChange = (index: number, digit: string) => {
    // Only allow single digit
    if (!/^\d?$/.test(digit)) return

    const newValue = value.split("")
    // Pad array if needed
    while (newValue.length < length) {
      newValue.push("")
    }
    newValue[index] = digit
    onChange(newValue.join("").slice(0, length))

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus()
      } else if (value[index]) {
        // Clear current input
        handleChange(index, "")
      }
      e.preventDefault()
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    } else if (e.key === "Delete") {
      handleChange(index, "")
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)
    if (pastedData) {
      onChange(pastedData.padEnd(length, "").slice(0, length))
      // Focus the input after the pasted content
      const focusIndex = Math.min(pastedData.length, length - 1)
      inputRefs.current[focusIndex]?.focus()
    }
  }

  const handleFocus = (index: number) => {
    setFocusedIndex(index)
    // Select the input content
    inputRefs.current[index]?.select()
  }

  const handleBlur = () => {
    setFocusedIndex(null)
  }

  return (
    <div className={cn("flex gap-2 justify-center", className)}>
      {Array.from({ length }).map((_, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          onBlur={handleBlur}
          disabled={disabled}
          className={cn(
            "w-12 h-14 text-center text-2xl font-mono font-bold",
            "focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
            focusedIndex === index && "ring-2 ring-primary-500 border-primary-500"
          )}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  )
}
