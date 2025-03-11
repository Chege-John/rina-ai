import { HeroSection } from "@/components/hero-section";
import NavBar from "@/components/navbar";
import { ArrowRightIcon } from "lucide-react";

export default function Home() {
  return (
    <main>
      <NavBar />
      <div>
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
              href: "/docs",
            },
          ]}
          image={{
            light: "https://www.launchuicomponents.com/app-light.png",
            dark: "https://www.launchuicomponents.com/app-dark.png", // Ignored but still provided
            alt: "Rina AI Dashboard Preview",
          }}
        />
      </div>
    </main>
  );
}
