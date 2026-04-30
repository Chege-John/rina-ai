import React from "react";
import { 
  Bot, 
  MessageSquare, 
  Zap, 
  ShieldCheck, 
  Globe, 
  BarChart3 
} from "lucide-react";

const features = [
  {
    title: "AI-Powered Chatbots",
    description: "Deploy intelligent chatbots that learn from your content and engage visitors 24/7.",
    icon: <Bot className="h-6 w-6 text-ir-orange" />,
  },
  {
    title: "Real-time Conversations",
    description: "Seamlessly switch between AI and human support to ensure customer satisfaction.",
    icon: <MessageSquare className="h-6 w-6 text-ir-orange" />,
  },
  {
    title: "Instant Integration",
    description: "Connect with your favorite tools and platforms in just a few clicks.",
    icon: <Zap className="h-6 w-6 text-ir-orange" />,
  },
  {
    title: "Enterprise Security",
    description: "Bank-grade encryption and compliance to keep your data safe and secure.",
    icon: <ShieldCheck className="h-6 w-6 text-ir-orange" />,
  },
  {
    title: "Global Reach",
    description: "Support multiple languages and reach customers anywhere in the world.",
    icon: <Globe className="h-6 w-6 text-ir-orange" />,
  },
  {
    title: "Advanced Analytics",
    description: "Gain deep insights into user interactions and bot performance.",
    icon: <BarChart3 className="h-6 w-6 text-ir-orange" />,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="container py-24 sm:py-32 space-y-8">
      <div className="text-center space-y-4 max-w-[800px] mx-auto">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Everything you need to build better conversations
        </h2>
        <p className="text-muted-foreground text-lg md:text-xl">
          Powerful features designed to help you automate support, increase engagement, and grow your business.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="group relative overflow-hidden rounded-2xl border bg-background p-8 hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-ir-orange/10 mb-4 group-hover:bg-ir-orange/20 transition-colors">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
