import { HeroSection } from "@/components/hero-section";
import NavBar from "@/components/navbar";
import { FeaturesSection } from "@/components/features-section";
import { ArrowRightIcon } from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <NavBar />
      <div className="flex-1">
        <HeroSection
          badge={{
            text: "New Feature Alert",
            action: {
              text: "Check it out",
              href: "/dashboard",
            },
          }}
          title="Welcome to Rina AI"
          description="Build intelligent apps with ease using our cutting-edge AI platform."
          actions={[
            {
              text: "Get Started",
              href: "/dashboard",
              icon: <ArrowRightIcon className="h-4 w-4" />,
              variant: "glow",
            },
            {
              text: "Learn More",
              href: "#features",
            },
          ]}
          image={{
            light: "/images/product-image.png",
            dark: "/images/product-image.png", 
            alt: "Rina AI Dashboard Preview",
          }}
        />
        <FeaturesSection />
      </div>
    </main>
  );
}
