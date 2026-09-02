import { redirect } from "next/navigation";

export default function GestaoDashboardRedirect() {
  redirect("/admin/dashboard");
}
