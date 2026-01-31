import Features from "@/components/features-3";
import FooterSection from "@/components/footer";
import HeroSection from "@/components/hero-section";
import IntegrationsSection from "@/components/integrations-3";

export default function Home() {
  return (
    <div>
      <section id="updates">
     <HeroSection />
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
