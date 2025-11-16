import { requireRole } from "@/lib/auth-guards";

export default async function StaffScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("staff");
  return <>{children}</>;
}