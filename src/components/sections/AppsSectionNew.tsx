import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Project {
  id: string;
  name: string;
  description: string | null;
  app_url: string | null;
  tags: string[] | null;
  image_url: string | null;
  is_active: boolean | null;
  display_order: number | null;
}

export const AppsSectionNew = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        console.log("[AppsSectionNew] Fetching projects from Supabase...");
        const { data, error } = await supabase
          .from("apps")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (error) {
          console.error("[AppsSectionNew] Supabase error:", error);
          throw error;
        }
        console.log("[AppsSectionNew] Projects fetched:", data?.length || 0);
        
        // Parse PostgreSQL array strings to JS arrays
        const parsedData = data?.map((project: any) => ({
          ...project,
          tags: typeof project.tags === 'string' 
            ? project.tags.replace(/[{}"]/g, '').split(',').filter(Boolean)
            : project.tags || []
        })) || [];
        
        setProjects(parsedData);
      } catch (err: any) {
        console.error("[AppsSectionNew] Error fetching projects:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <section id="apps" className="py-24 bg-secondary/30">
        <div className="container px-4 md:px-6">
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <span className="text-muted-foreground">Loading projects...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="apps" className="py-24 bg-secondary/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col justify-center items-center text-destructive py-10">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p>Error loading projects</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="apps" className="py-24 bg-secondary/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">My Apps</h2>
          <p className="max-w-[700px] text-muted-foreground">AI-powered projects I've built and deployed.</p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No projects found.</p>
          </div>
        ) : (
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
        )}
      </div>
    </section>
  );
};
