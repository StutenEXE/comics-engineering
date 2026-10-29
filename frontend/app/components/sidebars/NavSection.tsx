"use client";

import type { IconType } from "react-icons";
import { Link, useLocation } from "react-router";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/shadcn/ui/sidebar";

interface NavSection {
  label?: string;
  items?: {
    title: string;
    url: string;
    icon?: IconType;
    disabled?: boolean;
  }[];
}

export function NavSection({ label, items }: NavSection) {
  const { isMobile, setOpenMobile } = useSidebar();
  const { pathname } = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-1">
        {label && (
          <SidebarGroupLabel className="text-xs font-medium uppercase tracking-widest text-white/30">
            {label}
          </SidebarGroupLabel>
        )}
        <SidebarMenu>
          {items?.map((item) => {
            // Exact match : "/stash" must not stay active on its sub pages
            const isActive = pathname.replace(/\/$/, "") === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                  className="h-10 md:h-9 rounded-md transition-colors data-active:bg-stash-400/8 data-active:text-stash-200 data-active:hover:bg-stash-400/12 data-active:hover:text-stash-200"
                >
                  <Link
                    to={item.url}
                    aria-current={isActive ? "page" : undefined}
                    // Close the mobile drawer once a page is picked
                    onClick={() => isMobile && setOpenMobile(false)}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
