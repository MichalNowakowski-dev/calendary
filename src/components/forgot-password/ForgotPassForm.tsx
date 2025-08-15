"use client";

import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useActionState } from "react";
import { forgotPassword } from "@/lib/actions/auth";

const initialState = {
  message: "",
  errors: {
    email: "",
  },
};

export default function ForgotPassForm({ isSuccess }: { isSuccess: boolean }) {
  const [state, formAction, isPending] = useActionState(
    forgotPassword,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          name="email"
          className={state.errors.email ? "border-destructive" : ""}
          placeholder="twoj@email.pl"
        />
      </div>

      {state.message && !isSuccess && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {state.message}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Wysyłanie...
          </>
        ) : (
          "Wyślij link resetowania"
        )}
      </Button>
    </form>
  );
}
