import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OnboardingPage() {
  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle>Create your store</CardTitle>
          <CardDescription>Let&apos;s set up your AI commerce empire</CardDescription>
        </CardHeader>
        <CardContent>
          {/* TODO: CreateTenantForm component */}
          <p className="text-sm text-muted-foreground text-center">Onboarding form placeholder</p>
        </CardContent>
      </Card>
    </div>
  );
}
