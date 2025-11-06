export default function medusaError(error: any): never {
  if (error.response) {
    const message = error.response.data?.message || error.response.data || "Unknown error"
    throw new Error(message)
  }

  if (error.request) {
    throw new Error("No response received from Medusa backend")
  }

  throw new Error(error.message ?? "Medusa request failed")
}
