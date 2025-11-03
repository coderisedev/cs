import { Metadata } from "next"
import SoftwareTemplate from "@/modules/software/templates/software-template"
import softwareData from "@/data/software-data.json"
import { SoftwareData } from "@/lib/software/types"

export const metadata: Metadata = {
  title: "Software - Medusa Storefront Bridge",
  description: "Professional e-commerce integration software for seamless connection between your storefront and backend services. Compatible with Medusa 2.x, Next.js 15, and major payment providers.",
}

export default function SoftwarePage() {
  return <SoftwareTemplate data={softwareData as SoftwareData} />
}
