'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu, X, LayoutDashboard, Bot, Phone, Megaphone, Users, PhoneCall,
  BookOpen, Wrench, BarChart3, Puzzle, Settings,
} from 'lucide-react';

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/agents', label: 'Agents', icon: Bot },
  { href: '/phone-numbers', label: 'Phone Numbers', icon: Phone },
  { href: '/outbound', label: 'Outbound', icon: Megaphone },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/calls', label: 'Calls', icon: PhoneCall },
  { href: '/knowledge', label: 'Knowledge', icon: BookOpen },
  { href: '/tools', label: 'Tools', icon: Wrench },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/integrations', label: 'Integrations', icon: Puzzle },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between border-b border-border bg-sidebar px-4 py-3">
        <span className="font-mono text-sm font-semibold text-white">AUREN</span>
        <button onClick={() => setOpen(true)} className="text-muted"><Menu size={20} /></button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-[260px] border-r border-border bg-sidebar p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-sm font-semibold text-white">AUREN</span>
              <button onClick={() => setOpen(false)} className="text-muted"><X size={20} /></button>
            </div>
            <nav className="space-y-0.5">
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${active ? 'bg-panel text-white' : 'text-muted'}`}>
                    <Icon size={16} /><span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
