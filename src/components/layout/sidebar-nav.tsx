"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Leaf, Camera, Map, BookOpen, User, Settings, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/dashboard/recommendations', icon: Leaf, label: 'Recommendations' },
  { href: '/dashboard/identify', icon: Camera, label: 'Identify' },
  { href: '/dashboard/map', icon: Map, label: 'Map' },
  { href: '/dashboard/vlogs', icon: BookOpen, label: 'Vlogs' },
  { href: '/dashboard/shop', icon: ShoppingBag, label: 'Shop' },
];

const accountItems = [
    { href: '/dashboard/profile', icon: User, label: 'Profile' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
           <Leaf className="h-8 w-8 text-primary" />
           <span className="text-xl font-bold font-headline">GreenGuardian</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
                  tooltip={{ children: item.label }}
                  asChild
                >
                  <div>
                    <item.icon />
                    <span>{item.label}</span>
                  </div>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarMenu>
             {accountItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <Link href={item.href}>
                        <SidebarMenuButton 
                        isActive={pathname.startsWith(item.href)}
                        tooltip={{ children: item.label }} asChild>
                        <div>
                            <item.icon />
                            <span>{item.label}</span>
                        </div>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
             ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
