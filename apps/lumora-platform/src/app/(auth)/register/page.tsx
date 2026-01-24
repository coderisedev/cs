import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Start building your AI commerce empire</CardDescription>
      </CardHeader>
      <CardContent>
        {/* TODO: RegisterForm component */}
        <p className="text-sm text-muted-foreground text-center">Register form placeholder</p>
      </CardContent>
    </Card>
  );
}
