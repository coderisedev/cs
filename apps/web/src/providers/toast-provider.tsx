"use client"

import { createContext, useCallback, useContext, useState } from "react"

import {
  Toast as ToastRoot,
  ToastClose,
  ToastDescription,
  ToastProvider as RadixToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui"

export type ToastVariant = "default" | "success" | "danger"

export type ToastPayload = {
  title?: string
  description?: string
  variant?: ToastVariant
}

type ToastMessage = ToastPayload & { id: string; open: boolean }

type ToastContextValue = {
  pushToast: (payload: ToastPayload) => void
}

const ToastContext = createContext<ToastContextValue>({
  pushToast: () => undefined,
})

const createToastId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export const useToast = () => useContext(ToastContext)

export function AppToastProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const pushToast = useCallback((payload: ToastPayload) => {
    setToasts((current) => [
      ...current,
      {
        id: createToastId(),
        open: true,
        ...payload,
      },
    ])
  }, [])

  return (
    <ToastContext.Provider value={{ pushToast }}>
      <RadixToastProvider swipeDirection="right">
        {children}
        {toasts.map((toast) => (
          <ToastRoot
            key={toast.id}
            variant={toast.variant}
            open={toast.open}
            onOpenChange={(open) => {
              setToasts((current) =>
                current.map((item) =>
                  item.id === toast.id ? { ...item, open } : item
                )
              )
              if (!open) {
                setTimeout(() => removeToast(toast.id), 200)
              }
            }}
          >
            <div className="flex flex-col gap-1 pr-6">
              {toast.title ? <ToastTitle>{toast.title}</ToastTitle> : null}
              {toast.description ? (
                <ToastDescription>{toast.description}</ToastDescription>
              ) : null}
            </div>
            <ToastClose />
          </ToastRoot>
        ))}
        <ToastViewport />
      </RadixToastProvider>
    </ToastContext.Provider>
  )
}
