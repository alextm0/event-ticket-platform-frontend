import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react'

type HeaderLinkProps = {
  item: {
    href: string;
    label: string;
  };
  active?: boolean;
};

function HeaderLink({ item }: HeaderLinkProps) {
  const pathname = usePathname();  
  return (
    <Link
      href={item.href}
      className={`rounded px-3 py-1 transition ${ pathname === item.href ? "bg-sky-500 text-slate-900" : "text-slate-300 hover:bg-slate-800"}`}>
      {item.label}
    </Link>
  );
}

export default HeaderLink
