export type ClassValue =
  | string
  | number
  | null
  | undefined
  | boolean
  | ClassValue[]
  | { [key: string]: boolean | string | number | null | undefined }

function appendClass(acc: string[], value: ClassValue) {
  if (!value) {
    return
  }

  if (typeof value === "string" || typeof value === "number") {
    acc.push(String(value))
    return
  }

  if (Array.isArray(value)) {
    value.forEach((entry) => appendClass(acc, entry))
    return
  }

  if (typeof value === "object") {
    Object.entries(value).forEach(([key, condition]) => {
      if (condition) {
        acc.push(key)
      }
    })
  }
}

export function cn(...classes: ClassValue[]) {
  const tokens: string[] = []
  classes.forEach((value) => appendClass(tokens, value))
  return tokens.join(" ")
}
