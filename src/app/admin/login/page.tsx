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
    <div className="min-h-dvh flex flex-col items-center justify-center py-12 px-4 bg-gray-50 font-sans">
      <div className="w-full max-w-[360px] space-y-8">
        <div className="text-center space-y-3">
          <img
            src="https://dealer.toyotabharat.com/dealerV11/images/common/favicon.ico"
            alt=""
            className="w-9 h-9 mx-auto"
          />
          <div>
            <p className="text-xs font-medium tracking-wide text-gray-500 mb-1">Nippon Toyota</p>
            <h1 className="text-xl font-semibold tracking-tight text-gray-900">Admin sign in</h1>
            <p className="text-sm text-gray-600 mt-1">{CAMPAIGN_NAME} management</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="h-10 text-sm"
                placeholder="admin@nippontoyota.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  className="h-10 text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {state?.error && (
              <div
                className="text-sm text-red-700 font-medium bg-red-50 p-3 rounded-lg border border-red-200"
                role="alert"
              >
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-10 mt-1 rounded-lg text-white text-sm font-semibold bg-gray-900 hover:bg-gray-800 transition-colors disabled:opacity-70"
            >
              {isPending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
