import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your Lumora account</CardDescription>
      </CardHeader>
      <CardContent>
        {/* TODO: LoginForm component */}
        <p className="text-sm text-muted-foreground text-center">Login form placeholder</p>
      </CardContent>
    </Card>
  );
}
