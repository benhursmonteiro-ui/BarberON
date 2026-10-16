import PortalGuard from '@/components/PortalGuard';

export default function BarberLayout({ children }: { children: React.ReactNode }) {
  return <PortalGuard allow="barber">{children}</PortalGuard>;
}
