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
import PostsSection from "@/components/dashboard/sections/posts";

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { id, name, email, profileImage, access_token } = useAuth();

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
        <PostsSection />
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
