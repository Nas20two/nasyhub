 import { useEffect, useState } from "react";
 import { ArrowDown } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { supabase } from "@/integrations/supabase/client";
 
 interface HeroContent {
   hero_tagline: string;
   hero_subtitle: string;
 }

export function HeroSection() {
   const [content, setContent] = useState<HeroContent>({
     hero_tagline: "Your Creative Digital Space",
     hero_subtitle: "Explore my collection of apps, AI experiments, artwork, and music. A warm corner of the internet where creativity meets technology.",
   });
 
   useEffect(() => {
     const fetchContent = async () => {
       const { data } = await supabase.rpc("get_public_profile");
       const profile = Array.isArray(data) ? data[0] : data;
       
       if (profile) {
         setContent({
           hero_tagline: profile.hero_tagline || content.hero_tagline,
           hero_subtitle: profile.hero_subtitle || content.hero_subtitle,
         });
       }
     };
     fetchContent();
   }, []);
 
  const scrollToAbout = () => {
    document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center gradient-hero overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/30 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 pt-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-6 animate-fade-in">
            <span className="text-gradient">NaSy Hub</span>
          </h1>
          
           <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground mb-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
             {content.hero_tagline}
           </p>
           
           <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto mb-12 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
             {content.hero_subtitle}
           </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            <Button
              size="lg"
              className="gradient-accent text-primary-foreground hover:opacity-90 transition-opacity px-8"
              onClick={scrollToAbout}
            >
              Explore My Work
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8"
              onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
            >
              Get in Touch
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToAbout}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-primary transition-colors animate-bounce"
        aria-label="Scroll down"
      >
        <ArrowDown className="h-6 w-6" />
      </button>
    </section>
  );
}
