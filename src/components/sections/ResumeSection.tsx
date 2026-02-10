import { useEffect, useState } from "react";
import { FileText, Briefcase, GraduationCap, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ResumeRequestModal } from "./ResumeRequestModal";

interface ResumeEntry {
   id: string;
   type: string;
   title: string;
   organization: string;
   period: string;
   description: string | null;
   display_order: number;
 }

export function ResumeSection() {
  const [experience, setExperience] = useState<ResumeEntry[]>([]);
  const [education, setEducation] = useState<ResumeEntry[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
 
   useEffect(() => {
     const fetchData = async () => {
       // Fetch resume entries
       const { data: entries } = await supabase
         .from("resume_entries")
         .select("*")
         .order("display_order", { ascending: true });
       
       if (entries) {
         setExperience(entries.filter(e => e.type === "experience"));
         setEducation(entries.filter(e => e.type === "education"));
       }
 
      // Fetch skills from profile via RPC
      const { data: profileData } = await supabase.rpc("get_public_profile");
      const profile = Array.isArray(profileData) ? profileData[0] : profileData;
      
      if (profile) {
        setSkills(profile.skills || []);
      }
       
       setIsLoading(false);
     };
     fetchData();
   }, []);
 
   const displaySkills = skills.length > 0 
     ? skills.map(s => s.split(":")[0].trim())
     : ["React", "TypeScript", "Node.js", "Python", "AI/ML", "Figma", "Ableton", "Photoshop"];
 
  return (
    <section id="resume" className="py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              My <span className="text-primary">Resume</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              A brief overview of my professional journey and skills.
            </p>
            <Button 
              className="gradient-accent"
              onClick={() => setIsModalOpen(true)}
            >
              <FileText className="mr-2 h-4 w-4" />
              Request Resume
            </Button>
          </div>

          {/* Timeline */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Experience */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Briefcase className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-semibold">Experience</h3>
              </div>
              <div className="space-y-4">
                {experience.map((item, index) => (
                   <Card key={item.id} className="border-none shadow-card">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{item.title}</h4>
                           <p className="text-sm text-primary">{item.organization}</p>
                        </div>
                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                          {item.period}
                        </span>
                      </div>
                    </CardHeader>
                     {item.description && (
                     <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </CardContent>
                     )}
                  </Card>
                ))}
              </div>
            </div>

            {/* Education */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <GraduationCap className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-semibold">Education</h3>
              </div>
              <div className="space-y-4">
                {education.map((item, index) => (
                   <Card key={item.id} className="border-none shadow-card">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                           <h4 className="font-semibold">{item.title}</h4>
                           <p className="text-sm text-primary">{item.organization}</p>
                        </div>
                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                          {item.period}
                        </span>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              {/* Skills placeholder */}
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-6">
                  <Award className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-semibold">Skills</h3>
                </div>
                <Card className="border-none shadow-card">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2">
                       {displaySkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ResumeRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
