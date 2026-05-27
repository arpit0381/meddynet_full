import { AdminShell } from "@/components/admin/AdminShell";
import { AdminProvider } from "@/contexts/AdminContext";
import { QueryProvider } from "@/lib/query-provider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AdminProvider>
        <AdminShell>{children}</AdminShell>
      </AdminProvider>
    </QueryProvider>
  );
}
