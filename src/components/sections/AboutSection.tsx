 import { useEffect, useState } from "react";
 import { User, Code, Palette, Music } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
 import { supabase } from "@/integrations/supabase/client";

 const skillIcons: Record<string, typeof Code> = {
   Development: Code,
   Design: Palette,
   Music: Music,
 };
 
 const defaultSkills = [
   { label: "Development", description: "Building web apps & tools" },
   { label: "Design", description: "Creating visual experiences" },
   { label: "Music", description: "Producing beats & sounds" },
 ];
 
 interface ProfileData {
   display_name: string | null;
   bio: string | null;
   avatar_url: string | null;
   skills: string[] | null;
 }

export function AboutSection() {
   const [profile, setProfile] = useState<ProfileData | null>(null);
   const [isLoading, setIsLoading] = useState(true);
 
   useEffect(() => {
     const fetchProfile = async () => {
       const { data } = await supabase.rpc("get_public_profile");
       const profile = Array.isArray(data) ? data[0] : data;
       setProfile(profile);
       setIsLoading(false);
     };
     fetchProfile();
   }, []);
 
   const displaySkills = profile?.skills?.length 
     ? profile.skills.map(s => {
         const [label, description] = s.split(":").map(p => p.trim());
         return { label, description: description || label };
       })
     : defaultSkills;
 
  return (
    <section id="about" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Profile Image Placeholder */}
            <div className="relative">
              <div className="aspect-square max-w-md mx-auto rounded-2xl overflow-hidden shadow-soft bg-gradient-to-br from-secondary to-accent">
               {profile?.avatar_url ? (
                 <img 
                   src={profile.avatar_url} 
                   alt={profile.display_name || "Profile"} 
                   className="w-full h-full object-cover"
                 />
               ) : (
                 <div className="w-full h-full flex items-center justify-center">
                   <User className="w-32 h-32 text-muted-foreground/50" />
                 </div>
               )}
              </div>
              {/* Decorative accent */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
            </div>

            {/* Content */}
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                About <span className="text-primary">Me</span>
              </h2>
              
              <p className="text-lg text-muted-foreground mb-6">
                 {profile?.bio || "Welcome to my creative hub! I'm passionate about building digital experiences that blend technology with artistry. From web applications to AI experiments, from visual art to music production — this is where all my creative work comes together."}
              </p>
              

              {/* Skills Grid */}
              <div className="grid sm:grid-cols-3 gap-4">
                 {displaySkills.slice(0, 3).map((skill) => {
                   const IconComponent = skillIcons[skill.label] || Code;
                   return (
                   <Card key={skill.label} className="border-none shadow-card hover:shadow-soft transition-shadow">
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-secondary flex items-center justify-center">
                         <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-1">{skill.label}</h3>
                      <p className="text-sm text-muted-foreground">{skill.description}</p>
                    </CardContent>
                  </Card>
                 )})}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
