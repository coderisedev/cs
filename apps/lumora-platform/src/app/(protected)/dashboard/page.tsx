import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: memberships } = await supabase
    .from("tenant_members")
    .select("role, tenant:tenants(id, name, slug, plan, status, created_at)")
    .eq("user_id", user!.id);

  const stores = memberships ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Your Stores</h1>
        <Button asChild>
          <Link href="/onboarding">Create Store</Link>
        </Button>
      </div>

      {stores.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">You don&apos;t have any stores yet.</p>
            <Button asChild>
              <Link href="/onboarding">Create your first store</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((membership: any) => (
            <Link key={membership.tenant.id} href={`/store/${membership.tenant.slug}`}>
              <Card className="hover:border-foreground/20 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">{membership.tenant.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {membership.tenant.slug}.lumora.shop
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs">
                      {membership.tenant.plan}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs">
                      {membership.role}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
