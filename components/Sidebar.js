'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Bot, Phone, Megaphone, Users, PhoneCall,
  BookOpen, Wrench, BarChart3, Puzzle, Settings, ChevronsLeft, ChevronsRight,
} from 'lucide-react';

const NAV_MAIN = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/agents', label: 'Agents', icon: Bot },
  { href: '/phone-numbers', label: 'Phone Numbers', icon: Phone },
  { href: '/outbound', label: 'Outbound', icon: Megaphone },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/calls', label: 'Calls', icon: PhoneCall },
  { href: '/knowledge', label: 'Knowledge', icon: BookOpen },
  { href: '/tools', label: 'Tools', icon: Wrench },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

const NAV_SYSTEM = [
  { href: '/integrations', label: 'Integrations', icon: Puzzle },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`hidden md:flex h-screen flex-col border-r border-border bg-sidebar transition-all ${collapsed ? 'w-[68px]' : 'w-[240px]'}`}>
      <div className="flex items-center justify-between px-4 py-5">
        {!collapsed && <span className="gradient-text font-mono text-sm font-bold tracking-wide">AUREN</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="text-muted hover:text-white">
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>

      {!collapsed && (
        <div className="mx-3 mb-4 rounded-md border border-border bg-panel px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide text-muted">Workspace</p>
          <p className="mt-0.5 truncate text-sm font-medium text-white">Auren</p>
        </div>
      )}

      <nav className="flex-1 space-y-0.5 px-2">
        {NAV_MAIN.map((item) => <NavItem key={item.href} item={item} active={pathname === item.href} collapsed={collapsed} />)}
      </nav>

      <div className="space-y-0.5 border-t border-border px-2 py-2">
        {NAV_SYSTEM.map((item) => <NavItem key={item.href} item={item} active={pathname === item.href} collapsed={collapsed} />)}
      </div>

      <div className="border-t border-border p-3">
        {!collapsed && <p className="px-2 text-xs text-muted">Auren AI · v0.1</p>}
      </div>
    </aside>
  );
}

function NavItem({ item, active, collapsed }) {
  const Icon = item.icon;
  return (
    <Link href={item.href}
      className={`relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${active ? 'bg-panel text-white' : 'text-muted hover:bg-panel hover:text-white'}`}>
      {active && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full gradient-btn" />}
      <Icon size={16} className={active ? 'text-accent' : ''} />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}
