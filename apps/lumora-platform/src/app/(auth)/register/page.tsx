import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Start building your AI commerce empire</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
    </Card>
  );
}
