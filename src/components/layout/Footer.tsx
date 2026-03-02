import { Heart, Github, Linkedin, Twitter } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SocialLinks {
  github_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
}

export function Footer() {
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    github_url: null,
    linkedin_url: null,
    twitter_url: null,
  });

  useEffect(() => {
    const fetchSocialLinks = async () => {
      const { data } = await supabase.rpc("get_public_profile");
      const profile = Array.isArray(data) ? data[0] : data;

      if (profile) {
        setSocialLinks({
          github_url: profile.github_url,
          linkedin_url: profile.linkedin_url,
          twitter_url: profile.twitter_url,
        });
      }
    };

    fetchSocialLinks();
  }, []);

  const socialItems = [
    { url: socialLinks.github_url, icon: Github, label: "GitHub" },
    { url: socialLinks.linkedin_url, icon: Linkedin, label: "LinkedIn" },
    { url: socialLinks.twitter_url, icon: Twitter, label: "Twitter" },
  ].filter((item) => item.url);

  return (
    <footer className="py-8 border-t border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} NaSy Hub. All rights reserved.
          </p>
          
          {socialItems.length > 0 && (
            <div className="flex items-center gap-4">
              {socialItems.map(({ url, icon: Icon, label }) => (
                <a
                  key={label}
                  href={url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          )}
          
          <p className="text-sm text-muted-foreground">
            Built with React & Supabase
          </p>
        </div>
      </div>
    </footer>
  );
}
