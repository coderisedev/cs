import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-8">Account Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-sm">{user?.email}</p>
          </div>
          {/* TODO: Profile update form */}
          <p className="text-sm text-muted-foreground">Settings form placeholder</p>
        </CardContent>
      </Card>
    </div>
  );
}
