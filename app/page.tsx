import Features from "@/components/features-3";
import FooterSection from "@/components/footer";
import HeroSection from "@/components/hero-section";
import IntegrationsSection from "@/components/integrations-3";

export default function Home() {
  return (
    <div>
     <HeroSection />
     <Features />
     <IntegrationsSection />
     <FooterSection />
    </div>
  );
}
