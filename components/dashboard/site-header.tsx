import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import Link from "next/link"
import { NavUser } from "./nav-user"
import { IconBell, IconMail } from "@tabler/icons-react"

const data = {
  user: {
    name: "Robert Andrei Bardoquillo",
    email: "robertandreib.up@gmail.com",
    avatar: "/images/usericon.jpg",
  },
}

export function SiteHeader({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {

  const { activeItem } = useSidebar()

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{activeItem}</h1>
         
        <div className="ml-auto flex items-center gap-2">
          <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <IconMail />
              <span className="sr-only">Inbox</span>
            </Button>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <IconBell />
              <span className="sr-only">Notifications</span>
            </Button>
           <NavUser item={user} />
        </div>
      </div>
    </header>
  )
}
