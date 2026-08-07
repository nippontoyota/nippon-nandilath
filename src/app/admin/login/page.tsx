"use client";

import { useActionState, useState } from "react";
import { login } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { CAMPAIGN_NAME } from "@/lib/brand";

export default function AdminLogin() {
  const [state, formAction, isPending] = useActionState(login, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="admin-shell min-h-dvh flex flex-col">
      <div className="h-1 w-full bg-[var(--gmart-red)]" />

      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-[440px] space-y-8">
          <div className="text-center space-y-4">
            <img
              src="https://dealer.toyotabharat.com/dealerV11/images/common/favicon.ico"
              alt=""
              className="w-12 h-12 mx-auto"
            />
            <div>
              <p className="text-sm font-semibold tracking-[0.14em] uppercase text-[var(--gmart-red)] mb-1.5">
                Nippon Toyota
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-[var(--gmart-title)]">
                Sign in
              </h1>
              <p className="text-base text-[var(--gmart-muted)] mt-1.5">
                Manage lucky draw entries and winners
              </p>
            </div>
          </div>

          <div className="admin-product-card p-8">
            <form action={formAction} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-lg font-medium text-[var(--gmart-title)]">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="h-12 text-lg md:text-lg px-4 rounded-md border-[var(--gmart-border)] focus-visible:border-[var(--gmart-red)] focus-visible:ring-[var(--gmart-red)]/20"
                  placeholder="admin@nippontoyota.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-lg font-medium text-[var(--gmart-title)]">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    className="h-12 text-lg md:text-lg px-4 pr-12 rounded-md border-[var(--gmart-border)] focus-visible:border-[var(--gmart-red)] focus-visible:ring-[var(--gmart-red)]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--gmart-muted)] hover:text-[var(--gmart-title)] p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gmart-red)]/20"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {state?.error && (
                <div
                  className="text-sm text-[var(--gmart-red)] font-medium bg-[#fff5f6] p-3 rounded-md border border-[#ffd0d5]"
                  role="alert"
                >
                  {state.error}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="admin-btn-primary w-full h-12 mt-2 rounded-md text-lg font-semibold disabled:opacity-70"
              >
                {isPending ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>

          <p className="text-center text-[11px] text-[var(--gmart-muted)]">
            Restricted access · Nippon Toyota staff only
          </p>
        </div>
      </div>
    </div>
  );
}
