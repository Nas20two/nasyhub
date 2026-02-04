import { Download, FileText, Briefcase, GraduationCap, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Placeholder data
const experience = [
  {
    title: "Full Stack Developer",
    company: "Your Company",
    period: "2022 - Present",
    description: "Building web applications and exploring AI technologies.",
  },
  {
    title: "Freelance Designer",
    company: "Self-employed",
    period: "2020 - 2022",
    description: "Creating digital art and design solutions for clients.",
  },
];

const education = [
  {
    degree: "Bachelor's in Computer Science",
    school: "Your University",
    period: "2016 - 2020",
  },
];

export function ResumeSection() {
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
            <Button className="gradient-accent">
              <Download className="mr-2 h-4 w-4" />
              Download Full Resume
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
                  <Card key={index} className="border-none shadow-card">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{item.title}</h4>
                          <p className="text-sm text-primary">{item.company}</p>
                        </div>
                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                          {item.period}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </CardContent>
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
                  <Card key={index} className="border-none shadow-card">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{item.degree}</h4>
                          <p className="text-sm text-primary">{item.school}</p>
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
                      {["React", "TypeScript", "Node.js", "Python", "AI/ML", "Figma", "Ableton", "Photoshop"].map((skill) => (
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
    </section>
  );
}
