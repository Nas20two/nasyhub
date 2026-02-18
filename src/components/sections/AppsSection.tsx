import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

// Hardcoded projects - no Supabase dependency
const projects = [
  {
    id: "1",
    name: "Customer Lifetime Navigator",
    description: "AI-powered dashboard for SaaS metrics and customer lifetime value analysis. Built with React, TypeScript, and Gemini API.",
    app_url: "https://customer-lifetime-navigator-v2.vercel.app",
    tags: ["React", "TypeScript", "Gemini API", "Vercel"],
    image_url: null,
    is_active: true,
  },
  {
    id: "2",
    name: "Muscle Muse",
    description: "AI-powered fitness tracker with workout logging, progress analytics, and PWA support. Built with React and Supabase.",
    app_url: "https://muscle-muse-clean.vercel.app",
    tags: ["React", "Supabase", "PWA", "Fitness"],
    image_url: null,
    is_active: true,
  },
  {
    id: "3",
    name: "The Beyond",
    description: "Immersive multi-stage audio experience with atmospheric soundscapes and Web Audio API. PWA installable.",
    app_url: "https://thebeyond-clean.vercel.app",
    tags: ["React", "Web Audio API", "PWA", "Immersive"],
    image_url: null,
    is_active: true,
  },
  {
    id: "4",
    name: "NaSy Hub",
    description: "Personal portfolio showcasing AI projects and creative work. Dynamic project showcase with admin dashboard.",
    app_url: "https://nasyhub-clean.vercel.app",
    tags: ["React", "Supabase", "Portfolio"],
    image_url: null,
    is_active: true,
  },
];

export const AppsSection = () => {
  return (
    <section id="apps" className="py-24 bg-secondary/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">My Apps</h2>
          <p className="max-w-[700px] text-muted-foreground">AI-powered projects I've built and deployed.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col h-full bg-card hover:shadow-lg transition-shadow">
              {project.image_url && (
                <div className="h-48 overflow-hidden rounded-t-lg">
                  <img
                    src={project.image_url}
                    alt={project.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {project.tags?.map((tag) => (
                    <span key={tag} className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription className="text-base line-clamp-3">{project.description}</CardDescription>
              </CardContent>
              <CardFooter>
                {project.app_url && (
                  <Button asChild className="w-full" variant="default">
                    <a href={project.app_url} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4 mr-2" />
                      Launch App
                    </a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
