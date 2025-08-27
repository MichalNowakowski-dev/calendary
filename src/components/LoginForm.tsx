"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { loginAction } from "@/lib/actions/auth";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(loginAction, {
    message: "",
    errors: {},
    redirectTo: undefined,
  });

  // Handle redirect after successful login
  useEffect(() => {
    if (state.redirectTo && !state.message) {
      router.push(state.redirectTo);
    }
  }, [state.redirectTo, state.message, router]);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form action={formAction} className="space-y-6">
      {redirectTo && (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      )}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            className={
              (state.errors as any)?.email || state.message
                ? "border-destructive"
                : ""
            }
            placeholder="twoj@email.pl"
          />
          {(state.errors as any)?.email && (
            <p className="text-sm text-destructive mt-1">
              {(state.errors as any).email[0]}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Hasło</Label>
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Zapomniałeś hasła?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              className={
                (state.errors as any)?.password || state.message
                  ? "border-destructive"
                  : ""
              }
              placeholder="Wprowadź hasło"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={handleTogglePassword}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {(state.errors as any)?.password && (
            <p className="text-sm text-destructive mt-1">
              {(state.errors as any).password[0]}
            </p>
          )}
          {state.message && (
            <p className="text-sm text-destructive mt-1">{state.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Logowanie...
          </>
        ) : (
          "Zaloguj się"
        )}
      </Button>
    </form>
  );
};

export default LoginForm;
