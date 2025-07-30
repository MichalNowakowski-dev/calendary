"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { updateUserPassword } from "@/lib/actions/users";
import { showToast } from "@/lib/toast";

const passwordSchema = z
  .object({
    newPassword: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Hasła nie są takie same",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ChangePasswordPage() {
  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: PasswordFormData) => {
    try {
      const result = await updateUserPassword(data.newPassword);
      if (result.success) {
        showToast.success("Hasło zostało zmienione");
        form.reset();
      } else {
        showToast.error(result.error || "Wystąpił błąd podczas zmiany hasła");
      }
    } catch (error) {
      console.error(error);
      showToast.error("Wystąpił nieoczekiwany błąd");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle>Zmień hasło</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nowe hasło</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Potwierdź nowe hasło</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Zapisywanie..." : "Zapisz nowe hasło"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
