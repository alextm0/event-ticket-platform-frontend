import { requireRole } from "@/lib/auth-guards";
import QRScannerClient from "@/components/staff/QRScannerClient";

export default async function QRScanner() {
  await requireRole("staff", { allowGrant: false });

  return (
    <div style={{ maxWidth: "500px", margin: "auto", padding: "20px" }}>
      <h1>QR Scanner (Staff)</h1>
      <QRScannerClient />
    </div>
  );
}