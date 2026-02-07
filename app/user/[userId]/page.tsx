'use client'

import { NavUser } from '@/components/dashboard/nav-user'
import { Logo } from '@/components/logo'
import { FloatingMessage, showFloatingMessage } from '@/components/notifyClick'
import { Button } from '@/components/ui/button'
import { FormPhoto } from '@/components/userCard/formPhoto'
import { copyToClipboard } from '@/lib/utils'
import { Separator } from '@radix-ui/react-separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
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
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="p-5">Form</div>
    </div>
  )
}

export default function ProfilePage() {
  const [photo, setPhoto] = useState('')
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const fetchOnce = useRef(false)


  //form inputs
  const [form, setForm] = useState({
  birthday: undefined as Date | undefined,
  level: "",
  ministry: "",
  group: "",
  age: "",
  gender: "",
  fName: "",
  lName: "",
})


  const calculateAge = (date?: Date) => {
  if (!date) return ""

  const today = new Date()
  let age = today.getFullYear() - date.getFullYear()

  const m = today.getMonth() - date.getMonth()

  if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
    age--
  }

  return age
}


const age = calculateAge(form.birthday)
  

const [initialForm, setInitialForm] = useState(form)
const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm)


const handleClickNotify = (e: React.MouseEvent) => {
  // e.clientX and e.clientY are the mouse coordinates
  showFloatingMessage("Copied!", e.clientX, e.clientY);
};

const [formError, setFormError] = useState("");

const saveForm = () => {
  if (!form.fName || !form.lName || !form.birthday || !form.age || !form.gender ||
      !form.level || !form.ministry || !form.group) {
    setFormError("Please fill out all required fields before saving.");
    return;
  }

  try {
    console.log(form);
    setFormError(""); // clear error if successful
    showFloatingMessage("Profile Saved!✅", window.innerWidth / 2, 100); // optional floating confirmation
  } catch (err: any) {
    setFormError(`Failed to save profile: ${err.message || err}`);
  }
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
        const defaults = {
          birthday: resUser.birthday ? new Date(resUser.birthday) : undefined,
          level: resUser.level ?? "",
          ministry: resUser.ministry ?? "",
          group: resUser.group ?? "",
          age: resUser.age ?? "0",
          gender: resUser.gender ?? "",
          fName: resUser.name ?? "",
          lName: resUser.lName ?? "",
        }

        setForm(defaults)
        setInitialForm(defaults)
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

      
      
        <div className="min-h-full w-full hide-scrollbar-arrows overflow-y-auto flex-1 pt-15 max-w-6xl mx-auto px-4 pb-10 space-y-6">
          {/* scrolable card */}
          <div className="sticky top-0 z-40 bg-muted flex flex-wrap justify-between align-middle items-center rounded-2xl border shadow-lg p-5 gap-4 border border-blue-500">
            
            <span className="text-2xl font-semibold">User Profile</span>
            {formError && (
  <div className="relative border border-red-400 lg:w-[45%] w-[48%] dark:text-red-500 text-red-700  px-4 py-2 rounded" role="alert">
    <strong className="font-bold">Warning: </strong>
    <span className="block sm:inline">{formError}</span>
    <span 
      className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
      onClick={() => setFormError("")}
    >
      <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <title>Close</title>
        <path d="M14.348 5.652a1 1 0 10-1.414-1.414L10 7.172 7.066 4.238a1 1 0 10-1.414 1.414L8.828 10l-3.176 3.176a1 1 0 101.414 1.414L10 12.828l2.934 2.934a1 1 0 001.414-1.414L11.172 10l3.176-3.176z"/>
      </svg>
    </span>
  </div>
)}
            <div className="flex gap-2">
              
                          <button
              disabled={!isDirty}
              onClick={() => setForm(initialForm)}
              className="border px-4 py-2 rounded-sm disabled:opacity-40 disabled:pointer-events-none hover:bg-muted-foreground/30"
            >
              Cancel
            </button>
            
            <button
              disabled={!isDirty}
              onClick={() => saveForm()}
              className="flex gap-2 border px-4 py-2 rounded-sm bg-button-blue/70 text-background disabled:opacity-40 disabled:pointer-events-none hover:bg-button-blue"
            >
              Save <IconDeviceFloppy />
            </button>

            </div>
          </div>

          
          <section className=" top-4  bg-muted rounded-2xl shadow-lg">
            {/*Upper part border */}
      <div className="px-5 py-3 border-b">
              <h1 className="text-lg font-semibold">Basic Info</h1>
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
                <span className="text-sm opacity-70 flex flex-row gap-2">ID: {user?.id} <IconCopy className='cursor-pointer' onClick={(e) => copyToClipboard(`${user?.id}`,() => handleClickNotify(e))}/> Age: {age || "0"}</span>
               
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
          <input value={form.fName} placeholder='First Name . . . ' onChange={(e) => setForm(f => ({ ...f, fName: e.target.value }))} type='text' className='bg-background rounded-sm mb-1 w-full px-2 py-1'></input>
        </div>
        </div>
        <div className=' basis-1/2 gap-1 rounded-sm flex flex-col'>
        Last Name:
        <div className='rounded-sm'>
          <input value={form.lName} placeholder='Last Name . . . ' onChange={(e) => setForm(f => ({ ...f, lName: e.target.value }))} type='text' className='bg-background rounded-sm mb-1 w-full px-2 py-1'></input>
        </div>
        </div>
      </div>
       {/*below full name section */}
    <div className="w-full px-5 grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-5 gap-5 mt-2">

  {/* Birthday */}
  <div className="flex flex-col gap-1 ">
    <label className="text-sm font-medium">Birthday</label>
    
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="justify-between font-normal"
        >
          {form.birthday ? format(form.birthday, "PPP") : "Pick a date"}
          <CalendarIcon className="ml-2 h-4 w-4 text-foreground" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0">
       <Calendar
  mode="single"
  selected={form.birthday}
  onSelect={(date) =>
    setForm(f => ({ ...f, birthday: date }))
  }
  captionLayout="dropdown"
  fromYear={1950}
  toYear={new Date().getFullYear()}
  initialFocus
/>

      </PopoverContent>
    </Popover>
  </div>

   {/* Gender */}
  <div className="flex flex-col gap-1 mb-5">
    <label className="text-sm font-medium">Gender</label>
    <Select value={form.gender} onValueChange={(value) =>
              setForm((f) => ({ ...f, gender: value }))
            }>
      <SelectTrigger>
        <SelectValue placeholder="Select gender" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="male">Male</SelectItem>
        <SelectItem value="female">Female</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* Level */}
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium">Level</label>
    <Select value={form.level} onValueChange={(value) =>
            setForm((f) => ({ ...f, level: value }))
          }>
      <SelectTrigger>
        <SelectValue placeholder="Select level" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="head">Head</SelectItem>
        <SelectItem value="vine">Vine</SelectItem>
        <SelectItem value="cluster">Cluster</SelectItem>
        <SelectItem value="disciple">Disciple</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* Ministry */}
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium">Ministry</label>
    <Select value={form.ministry} onValueChange={(value) =>
                  setForm((f) => ({ ...f, ministry: value }))
                }>
      <SelectTrigger>
        <SelectValue placeholder="Select ministry" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="music">Music</SelectItem>
        <SelectItem value="children">Children</SelectItem>
        <SelectItem value="program">Program</SelectItem>
        <SelectItem value="multimedia">Multimedia</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* Group */}
  <div className="flex flex-col gap-1 mb-5">
    <label className="text-sm font-medium">Group</label>
    <Select value={form.group} onValueChange={(value) =>
              setForm((f) => ({ ...f, group: value }))
            }>
      <SelectTrigger>
        <SelectValue placeholder="Select group" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a">Group A</SelectItem>
        <SelectItem value="b">Group B</SelectItem>
        <SelectItem value="c">Group C</SelectItem>
        <SelectItem value="d">Group D</SelectItem>
      </SelectContent>
    </Select>
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
