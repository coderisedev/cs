import { Metadata } from "next"
import { listCollections } from "@lib/data/collections"
import CollectionsListTemplate from "@modules/collections/templates/collections-list"

export const metadata: Metadata = {
  title: "Collections | Cockpit Simulator",
  description: "Browse our curated collections of professional flight simulation hardware",
}

export default async function CollectionsPage() {
  const { collections } = await listCollections()

  return <CollectionsListTemplate collections={collections} />
}
