
'use client'
import ContentSection from "@/components/content-3";
import Features from "@/components/features-3";
import FooterSection from "@/components/footer";
import HeroSection from "@/components/hero-section";
import IntegrationsSection from "@/components/integrations-3";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export default function Home() {

    const [isLoading, setIsLoading] = useState(false)
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
       // router.push('/login');
        setUser(null)
      } finally {
        if(!user)
        setIsLoading(false)
      }
    }
  
    fetchUser()
  }, []) 

  return (
    <div>
      <section id="updates">
     <HeroSection user={user}/>
     <ContentSection />
     </section>
     
     <section id="discipleship">
     <Features />
     </section>

     <section id="org">
      <IntegrationsSection />
     </section>

     <section id="about">
     <FooterSection />
     </section>

    </div>
  );
}
