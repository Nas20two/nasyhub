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
   { label: "AI Solutions", description: "LLM integration & automation" },
   { label: "Full-Stack", description: "React, TypeScript, Supabase" },
   { label: "Enterprise", description: "15+ years B2B SaaS experience" },
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
              <div className="aspect-square max-w-[14rem] mx-auto rounded-2xl overflow-hidden shadow-soft bg-gradient-to-br from-secondary to-accent">
               <img 
                 src={profile?.avatar_url || "https://xspsvvsxxnciqwqiellm.supabase.co/storage/v1/object/public/Gallery/profile-avatar.jpg"} 
                 alt={profile?.display_name || "Profile"} 
                 className="w-full h-full object-cover"
               />
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
                 {profile?.bio || "AI Solutions Engineer building practical tools. 15+ years in enterprise tech, now focused on AI applications that solve real problems."}
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
