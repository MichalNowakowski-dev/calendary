import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import SuccessForm from "@/components/forgot-password/SuccessForm";
import ForgotPassForm from "@/components/forgot-password/ForgotPassForm";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ success: string }>;
}) {
  const success = (await searchParams).success;

  if (success) {
    return <SuccessForm />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground">
              Zapomniałeś hasła?
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Wprowadź swój adres email, a wyślemy Ci link do resetowania hasła.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ForgotPassForm isSuccess={success === "true"} />

            <div className="mt-6">
              <Separator />
              <div className="text-center mt-6">
                <Link
                  href="/login"
                  className="text-primary hover:underline text-sm flex items-center justify-center"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Wróć do logowania
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
