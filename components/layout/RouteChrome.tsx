"use client";

import { usePathname } from "next/navigation";

export default function RouteChrome({
  navbar,
  footer,
  children,
}: {
  navbar: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const isAdmin = usePathname().startsWith("/yonetim");
  if (isAdmin) return children;
  return <>{navbar}<main className="min-h-screen pt-15">{children}</main>{footer}</>;
}
