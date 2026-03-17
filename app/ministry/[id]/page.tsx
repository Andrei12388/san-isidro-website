"use client";

import MinistryMembers from "@/components/dashboard/sections/ui/MinistryMembers";
import MinistryTrainings from "@/components/dashboard/sections/ui/MinistryTrainings";
import { MinistryMembersProvider } from "@/context/MinistryMemberContext";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { IconBell, IconMail } from "@tabler/icons-react";
import { NavUser } from "@/components/dashboard/nav-user";
import { useEffect, useRef, useState, use } from "react";
import { useAuth } from "@/context/AuthContext";

interface UserType {
  name: string;
  email: string;
  avatar: string;
  id: number;
}

const API_BASE =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_APP_URL
    : "http://localhost:3000";

export default function MinistryPage({ params }: { params: Promise<{ id: number }> }) {
  const resolvedParams = use(params); // unwrap the Promise
  const ministryId = resolvedParams.id;

  const [user, setUser] = useState<UserType | null>(null);
  const fetchOnce = useRef(false);
  const { access_token } = useAuth();

  useEffect(() => {
    if (fetchOnce.current) return;

    const fetchUser = async () => {
      try {
        const sessionRes = await fetch(`${API_BASE}/api/auth/getSession`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });
        const userData = await sessionRes.json();

        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          avatar: userData.profileImage,
        });

        fetchOnce.current = true;
      } catch (error) {
        console.error("Error fetching user session:", error);
      }
    };

    fetchUser();
  }, [access_token]);

  return (
    <div className="space-y-8 p-6 mt-10 w-full">
      <MinistryMembersProvider ministryId={ministryId}>
        <header className="fixed top-0 z-50 w-full bg-background border-b">
          <div className="flex justify-between items-center px-5">
            <a
              href="/"
              className="flex gap-2 p-2 items-center rounded-sm hover:bg-muted-foreground/30"
            >
              <Image
                src="/images/logonotitle.png"
                alt="logo"
                width={40}
                height={40}
              />
              <h1 className="hidden sm:block font-bold">JCSGO: SAN ISIDRO</h1>
            </a>

            <div className="flex items-center ml-2 gap-2">
              <Button size="icon" variant="outline">
                <IconMail />
              </Button>

              <Button size="icon" variant="outline">
                <IconBell />
              </Button>

              {user && <NavUser item={user} />}
            </div>
          </div>
        </header>

        <MinistryMembers ministryId={ministryId} />
         <MinistryTrainings ministryId={ministryId} />
      </MinistryMembersProvider>
    </div>
  );
}