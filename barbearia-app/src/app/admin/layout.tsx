import PortalGuard from '@/components/PortalGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <PortalGuard allow="admin">{children}</PortalGuard>;
}
