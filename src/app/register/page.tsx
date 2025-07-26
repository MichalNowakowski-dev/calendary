"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, User } from "lucide-react";
import CompanyOwnerRegistration from "@/components/registration/CompanyOwnerRegistration";
import CustomerRegistration from "@/components/registration/CustomerRegistration";

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<"company" | "customer">(
    "company"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Dołącz do{" "}
            <span className="text-blue-600 dark:text-blue-400">
              Calendary.pl
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Wybierz typ konta i rozpocznij swoją przygodę z systemem rezerwacji
          </p>
        </div>

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
                setSelectedRole(value as "company" | "customer")
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger
                  value="company"
                  className="flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  Właściciel firmy
                  <Badge variant="secondary" className="ml-1">
                    Popularne
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="customer"
                  className="flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Klient
                </TabsTrigger>
              </TabsList>

              <TabsContent value="company" className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Konto właściciela firmy
                  </h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Zarządzaj swoją firmą i usługami</li>
                    <li>• Dodawaj pracowników i harmonogramy</li>
                    <li>• Przeglądaj rezerwacje i statystyki</li>
                    <li>
                      • Własna strona firmy (np. calendary.pl/twoja-firma)
                    </li>
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

        <div className="text-center mt-8">
          <p className="text-gray-600 dark:text-gray-300">
            Masz już konto?{" "}
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Zaloguj się
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
