"use client";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive";
import { SectionCards } from "@/components/dashboard/section-cards";
import { SiteHeader } from "@/components/dashboard/site-header";
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import PostsSection from "@/components/dashboard/sections/posts";
import AnalyticsSection from "@/components/dashboard/sections/analytics";
import MembersSection from "@/components/dashboard/sections/members";
import { Spinner } from "@/components/ui/loadingSpinner";
import DevotionsSection from "@/components/dashboard/sections/devotions";
import { useAuth } from "@/context/AuthContext";
import CalendarSection from "@/components/dashboard/sections/calendar";
import AttendanceSection from "@/components/dashboard/sections/attendance";
import CheckInSection from "@/components/dashboard/sections/check-in";
import AttendanceAnalyticsSection from "@/components/dashboard/sections/attendance-analytics";

export default function Page() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const fetchOnce = useRef(false); // ✅ track fetch status
  const router = useRouter();

  //for calling postgre api
  // useEffect(() => {
  // const id = startHealthPolling("/api/health");

  //    return () => clearInterval(id);
  // }, []);

  const { access_token } = useAuth();
  //Check if there's a logged in acc

  useEffect(() => {
    if (fetchOnce.current) return; // already fetched

    const fetchUser = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 1️⃣ Fetch session (access_token + user ID)
        const sessionRes = await fetch("/api/auth/getSession");
        if (!sessionRes.ok)
          throw new Error(`Failed to fetch session: ${sessionRes.status}`);

        const userData = await sessionRes.json();
        console.log("Fetched session data:", userData);

        if (!userData.access_token || !userData.user) {
          throw new Error("Session does not contain access_token or user ID");
        }

        setUser({
          id: userData.user, //
          name: userData.name,
          email: userData.email,
          avatar: userData.profileImage, // optional
        });
        fetchOnce.current = true; // ✅ mark fetch as done
      } catch (err: any) {
        console.error("Error fetching user:", err);
        setError(err.message || "Unknown error");
        router.push("/login");
        setUser(null);
        // safely navigate in effect
        setTimeout(() => router.push("/login"), 0);
      } finally {
        if (!user) setIsLoading(false);
      }
    };

    fetchUser();
    console.log(document.cookie);
  }, []);

  const { activeItem } = useSidebar();

  console.log("dashboard:", activeItem);

  return (
    <>
      {/* Left Side of the Dashboard */}
      <AppSidebar isLoading={isLoading} variant="inset" />
      {/* Right Side of the Dashboard */}
      <SidebarInset>
        {/* contains title and user info */}
        <SiteHeader user={user} />

        {/* Entire Right section of the dashboard*/}
        {activeItem === "Dashboard" && (
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {isLoading && (
                  <div className="flex flex-1 flex-row justify-center items-center text-center">
                    Loading Dashboard...
                    <Spinner size={16} />
                  </div>
                )}
                {error && (
                  <p className="text-center text-red-500">Error: {error}</p>
                )}
                {user && (
                  <div>
                    {" "}
                    <SectionCards />
                    <div className="px-4 lg:px-6">
                      <ChartAreaInteractive />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {activeItem === "Posts" && <PostsSection />}
        {activeItem === "Analytics" && <AnalyticsSection />}
        {activeItem === "Members" && <MembersSection />}
        {activeItem === "Devotions" && <DevotionsSection />}
        {activeItem === "Calendar" && <CalendarSection />}
        {activeItem === "Attendance" && <AttendanceSection />}
        {activeItem === "Attendance Summary" && <AttendanceSection />}
        {activeItem === "Check In" && <CheckInSection />}
        {activeItem === "Analytics" && <AttendanceAnalyticsSection />}
      </SidebarInset>
    </>
  );
}
