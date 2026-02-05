'use client'

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive"
import { DataTable } from "@/components/dashboard/data-table"
import { SectionCards } from "@/components/dashboard/section-cards"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider, useSidebar } from "@/components/ui/sidebar"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import PostsSection from "@/components/dashboard/sections/posts"
import AnalyticsSection from "@/components/dashboard/sections/analytics"
import MembersSection from "@/components/dashboard/sections/members"


export default function Page() {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const fetchOnce = useRef(false) // ✅ track fetch status
  const router = useRouter();

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
      router.push('/login');
      setUser(null)
    } finally {
      if(!user)
      setIsLoading(false)
    }
  }

  fetchUser()
}, []) 

    const { activeItem } = useSidebar()

    console.log('dashboard:',activeItem)

  return (
    <>
      {/* Left Side of the Dashboard */}
      <AppSidebar isLoading={isLoading} variant="inset" />

      {/* Right Side of the Dashboard */}
      <SidebarInset>

          {/* contains title and user info */}
        <SiteHeader user={user} />

         {/* Entire Right section of the dashboard*/}
       {activeItem === 'Dashboard' && <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {isLoading && <p className="text-center text-gray-500">Loading user info...</p>}
              {error && <p className="text-center text-red-500">Error: {error}</p>}

             {user && <div> <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
             
              </div>
             }
            </div>
          </div>
        </div>
        }
        {activeItem === 'Posts' && <PostsSection />}
        {activeItem === 'Analytics' && <AnalyticsSection />}
        {activeItem === 'Members' && <MembersSection />}
      </SidebarInset>
    </>
  )
}
