"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Building2 } from "lucide-react";
import { User } from "lucide-react";
import CompanyOwnerRegistration from "./CompanyOwnerRegistration";
import CustomerRegistration from "./CustomerRegistration";
import { useSearchParams, useRouter } from "next/navigation";

const RegisterFormSelection = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedRole = searchParams.get("role") as "company_owner" | "customer";

  const setSelectedRole = (value: "company_owner" | "customer") => {
    const params = new URLSearchParams(searchParams);
    params.set("role", value);
    router.replace(`/register?${params.toString()}`);
  };

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Rejestracja</CardTitle>
        <CardDescription className="text-center">
          Wybierz odpowiedni typ konta dla swoich potrzeb
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={selectedRole}
          onValueChange={(value) =>
            setSelectedRole(value as "company_owner" | "customer")
          }
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger
              value="company_owner"
              className={`${selectedRole === "company_owner" ? "bg-blue-700!" : "bg-background"} flex items-center gap-2`}
            >
              <Building2 className="w-4 h-4" />
              Właściciel firmy
            </TabsTrigger>
            <TabsTrigger
              value="customer"
              className={`${selectedRole === "customer" ? "bg-green-700!" : "bg-background"} flex items-center gap-2`}
            >
              <User className="w-4 h-4" />
              Klient
            </TabsTrigger>
          </TabsList>

          <TabsContent value="company_owner" className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Konto właściciela firmy
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Zarządzaj swoją firmą i usługami</li>
                <li>• Dodawaj pracowników i harmonogramy</li>
                <li>• Przeglądaj rezerwacje i statystyki</li>
                <li>• Własna strona firmy (np. calendary.pl/twoja-firma)</li>
              </ul>
            </div>
            <CompanyOwnerRegistration />
          </TabsContent>

          <TabsContent value="customer" className="space-y-4">
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                Konto klienta
              </h3>
              <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                <li>• Rezerwuj usługi w różnych firmach</li>
                <li>• Zarządzaj swoimi wizytami</li>
                <li>• Otrzymuj przypomnienia</li>
                <li>• Historia rezerwacji</li>
              </ul>
            </div>
            <CustomerRegistration />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RegisterFormSelection;
