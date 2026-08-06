"use server";

import { cookies } from "next/headers";
import { encrypt, decrypt } from "@/lib/session";

import { redirect } from "next/navigation";

export async function login(prevState: Record<string, unknown> | null, formData: FormData) {
  // Check environment variables securely without falling back
  if (!process.env.ADMIN_PASSWORD) {
    throw new Error("CRITICAL: ADMIN_PASSWORD environment variable is not set.");
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@nippontoyota.com";
  const CALL_CENTER_EMAIL = process.env.CALL_CENTER_EMAIL || "callcenter@nippontoyota.com";

  let role: string | null = null;
  let userIdentifier: string | null = null;

  if (email === ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    role = "admin";
    userIdentifier = "admin";
  } else if (
    process.env.CALL_CENTER_PASSWORD &&
    email === CALL_CENTER_EMAIL &&
    password === process.env.CALL_CENTER_PASSWORD
  ) {
    role = "call_center";
    userIdentifier = "call_center";
  }

  if (role && userIdentifier) {
    const session = await encrypt({ user: userIdentifier, role, timestamp: Date.now() });
    const cookieStore = await cookies();
    cookieStore.set("admin_session", session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: "lax",
    });
    redirect("/admin/dashboard");
  }

  return { error: "Invalid credentials" };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin/login");
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;
  if (!sessionToken) return false;

  const payload = await decrypt(sessionToken);
  return !!payload;
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;
  if (!sessionToken) return null;
  return await decrypt(sessionToken);
}
