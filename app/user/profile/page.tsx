'use client'


import { NavUser } from '@/components/dashboard/nav-user'

import { FloatingMessage, showFloatingMessage } from '@/components/notifyClick'
import { Button } from '@/components/ui/button'
import { FormPhoto } from '@/components/userCard/formPhoto'
import { copyToClipboard } from '@/lib/utils'

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
  IconX,
} from '@tabler/icons-react'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import styles from "./PassModalCard.module.css"
import { Spinner } from '@/components/ui/loadingSpinner'

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

function PassModalCard({
  open,
  onClose,
  user,
  token,
}: {
  open: boolean
  onClose: () => void
  user: UserType | null
  token: string
}) {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const [loading, setLoading] = useState(false);

  const [show, setShow] = useState(open);

 //changepass async function
const handleChangePassword = async () => {
  if (!user) return;

  setLoading(true);
  setMessage("");

  try {
    const res = await fetch(
      `https://isidro-webapi.onrender.com/users/${user.id}`, // 🔥 FIXED
      {
        method: "PUT",
         headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // 🔥 REQUIRED
    },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          password: confirmPass,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setIsError(true);
      setMessage(data.message || "Failed to update password");
      return;
    }

    setIsError(false);
    setMessage("✅ Password updated successfully!");

    // clear inputs
    setOldPass("");
    setNewPass("");
    setConfirmPass("");
    showFloatingMessage("Password Changed!✅", window.innerWidth / 2, 100);
    onClose()

  } catch (err) {
    setIsError(true);
    setMessage(`Server error. Try again. ${err}`);
  } finally {
    setLoading(false);
  }
};




  useEffect(() => {
    if (open) {
      setShow(true); 
    } else {
     
      const timer = setTimeout(() => setShow(false), 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!show) return null;
  return (
    <div
      className={` fixed inset-0 z-50 flex items-center justify-center ${open ? 'bg-black/50 backdrop-blur-sm' : ''}  `}
      onClick={onClose}
    >
      <div
          className={`w-[360px] lg:relative lg:top-auto top-[5%] absolute rounded-2xl bg-background shadow-2xl p-6 border ${
    open ? styles.overlay : styles.overlayClose
  }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <section className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Change Password</h2>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted"
          >
            <IconX size={20} className='cursor-pointer rounded-sm'/>
          </button>
        </section>
        
        {/* Form */}
        <section className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Old Password"
            value={oldPass}
            onChange={(e) => setOldPass(e.target.value)}
            className="border rounded-lg p-3 bg-background"
          />
         <div className="border-b my-4" />

          <input
            type="password"
            placeholder="New Password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            className="border rounded-lg p-3 bg-background"
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            className="border rounded-lg p-3 bg-background"
          />

         <button
          onClick={handleChangePassword}
          disabled={
            !oldPass || loading ||
            !newPass ||
            !confirmPass ||
            newPass !== confirmPass
          }
          className="mt-2 bg-button-blue text-background py-3 rounded-lg disabled:opacity-40"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
         {message && (
  <span
    className={`text-sm ${
      isError ? "text-red-500" : "text-green-500"
    }`}
  >
    {message}
  </span>
)}


        </section>
      </div>
    </div>
  )
}


export default function ProfilePage() {
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photo, setPhoto] = useState('') // preview (base64 or URL)

  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const fetchOnce = useRef(false)
  const [accessToken, setAccessToken] = useState('')
  const [passModal, setPassModal] = useState(false)
  


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
  photo_image: "",
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
const [savingForm, setSavingForm] = useState(false);


//save form personal data
const saveForm = async () => {
  setSavingForm(true)
  if (!form.fName || !form.lName || !form.birthday || !form.age || !form.gender ||
      !form.level || !form.ministry || !form.group) {
    setFormError("Please fill out all required fields before saving.");
    setSavingForm(false)
    return;
  }

  //upload image to cloudinary
  
  let uploadedPhotoUrl = photo // default to previous URL if no new file

  // 1️⃣ Upload to Cloudinary if user selected a new photo
  if (photoFile) {
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      const uploadPreset = "unsigned_image" // create in Cloudinary

      const formData = new FormData()
      formData.append("file", photoFile)
      formData.append("upload_preset", uploadPreset)

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      uploadedPhotoUrl = data.secure_url
      console.log("Cloudinary upload success:", uploadedPhotoUrl)
    } catch (err) {
      console.error("Cloudinary upload failed:", err)
      setFormError("Failed to upload profile photo")
      setSavingForm(false)
      return
    }
  }

  try {
            console.log(form);
            //PUT update data
           try {
    const res = await fetch(
      `https://isidro-webapi.onrender.com/api/personal-info/${user?.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          first_name: form.fName,
          middle_name: "string",
          last_name: form.lName,
          phone: "string",
          birthday: form.birthday?.toISOString().split("T")[0],
          gender: form.gender,
          address: "string",
          city: "string",
          state: "string",
          country: "string",
          bio: "string",
          profile_image: uploadedPhotoUrl, // ← include Cloudinary URL
        }),
      }
    )

                      const data = await res.json()
                    if (!res.ok) {
                      console.log(data.detail[0].msg)
                       setFormError(`Error Save Profile: ${data.detail[0].msg}`); // optional floating confirmation
                       return
                    }
            } catch(err) {
              console.log(`Error Put Update ${err}`)
               setSavingForm(false)
            }
            

    setFormError(""); 
  const updateUsername =  await fetch(
                       `https://isidro-webapi.onrender.com/users/${user?.id}`, 
                      {
                        method: "PUT",
                        headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${accessToken}`,
                    },
                        body: JSON.stringify({
                          name: `${form.fName} ${form.lName}`,
                        }),
                      },)

                    if (!updateUsername.ok) {
                      console.log("error changing username")
                       return
                    }
               

     showFloatingMessage("Profile Saved!✅", window.innerWidth / 2, 100); // optional floating confirmation
     setPhoto(uploadedPhotoUrl) // update preview in case it changed
    setPhotoFile(null) // reset file
  } catch (err: any) {
    console.log(`Error save profile: ${err.message || err}`);
     setSavingForm(false)

  } finally {
    setSavingForm(false)
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
        setAccessToken(userData.access_token)

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

        //fetch personal Info from api
        const personalInfoRes = await fetch(
          `https://isidro-webapi.onrender.com/api/personal-info/${userData.user}`,
          {
            headers: {
              Authorization: `Bearer ${userData.access_token}`,
            },
          }
        )

          if (!personalInfoRes.ok) {
            if (personalInfoRes.status === 400 || personalInfoRes.status === 404) {
              console.log("Personal info not found");
               setFormError("Personal info not found");

                    const res = await fetch(
                       `https://isidro-webapi.onrender.com/api/personal-info/${userData.user}`, 
                      {
                        method: "POST",
                        headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${userData.access_token}`,
                    },
                        body: JSON.stringify({
                          first_name: "string",
                          middle_name: "string",
                          last_name: "string",
                          phone: "string",
                          birthday: "2000-01-01",
                          gender: "string",
                          address: "string",
                          city: "string",
                          state: "string",
                          country: "string",
                          bio: "string",
                          profile_image: "string"
                        }),
                      }
                    );

                  if (!res.ok) {
                    console.log("error posting personal data")
                    return;
                  }
                }
              }
            

        const personalInfo = await personalInfoRes.json()
        console.log("personal info fetch:",personalInfo)
        

        // attach personal info to form
        const defaults = {
          birthday: personalInfo.birthday ? new Date(personalInfo.birthday) : undefined,
          level: personalInfo.level ?? "",
          ministry: personalInfo.ministry ?? "",
          group: personalInfo.group ?? "",
          age: personalInfo.age ?? "0",
          gender: personalInfo.gender ?? "",
          fName: personalInfo.first_name ?? "",
          lName: personalInfo.last_name ?? "",
          photo_image: personalInfo.profile_image ?? ""
        }
        console.log("defaults:",defaults)
       
        setForm(defaults)
        setInitialForm(defaults)
        console.log("Profile image",personalInfo.profile_image)
        setPhoto(personalInfo.profile_image)
      } catch {
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  

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
          <div className="sticky top-0 z-40 bg-muted flex flex-wrap justify-between align-middle items-center rounded-2xl border shadow-lg p-5 gap-4 ">
            
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
              disabled={!isDirty || savingForm}
              onClick={() => saveForm()}
              className="flex gap-2 border px-4 py-2 rounded-sm bg-button-blue/70 text-background disabled:opacity-40 disabled:pointer-events-none hover:bg-button-blue"
            >
              {savingForm ? "Saving..." : "Save"} <IconDeviceFloppy />
            </button>

            </div>
          </div>

          {!user ?
          <div className='w-full flex items-center  justify-center'>
          <span className='text-center '> Loading Personal Information...</span>
          <Spinner size={16} />
          </div> : 
          <div>
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
            onChange={(base64, file) => {
              setPhoto(base64)   // show preview
              setPhotoFile(file) // store file for upload on save
            }}
          />


              <div className="flex flex-col ">
                <span className="font-medium">{form?.fName} {form?.lName}</span>
                <span className="text-sm opacity-70 flex lg:flex-row lg:gap-2 gap-1 flex-col">
                <span className='flex flex-row gap-1'>  ID: {user?.id} <IconCopy className='cursor-pointer' onClick={(e) => copyToClipboard(`${user?.id}`,() => handleClickNotify(e))}/> </span>
                  Age: {age || "0"} 
                  <span className='flex lg:flex-row lg:gap-2 gap-1'>Status: Active <span className="w-3 h-3 bg-green-500 rounded-full self-center mb-0.5 items-center"></span></span>
                  </span>
               
           <FloatingMessage />
              
               <PassModalCard 
               user={user} 
               open={passModal}
                onClose={() => setPassModal(false)}
                 token={accessToken}
                    />
                <button onClick={() => setPassModal(true)} className="mt-2 border rounded-sm px-4 py-2 flex cursor-pointer items-center gap-2 bg-muted hover:bg-muted-foreground/30">
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
    <div className="w-full px-5 gap-y-2 gap-x-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5 mt-2  ">

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
  defaultMonth={form.birthday} // 🔹 opens calendar on current date
/>


      </PopoverContent>
    </Popover>
  </div>

   {/* Gender */}
  <div className="flex flex-col gap-1">
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
         
        </div>}
        </div> 
          
     
    </main>
    </>
  )
}
