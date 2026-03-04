"use client";

import { IconCirclePlusFilled, IconMail, type Icon, IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
    items?: { title: string; url: string }[];
  }[];
}) {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const { setActiveItem } = useSidebar();

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="dark:bg-yellow-500 cursor-pointer bg-blue-500 text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <IconCirclePlusFilled />
              <span>Quick Create</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Upper sidebar navigation */}
        <SidebarMenu>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          {items.map((item) => {
            const hasSubmenu = item.items && item.items.length > 0;
            const isOpen = openMenus[item.title] || false;

            return (
              <SidebarMenuItem key={item.title}>
                {hasSubmenu ? (
                  <>
                    <SidebarMenuButton
                      tooltip={item.title}
                      itemKey={item.title}
                      onClick={() => toggleMenu(item.title)}
                      className={cn(isOpen && "bg-sidebar-accent")}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <IconChevronRight
                        className={cn(
                          "ml-auto transition-transform",
                          isOpen && "rotate-90"
                        )}
                      />
                    </SidebarMenuButton>
                    {isOpen && (
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            {subItem.url.startsWith('#') ? (
                              <SidebarMenuSubButton
                                onClick={() => {
                                  if (subItem.title === 'Attendance Summary') {
                                    setActiveItem('Attendance');
                                  } else if (subItem.title === 'Check In') {
                                    setActiveItem('Attendance Check In');
                                  } else if (subItem.title === 'Analytics') {
                                    setActiveItem('Attendance Analytics');
                                  }
                                }}
                              >
                                <span>{subItem.title}</span>
                              </SidebarMenuSubButton>
                            ) : (
                              <SidebarMenuSubButton asChild>
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            )}
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </>
                ) : item.url.startsWith('#') ? (
                  <SidebarMenuButton tooltip={item.title} itemKey={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton tooltip={item.title} itemKey={item.title} asChild>
                    <Link href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
