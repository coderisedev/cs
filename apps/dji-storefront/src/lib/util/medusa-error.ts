type MedusaResponse = {
  data?: { message?: string } | string
}

type ErrorWithResponse = {
  response?: MedusaResponse
}

type ErrorWithRequest = {
  request?: unknown
}

type ErrorWithMessage = {
  message?: string
}

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null

const hasResponse = (error: unknown): error is ErrorWithResponse => isObject(error) && "response" in error

const hasRequest = (error: unknown): error is ErrorWithRequest => isObject(error) && "request" in error

const hasMessage = (error: unknown): error is ErrorWithMessage =>
  typeof error === "object" && error !== null && "message" in error

export default function medusaError(error: unknown): never {
  if (hasResponse(error) && error.response) {
    const payload = error.response
    const message = typeof payload.data === "string" ? payload.data : payload.data?.message
    throw new Error(message || "Unknown error")
  }

  if (hasRequest(error)) {
    throw new Error("No response received from Medusa backend")
  }

  if (hasMessage(error)) {
    throw new Error(error.message ?? "Medusa request failed")
  }

  throw new Error("Medusa request failed")
}
