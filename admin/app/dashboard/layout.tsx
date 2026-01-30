import { ProtectedLayout } from '@/components/layout/protected-layout';
import { Toaster } from '@/components/ui/sonner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayout>
      {children}
      <Toaster />
    </ProtectedLayout>
  );
}
