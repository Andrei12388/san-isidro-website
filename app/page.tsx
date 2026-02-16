
'use client';
import LightRays from '@/components/LightRays';
import ContentSection from "@/components/content-3";
import Features from "@/components/features-3";
import FooterSection from "@/components/footer";
import { HeroHeader } from '@/components/header';
import HeroSection from "@/components/hero-section";
import IntegrationsSection from "@/components/integrations-3";
import { useRouter } from "next/navigation";
import { fetchWithTimeout, startHealthPolling } from "@/lib/fetchWithTimeout";
import { useState, useRef, useEffect } from "react";

export default function Home() {

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState<any>(null)
    const fetchOnce = useRef(false) // ✅ track fetch status
    const router = useRouter();
    
   useEffect(() => {
  const id = startHealthPolling("/api/health");

  return () => clearInterval(id);
}, []);


  
   useEffect(() => {
    
     const fetchGet = async() => {
   
      const res = await fetch('/api/api')
      const data = await res.json();
     console.log(data.message);
    }
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
          console.log("Session does not contain access_token or user ID")
        }
  
        setUser(userData || null)
        fetchOnce.current = true // ✅ mark fetch as done
  
      } catch (err: any) {
        console.error("Error fetching user:", err)
        setError(err.message || "Unknown error")
       // router.push('/login');
        setUser(null)
      } finally {
        
        setIsLoading(false)
      }
    }
  fetchGet()
  
    fetchUser()
  }, []) 

  return (
    <div>
      <section id="updates">
        <div className='z-[-1]' style={{ width: '100%', height: '600px', position: 'absolute' }}>
  <LightRays
    raysOrigin="top-center"
    raysColor="#ffffff"
    raysSpeed={1}
    lightSpread={0.5}
    rayLength={10}
    followMouse={true}
    mouseInfluence={0.1}
    noiseAmount={0}
    distortion={0}
    className="custom-rays hidden dark:block"
    
    fadeDistance={1}
    saturation={1}
/>
</div>
     <HeroHeader item={user}/>
    
     <HeroSection user={user} isLoading={isLoading}/>
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
