'use client'

import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import data from "./data.json"
import { useEffect, useRef, useState } from "react"

export default function Page() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const fetchOnce = useRef(false) // ✅ track fetch status

 useEffect(() => {
  if (fetchOnce.current) return // already fetched

  const fetchUser = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // 1️⃣ Fetch session (access_token + user ID)
      const sessionRes = await fetch("/api/auth/getSession")
      if (!sessionRes.ok)
        throw new Error(`Failed to fetch session: ${sessionRes.status}`)

      const userData = await sessionRes.json()
      console.log("Fetched session data:", userData)

      if (!userData.access_token || !userData.user) {
        throw new Error("Session does not contain access_token or user ID")
      }

      // 2️⃣ Fetch full user info from backend API
      const userUrl = `https://isidro-webapi.onrender.com/users/${userData.user}`
      console.log("Fetching user info from URL:", userUrl)

      const userInfoRes = await fetch(userUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userData.access_token}`,
        },
      })

      if (!userInfoRes.ok) {
        throw new Error(`Failed to fetch user info: ${userInfoRes.status}`)
      }

      const resUser = await userInfoRes.json()
      console.log("Fetched full user info:", resUser)

      setUser(resUser || null)
      fetchOnce.current = true // ✅ mark fetch as done

    } catch (err: any) {
      console.error("Error fetching user:", err)
      setError(err.message || "Unknown error")
      setUser(null)
    } finally {
      
      setIsLoading(false)
    }
  }

  fetchUser()
}, []) 


  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader user={user} />
        <div className="flex flex-1 flex-col border">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {isLoading && <p className="text-center text-gray-500">Loading user info...</p>}
              {error && <p className="text-center text-red-500">Error: {error}</p>}

              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
