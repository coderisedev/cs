import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function StoreAdminPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!tenant) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-semibold mb-4">{tenant.name}</h1>
      <p className="text-muted-foreground">
        Store control panel for <strong>{slug}.lumora.shop</strong>
      </p>
      {/* TODO: Store admin dashboard */}
    </div>
  );
}
