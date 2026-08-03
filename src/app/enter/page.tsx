import { EntryForm } from "@/components/forms/EntryForm";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export default async function EnterPage() {
  return (
    <div className="bg-white min-h-screen">
      <EntryForm />
    </div>
  );
}
