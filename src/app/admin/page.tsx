import { redirect } from "next/navigation";

// /admin redirects to the first section.
export default function AdminPage() {
  redirect("/admin/applications");
}
