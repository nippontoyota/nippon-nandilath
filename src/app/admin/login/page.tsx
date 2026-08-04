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
      <div className="bg-[var(--gmart-navy)] text-[var(--gmart-cream)] text-center text-[11px] sm:text-xs tracking-wide py-2 px-4">
        {CAMPAIGN_NAME} · Admin portal
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-[380px] space-y-7">
          <div className="text-center space-y-3">
            <img
              src="https://dealer.toyotabharat.com/dealerV11/images/common/favicon.ico"
              alt=""
              className="w-10 h-10 mx-auto"
            />
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[var(--gmart-red)] mb-1.5">
                Nippon Toyota
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--gmart-title)]">
                Admin sign in
              </h1>
              <p className="text-sm text-[var(--gmart-muted)] mt-1.5">
                Manage lucky draw entries and winners
              </p>
            </div>
          </div>

          <div className="admin-product-card p-6">
            <form action={formAction} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-[var(--gmart-title)]">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="h-10 text-sm rounded-md border-[var(--gmart-border)] focus-visible:border-[var(--gmart-red)] focus-visible:ring-[var(--gmart-red)]/20"
                  placeholder="admin@nippontoyota.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-[var(--gmart-title)]">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    className="h-10 text-sm pr-10 rounded-md border-[var(--gmart-border)] focus-visible:border-[var(--gmart-red)] focus-visible:ring-[var(--gmart-red)]/20"
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
                className="admin-btn-primary w-full h-10 mt-1 rounded-md text-sm font-semibold disabled:opacity-70"
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
