import { Bot, ExternalLink, Sparkles } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// AI Prototypes
const prototypes = [
  {
    id: "1",
    name: "AI Assistant",
    description: "Your AI companion for explaining complex tech concepts and jargon in simple, clear terms. Built with React, TypeScript, and Gemini API.",
    image_url: "https://ai-assistant-clean.vercel.app/bot-icon.svg",
    prototype_url: "https://ai-assistant-clean.vercel.app",
    status: "Live",
  },
  {
    id: "2",
    name: "Smart Inspector",
    description: "Affordable AI-powered quality inspection for SMB manufacturers. $12 ESP32-CAM or $33 Pi Zero 2 W. Cloud vision AI detects defects in real-time.",
    image_url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop",
    prototype_url: "#",
    status: "In Development",
  },
];

export function PrototypesSection() {
  return (
    <section id="prototypes" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Experimental</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              AI <span className="text-primary">Prototypes</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experiments and explorations in artificial intelligence, built with Google AI Studio and other cutting-edge tools.
            </p>
          </div>

          {/* Prototypes Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {prototypes.map((prototype) => (
              <Card key={prototype.id} className="group overflow-hidden border-none shadow-card hover:shadow-soft transition-all duration-300">
                <div className="flex flex-col sm:flex-row">
                  {/* Prototype Icon/Image */}
                  <div className="sm:w-48 aspect-square sm:aspect-auto bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center shrink-0">
                    {prototype.image_url ? (
                      <img
                        src={prototype.image_url}
                        alt={prototype.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Bot className="w-16 h-16 text-primary/50" />
                    )}
                  </div>

                  <div className="flex flex-col flex-1">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xl font-semibold">{prototype.name}</h3>
                        <Badge variant="outline" className="shrink-0">
                          {prototype.status}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="pb-2 flex-1">
                      <p className="text-muted-foreground text-sm">
                        {prototype.description}
                      </p>
                    </CardContent>

                    <CardFooter>
                      <Button variant="outline" className="w-full sm:w-auto" asChild>
                        <a href={prototype.prototype_url} target="_blank" rel="noopener noreferrer">
                          Try Prototype <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </CardFooter>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
