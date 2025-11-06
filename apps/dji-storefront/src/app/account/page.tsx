import { AccountClient } from "@/components/account/account-client"
import { getAccountPageData } from "@/lib/data/account"

export const metadata = {
  title: "Account · DJI Storefront",
}

export default async function AccountPage() {
  const data = await getAccountPageData()
  return <AccountClient user={data.user} orders={data.orders} wishlist={data.wishlist} />
}
