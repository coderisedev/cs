import { Metadata } from "next"
import { LoginClient } from "@/components/auth/login-client"

export const metadata: Metadata = {
  title: "Sign In · DJI Storefront",
  description: "Sign in to your DJI Storefront account",
}

export default function LoginPage() {
  return <LoginClient />
}
