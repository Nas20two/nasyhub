import { ExternalLink, Smartphone } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Placeholder data - will be replaced with database content
const placeholderApps = [
  {
    id: "1",
    name: "Muscle Muse",
    description: "AI-powered fitness companion that helps you build personalized workout routines and track your progress.",
    image_url: null,
    app_url: "#",
    tags: ["Fitness", "AI", "Health"],
  },
  {
    id: "2",
    name: "Coming Soon",
    description: "More exciting apps are in development. Stay tuned for new releases!",
    image_url: null,
    app_url: null,
    tags: ["In Progress"],
  },
];

export function AppsSection() {
  return (
    <section id="apps" className="py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              My <span className="text-primary">Apps</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Web applications I've built to solve real problems and explore new technologies.
            </p>
          </div>

          {/* Apps Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {placeholderApps.map((app) => (
              <Card key={app.id} className="group overflow-hidden border-none shadow-card hover:shadow-soft transition-all duration-300 hover:-translate-y-1">
                {/* App Screenshot */}
                <div className="aspect-video bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                  {app.image_url ? (
                    <img
                      src={app.image_url}
                      alt={app.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Smartphone className="w-12 h-12 text-muted-foreground/50" />
                  )}
                </div>

                <CardHeader className="pb-2">
                  <h3 className="text-xl font-semibold">{app.name}</h3>
                </CardHeader>

                <CardContent className="pb-2">
                  <p className="text-muted-foreground text-sm mb-3">
                    {app.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {app.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>

                <CardFooter>
                  {app.app_url ? (
                    <Button className="w-full gradient-accent" asChild>
                      <a href={app.app_url} target="_blank" rel="noopener noreferrer">
                        Launch App <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  ) : (
                    <Button className="w-full" variant="secondary" disabled>
                      Coming Soon
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
