import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react'
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HeaderLinkProps = {
  item: {
    href: string;
    label: string;
  };
  active?: boolean;
};

function HeaderLink({ item }: HeaderLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  return (
    <Button
      asChild
      variant={isActive ? "secondary" : "ghost"}
      className={cn(
        "h-9 px-4 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 hover:text-[var(--color-primary)]"
          : "text-slate-300 hover:bg-[var(--color-surface)] hover:text-white"
      )}
    >
      <Link href={item.href}>
        {item.label}
      </Link>
    </Button>
  );
}

export default HeaderLink
