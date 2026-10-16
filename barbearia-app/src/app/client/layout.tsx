import PortalGuard from '@/components/PortalGuard';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <PortalGuard allow="client">{children}</PortalGuard>;
}
