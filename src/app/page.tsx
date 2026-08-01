import { redirect } from "next/navigation";

export default function Home() {
  // Public entry form is at /enter (one universal QR — see src/lib/entry-config.ts).
  // The root path should redirect to the admin login.
  redirect("/admin/login");
}
