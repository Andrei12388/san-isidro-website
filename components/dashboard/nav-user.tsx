'use client'

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconUserCircle,
  IconBell,
  IconLighter,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import ThemeToggleButton from "../toggleThemeButton"

interface UserType {
  name: string
  email: string
  avatar: string
}

export function NavUser({ item }: { item: UserType | null }) {
  const { isMobile } = useSidebar()
 const router = useRouter();
  const logout = async () => {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  router.push("/"); // or home
 if (window.location.pathname === "/") {
    window.location.reload();
}

};

const dashboard = async () => {
  router.push("/dashboard"); 
};

  // Show placeholder while user data is null
  const displayName = item?.name || "Loading..."
  const displayEmail = item?.email || "Loading..."
  const displayAvatar = item?.avatar || "/images/userIcon.png"

useEffect(() => {
  if (localStorage.getItem("theme") === "dark") {
    document.documentElement.classList.add("dark");
  }
}, []);


  return (
    <SidebarMenu >
      <SidebarMenuItem >
        <DropdownMenu >
          <DropdownMenuTrigger asChild className="bg-background ">
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={displayAvatar} alt={displayName} />
                <AvatarFallback className="rounded-lg">{displayName[0]}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="text-muted-foreground truncate text-xs">{displayEmail}</span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "bottom"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal"></DropdownMenuLabel>
             <DropdownMenuItem  onSelect={(e) => e.preventDefault()} >
              <ThemeToggleButton />
               NightMode🌙
              </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem  onClick={dashboard}>
                <IconUserCircle />
                Profile
              </DropdownMenuItem>
              
              <DropdownMenuItem  onClick={dashboard}>
                <IconUserCircle />
                Dashboard
              </DropdownMenuItem>
             
              <DropdownMenuItem>
                <IconBell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem>
              <Button onClick={logout}><IconLogout />Log Out</Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
