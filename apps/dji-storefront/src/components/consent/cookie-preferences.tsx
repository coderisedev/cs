"use client"

import * as Dialog from "@radix-ui/react-dialog"
import * as Switch from "@radix-ui/react-switch"
import { X, Shield, BarChart3, Megaphone } from "lucide-react"
import { useConsent } from "@/lib/context/consent-context"
import { Button } from "@/components/ui/button"
import { COOKIE_CATEGORIES, type ConsentPreferences } from "@/lib/consent/types"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

const CATEGORY_ICONS: Record<keyof ConsentPreferences, React.ComponentType<{ className?: string }>> = {
  essential: Shield,
  analytics: BarChart3,
  marketing: Megaphone,
}

/**
 * Cookie preferences modal
 * Allows users to customize their cookie consent by category
 */
export function CookiePreferences() {
  const {
    showPreferences,
    closePreferences,
    state,
    updatePreferences,
    acceptAll,
    rejectAll,
  } = useConsent()

  // Local state for pending changes
  const [localPreferences, setLocalPreferences] = useState<ConsentPreferences>(
    state.preferences
  )

  // Sync local state when modal opens or state changes
  useEffect(() => {
    if (showPreferences) {
      setLocalPreferences(state.preferences)
    }
  }, [showPreferences, state.preferences])

  const handleToggle = (id: keyof ConsentPreferences, checked: boolean) => {
    setLocalPreferences((prev) => ({
      ...prev,
      [id]: checked,
    }))
  }

  const handleSave = () => {
    updatePreferences(localPreferences)
    closePreferences()
  }

  const handleAcceptAll = () => {
    acceptAll()
    closePreferences()
  }

  const handleRejectAll = () => {
    rejectAll()
    closePreferences()
  }

  return (
    <Dialog.Root open={showPreferences} onOpenChange={(open) => !open && closePreferences()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%]",
            "bg-background-primary border border-border-primary rounded-lg shadow-xl",
            "max-h-[90vh] overflow-y-auto",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            "duration-200"
          )}
          aria-describedby="cookie-preferences-description"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-primary px-6 py-4">
            <Dialog.Title className="text-lg font-semibold text-foreground-primary">
              Cookie Preferences
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-full p-1.5 text-foreground-muted hover:bg-background-elevated hover:text-foreground-primary transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <p
              id="cookie-preferences-description"
              className="text-sm text-foreground-secondary mb-6"
            >
              Manage your cookie preferences below. Essential cookies are required
              for the website to function properly and cannot be disabled.
            </p>

            {/* Cookie categories */}
            <div className="space-y-4">
              {COOKIE_CATEGORIES.map((category) => {
                const Icon = CATEGORY_ICONS[category.id]
                const isEnabled = localPreferences[category.id]

                return (
                  <div
                    key={category.id}
                    className="rounded-lg border border-border-primary p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
                            isEnabled
                              ? "bg-primary-500/10 text-primary-500"
                              : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-foreground-primary">
                              {category.name}
                            </h3>
                            {category.required && (
                              <span className="text-xs text-foreground-muted bg-background-elevated px-2 py-0.5 rounded">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-foreground-secondary mt-1">
                            {category.description}
                          </p>
                          {category.cookies.length > 0 && (
                            <p className="text-xs text-foreground-muted mt-2">
                              Cookies: {category.cookies.join(", ")}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Toggle switch */}
                      <Switch.Root
                        checked={isEnabled}
                        onCheckedChange={(checked) =>
                          handleToggle(category.id, checked)
                        }
                        disabled={category.required}
                        className={cn(
                          "relative h-6 w-11 cursor-pointer rounded-full transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary",
                          "disabled:cursor-not-allowed disabled:opacity-50",
                          isEnabled ? "bg-primary-500" : "bg-neutral-300 dark:bg-neutral-600"
                        )}
                        aria-label={`Toggle ${category.name} cookies`}
                      >
                        <Switch.Thumb
                          className={cn(
                            "block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                            isEnabled ? "translate-x-[22px]" : "translate-x-0.5"
                          )}
                        />
                      </Switch.Root>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse xs:flex-row items-center justify-between gap-3 border-t border-border-primary px-6 py-4">
            <div className="flex gap-2 w-full xs:w-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRejectAll}
                className="flex-1 xs:flex-none"
              >
                Reject All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAcceptAll}
                className="flex-1 xs:flex-none"
              >
                Accept All
              </Button>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              className="w-full xs:w-auto"
            >
              Save Preferences
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
