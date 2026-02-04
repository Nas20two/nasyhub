import { User, Code, Palette, Music } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const skills = [
  { icon: Code, label: "Development", description: "Building web apps & tools" },
  { icon: Palette, label: "Design", description: "Creating visual experiences" },
  { icon: Music, label: "Music", description: "Producing beats & sounds" },
];

export function AboutSection() {
  return (
    <section id="about" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Profile Image Placeholder */}
            <div className="relative">
              <div className="aspect-square max-w-md mx-auto rounded-2xl overflow-hidden shadow-soft bg-gradient-to-br from-secondary to-accent">
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-32 h-32 text-muted-foreground/50" />
                </div>
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
                Welcome to my creative hub! I'm passionate about building digital experiences 
                that blend technology with artistry. From web applications to AI experiments, 
                from visual art to music production — this is where all my creative work comes together.
              </p>
              
              <p className="text-muted-foreground mb-8">
                I believe in the power of creativity to solve problems and inspire others. 
                Every project here represents a journey of exploration and learning.
              </p>

              {/* Skills Grid */}
              <div className="grid sm:grid-cols-3 gap-4">
                {skills.map((skill) => (
                  <Card key={skill.label} className="border-none shadow-card hover:shadow-soft transition-shadow">
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-secondary flex items-center justify-center">
                        <skill.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-1">{skill.label}</h3>
                      <p className="text-sm text-muted-foreground">{skill.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
