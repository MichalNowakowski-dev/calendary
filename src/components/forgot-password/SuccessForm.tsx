import { ArrowLeft, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { CardDescription } from "../ui/card";
import { CardContent } from "../ui/card";
import { Button } from "../ui/button";
import Link from "next/link";

const SuccessForm = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <Card className="shadow-2xl border-green-800">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Link wysłany!
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sprawdź swoją skrzynkę email. Wysłaliśmy link do resetowania
              hasła.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>
                Jeśli nie widzisz wiadomości, sprawdź folder spam lub spróbuj
                ponownie.
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <Button variant="outline" className="w-full">
                Wyślij ponownie
              </Button>
              <Link href="/login">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Wróć do logowania
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuccessForm;
