'use client'
import { NavUser } from '@/components/dashboard/nav-user';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Separator } from '@radix-ui/react-separator';
import { IconBell, IconMail } from '@tabler/icons-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

function Card({ title }:{title:string}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 shadow-lg overflow-hidden">
      <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-900/70">
        <h2 className="text-sm font-semibold text-zinc-200">{title}</h2>
      </div>
      <div className="p-5">child</div>
    </div>
  )
}


export default function ProfilePage() {
  const params = useParams();

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

  return<>
    <main className="flex flex-col h-(--header-height) w-full shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
   <header className="flex h-(--header-height) flex-row w-full shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center  gap-1 px-4 lg:gap-2 lg:px-6">
                <div className='flex flex-row gap-2 items-center justify-center'>
                        <a href='/'><Image src="/images/logonotitle.png" alt="San Isidro Logo" width={50} height={50} /></a>
                      <h1 className=" font-bold lg:text-1xl text-sm lg:block md:block sm:block hidden">JCSGO: SAN ISIDRO {params.userId} </h1>
                      </div>
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="ml-auto flex items-center gap-2">
          <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0 cursor-pointer"
              variant="outline"
            >
              <IconMail />
              <span className="sr-only">Inbox</span>
            </Button>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0 cursor-pointer"
              variant="outline"
            >
              <IconBell />
              <span className="sr-only">Notifications</span>
            </Button>
           <NavUser item={user} />
        </div>
        
      </div>
    </header>
    {/*card edit profile container*/}
    <div className="space-y-6">
 <div className="rounded-2xl max-w-full md:max-w-[100%] min-w-[250px] md:min-w-[500px] h-auto border  shadow-lg overflow-hidden">
      <div className="p-5"><span className='bold'>User Profile</span></div>
  </div>
  {/* Basic Info (full width) */}
 
 <div className="flex justify-center w-full">
  
  <div className="rounded-2xl max-w-full md:max-w-[90%] min-w-[250px] md:min-w-[500px] h-auto md:h-[400px] border  shadow-lg overflow-hidden">
      <div className="px-5 py-3 border-b ">
        <h2 className="text-sm font-semibold ">Basic Info</h2>
      </div>
      <div className="p-5">Hello</div>
  </div>
    </div>

  {/* Contacts + Address */}
  <div className="grid gap-6 md:grid-cols-2">
    <Card title="Contacts" />
    <Card title="Address" />
  </div>

</div>


    </main>
   
  </>
   
}