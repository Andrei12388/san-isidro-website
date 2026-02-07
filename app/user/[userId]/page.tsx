'use client'

import { NavUser } from '@/components/dashboard/nav-user'
import { Logo } from '@/components/logo'
import { FloatingMessage, showFloatingMessage } from '@/components/notifyClick'
import { Button } from '@/components/ui/button'
import { FormPhoto } from '@/components/userCard/formPhoto'
import { copyToClipboard } from '@/lib/utils'
import { Separator } from '@radix-ui/react-separator'
import {
  IconBell,
  IconCopy,
  IconDeviceFloppy,
  IconLock,
  IconMail,
} from '@tabler/icons-react'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

interface UserType {
  name: string
  email: string
  avatar: string
  id: string
}

function Card({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border  bg-muted shadow-lg overflow-hidden">
      <div className="px-5 py-3 border-b  bg-muted/70">
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="p-5">child</div>
    </div>
  )
}

export default function ProfilePage() {
  const [photo, setPhoto] = useState('')
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const fetchOnce = useRef(false)

const handleClickNotify = (e: React.MouseEvent) => {
  // e.clientX and e.clientY are the mouse coordinates
  showFloatingMessage("Copied!", e.clientX, e.clientY);
};


   if (user) {
    document.title = `${user.name} - Profile Page`
  }

  useEffect(() => {
    if (fetchOnce.current) return
   


    const fetchUser = async () => {
      try {
        const sessionRes = await fetch('/api/auth/getSession')
        const userData = await sessionRes.json()

        const userInfoRes = await fetch(
          `https://isidro-webapi.onrender.com/users/${userData.user}`,
          {
            headers: {
              Authorization: `Bearer ${userData.access_token}`,
            },
          }
        )

        const resUser = await userInfoRes.json()
        setUser(resUser)
        fetchOnce.current = true
      } catch {
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [user])

  return (
    <>
    <Head>
        <meta name="description" content="User profile page for My App" />
      </Head>
    <main className="h-screen w-full flex flex-col overflow-hidden">
      {/* header navigation*/}
      <header className="fixed top-0 z-50 w-full bg-background border-b">
        <div className="flex justify-between items-center px-5">
          <a href='/' className="flex gap-2 p-2 items-center rounded-sm hover:bg-muted-foreground/30">
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
            <NavUser item={user} />
          </div>
        </div>
      </header>

      
      
        <div className="border border-blue-500 min-h-full w-full hide-scrollbar-arrows overflow-y-auto flex-1 pt-15 max-w-6xl mx-auto px-4 pb-10 space-y-6">
          {/* scrolable card */}
          <div className="sticky top-0 z-40 bg-muted flex flex-wrap justify-between items-center rounded-2xl border shadow-lg p-5 gap-4">
            <span className="text-2xl font-semibold">User Profile</span>

            <div className="flex gap-2">
              <button className="border cursor-pointer px-4 py-2 rounded-sm bg-muted hover:bg-muted-foreground/30">
                Cancel
              </button>

              <button className="flex gap-2 border cursor-pointer px-4 py-2 rounded-sm bg-button-blue/70 text-background hover:bg-button-blue">
                Save <IconDeviceFloppy />
              </button>
            </div>
          </div>

          
          <section className=" top-4 border border-green-500 bg-muted rounded-2xl shadow-lg">
            {/*Upper part border */}
      <div className="px-5 py-3 border-b">
              <h1 className="text-sm font-semibold">Basic Info</h1>
      </div>

             {/*Lower part border */}
      <div className="p-5 flex flex-row gap-5 items-start sm:items-center">
              <FormPhoto
                link={photo}
                size={100}
                editable
                onChange={(b) => setPhoto(b)}
              />

              <div className="flex flex-col">
                <span className="font-medium">{user?.name}</span>
                <span className="text-sm opacity-70 flex flex-row gap-2">ID: {user?.id} <IconCopy className='cursor-pointer' onClick={(e) => copyToClipboard(`${user?.id}`,() => handleClickNotify(e))}/></span>
           <FloatingMessage />

                <button className="mt-2 border rounded-sm px-4 py-2 flex cursor-pointer items-center gap-2 bg-muted hover:bg-muted-foreground/30">
                  <IconLock /> Change Password
                </button>
              </div>
      </div>
        {/*Fullname Lastname */}
      <div className='flex lg:flex-row flex-col px-5 gap-3 justify-between'>
        <div className=' basis-1/2 gap-1 rounded-sm flex flex-col'>
        First Name:
        <div className='rounded-sm'>
          <input type='text' className='bg-background rounded-sm mb-1 w-full'></input>
        </div>
        </div>
        <div className=' basis-1/2 gap-1 rounded-sm flex flex-col'>
        Last Name:
        <div className='rounded-sm'>
          <input type='text' className='bg-background rounded-sm mb-1 w-full'></input>
        </div>
        </div>
      </div>
       {/*below full name section */}
      <div className='w-full border border-blue-500 px-5 flex flex-row gap-5'>
        <div className='border border-red-500 basis-1/4 '>
        Birthday
        <div>form</div>
        </div>
        <div className='border border-red-500 basis-1/4 '>
        Level
        <div>form</div>
        </div>
        <div className='border border-red-500 basis-1/4 '>
        Ministry
        <div>form</div>
        </div>
        <div className='border border-red-500 basis-1/4 '>
        Group
        <div>form</div>
        </div>
      </div>
          </section>

        
            <div className="grid gap-6 md:grid-cols-2">
              <Card title="Contacts" />
              <Card title="Address" />
            </div>
         
        </div>
     
    </main>
    </>
  )
}
