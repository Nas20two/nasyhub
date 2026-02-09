import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Globe } from "lucide-react";

// THIS IS WHERE YOU ADD YOUR PROJECTS
// No database needed. Just edit this list.
const projects = [
  {
    title: "Muscle Muse",
    description: "My personal AI fitness application built with Lovable.",
    // Replace with your real URL if you have it, or keep the placeholder
    demoUrl: "https://muscle-muse.lovable.app",
    githubUrl: null, // Set to a URL string if you have one
    tags: ["Health", "AI", "React"],
  },
  {
    title: "Artistly Portfolio",
    description: "A showcase of my digital art and designs.",
    demoUrl: "/gallery", // Internal link to your gallery section
    githubUrl: null,
    tags: ["Design", "Creative"],
  },
  // Add more projects by copying the block above!
];

export const AppsSection = () => {
  return (
    <section id="apps" className="py-24 bg-secondary/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">My Apps</h2>
          <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Projects I've built and deployed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <Card key={index} className="flex flex-col h-full bg-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
                <div className="flex gap-2 mt-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription className="text-base">{project.description}</CardDescription>
              </CardContent>
              <CardFooter className="flex gap-2">
                {project.demoUrl && (
                  <Button asChild className="flex-1" variant="default">
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4 mr-2" />
                      Launch
                    </a>
                  </Button>
                )}
                {project.githubUrl && (
                  <Button asChild variant="outline" size="icon">
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="w-4 h-4" />
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
