'use client';

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/loadingSpinner";
import { useAuth } from "@/context/AuthContext";

export default function AttendanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const fetchOnce = useRef(false);
  const router = useRouter();

  const { access_token } = useAuth();

  useEffect(() => {
    if (fetchOnce.current) return;

    const fetchUser = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const sessionRes = await fetch("/api/auth/getSession");
        if (!sessionRes.ok)
          throw new Error(`Failed to fetch session: ${sessionRes.status}`);

        const userData = await sessionRes.json();

        if (!userData.access_token || !userData.user) {
          throw new Error("Session does not contain access_token or user ID");
        }

        setUser({
          id: userData.user,
          name: userData.name,
          email: userData.email,
          avatar: userData.profileImage,
        });
        fetchOnce.current = true;
      } catch (err: any) {
        console.error("Error fetching user:", err);
        setError(err.message || "Unknown error");
        setUser(null);
        setTimeout(() => router.push("/login"), 0);
      } finally {
        if (!user) setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar isLoading={isLoading} variant="inset" />
      <SidebarInset>
        <SiteHeader user={user} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {isLoading ? (
              <div className="flex flex-1 flex-row justify-center items-center text-center p-8">
                Loading...
                <Spinner size={16} />
              </div>
            ) : error ? (
              <p className="text-center text-red-500 p-8">Error: {error}</p>
            ) : (
              children
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
