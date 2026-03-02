"use client"

import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconBook,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/dashboard/nav-documents"
import { NavMain } from "@/components/dashboard/nav-main"
import { NavSecondary } from "@/components/dashboard/nav-secondary"
import { NavUser } from "@/components/dashboard/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Logo } from "../logo"
import Link from "next/link"
import Image from "next/image"
import { useSidebar } from "@/components/ui/sidebar"
import { Spinner } from "../ui/loadingSpinner"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#dashboard",
      icon: IconDashboard,
    },
     {
      title: "Members",
      url: "#",
      icon: IconUsers,
    },
    {
      title: "Posts",
      url: "#posts",
      icon: IconListDetails,
    },
    {
      title: "Analytics",
      url: "#analytics",
      icon: IconChartBar,
    },
    {
      title: "Projects",
      url: "#",
      icon: IconFolder,
    },
   
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Devotions",
      url: "#",
      icon: IconBook,
    },
    {
      name: "Reports",
      url: "#reports",
      icon: IconReport,
    },
    {
      name: "Ministry",
      url: "#",
      icon: IconFileWord,
    },
  ],
}

type AppSidebarProps =
  React.ComponentProps<typeof Sidebar> & {
    isLoading: boolean;
  };

export function AppSidebar({ isLoading, ...props }: AppSidebarProps) {
  
  const { state, open, setOpen, toggleSidebar } = useSidebar()
  return (
    <Sidebar collapsible="icon" {...props} >
      <SidebarHeader>
      
        <SidebarMenu>
          <SidebarMenuItem>
            
            {/* Logo button of the left side nav */}
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/">
                <div><Image src="/images/logonotitle.png" alt="San Isidro Logo" width={50} height={50} /></div>
               {state === "expanded" &&  <span className="text-base font-semibold"> JCSGO: SAN ISIDRO</span>}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        
       {isLoading ? <span className="text-center flex flex-row justify-center"><Spinner  size={16} /> </span> : <> <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
                </>}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
        
      </SidebarContent>
      <SidebarFooter>
      
      </SidebarFooter>
    </Sidebar>
  )
}
