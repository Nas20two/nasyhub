import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { AppsSectionNew } from "@/components/sections/AppsSectionNew";
import { PrototypesSection } from "@/components/sections/PrototypesSection";
import { GallerySection } from "@/components/sections/GallerySection";
import { MusicSection } from "@/components/sections/MusicSection";
import { ResumeSection } from "@/components/sections/ResumeSection";
import { ContactSection } from "@/components/sections/ContactSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <AppsSectionNew />
        <PrototypesSection />
        <GallerySection />
        <MusicSection />
        <ResumeSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
