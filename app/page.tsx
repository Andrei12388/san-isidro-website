"use client";
import LightRays from "@/components/LightRays";
import ContentSection from "@/components/content-3";
import Features from "@/components/features-3";
import FooterSection from "@/components/footer";
import { HeroHeader } from "@/components/header";
import HeroSection from "@/components/hero-section";
import IntegrationsSection from "@/components/integrations-3";
import { useRouter } from "next/navigation";
import { fetchWithTimeout, startHealthPolling } from "@/lib/fetchWithTimeout";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { CalendarEvent } from "./types/types";
import { fetchAuth } from "@/context/fetchAuth";
import { Posts } from "@/components/dashboard/sections/posts";

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

    const [closing, setClosing] = useState(false);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
     const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { id, name, email, profileImage, access_token } = useAuth();

  //fetch events from API on mount
      useEffect(() => {
      fetchEvents();
    }, []);
      
    const fetchEvents = async () => {
    
      setLoading(true);
    
      try {
        const res = await fetchAuth(
          "/api/postgre/events",
          access_token || "",
          { method: "GET" }
        );
    
        const json = await res.json();
    
            const formatted: CalendarEvent[] = json.data
          .map((e: any) => ({
            id: String(e.id),
            creatorId: e.creatorId ? String(e.creatorId) : null,
            creatorName: e.creator?.name || "Unknown",
            title: e.title || "Untitled Event",
            description: e.description || "",
            image: e.image || "/images/defaultPost.jpg",
            location: e.location || "TBD",
            allowRegistration: Boolean(e.allowRegistration),
            start: e.start ? new Date(e.start) : new Date(),
            end: e.end ? new Date(e.end) : new Date(),
          }))
          // 🔹 Only allow registration
          .filter((e: CalendarEvent) => e.allowRegistration === true);
  
        setEvents(formatted);
      } finally {
        setLoading(false);
      }
    };

  //useEffect(() => {
  // const idPoll = startHealthPolling("/api/health");
  // return () => clearInterval(idPoll);
  //}, []);

  // optional: compute a user object only when an id exists
  const user = id
    ? {
        id,
        name,
        email,
        avatar: profileImage,
      }
    : null;

  return (
    <div>
      <section id="updates">
        <div
          className="z-[-1]"
          style={{ width: "100%", height: "600px", position: "absolute" }}
        >
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
        <HeroHeader item={user} />

        <HeroSection user={user} isLoading={isLoading} />
        <ContentSection />

      {/* Fetch Event Posts */}
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-2 items-center bg-muted">
                <section className="grid gap-4 sm:gap-6 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
                  <span className="font-bold text-3xl text-center">Events</span>
                 {events.map((post) => (
                    <Posts
                      key={post.id}
                      location={post.location}
                      allowRegistration={post.allowRegistration}
                      creatorName={post.creatorName}
                      id={post.id}
                      creatorId={post.creatorId}
                      title={post.title}
                      image={post.image}
                      description={post.description}
                      start={post.start}
                      end={post.end}
                    />
                  ))}
                </section>
              </div>
      </section>
          {/*
      <section id="discipleship">
        <Features />
      </section>

      <section id="org">
        <IntegrationsSection />
      </section>
       */}

      <section id="about">
        <FooterSection />
      </section>
    </div>
  );
}
