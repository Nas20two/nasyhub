 import { useState, useEffect } from "react";
import { Send, Mail, MapPin, Github, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
 import { supabase } from "@/integrations/supabase/client";

 interface ContactInfo {
   email: string | null;
   location: string | null;
   github_url: string | null;
   linkedin_url: string | null;
   twitter_url: string | null;
 }

export function ContactSection() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
   const [contactInfo, setContactInfo] = useState<ContactInfo>({
     email: "hello@nasyhub.com",
     location: "Your City, Country",
     github_url: null,
     linkedin_url: null,
     twitter_url: null,
   });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
 
   useEffect(() => {
     const fetchContactInfo = async () => {
       const { data } = await supabase
         .from("profiles")
         .select("email, location, github_url, linkedin_url, twitter_url")
         .limit(1)
         .single();
       
       if (data) {
         setContactInfo({
           email: data.email || contactInfo.email,
           location: data.location || contactInfo.location,
           github_url: data.github_url,
           linkedin_url: data.linkedin_url,
           twitter_url: data.twitter_url,
         });
       }
     };
     fetchContactInfo();
   }, []);
 
   const socialLinks = [
     { icon: Github, label: "GitHub", href: contactInfo.github_url },
     { icon: Linkedin, label: "LinkedIn", href: contactInfo.linkedin_url },
     { icon: Twitter, label: "Twitter", href: contactInfo.twitter_url },
   ].filter(link => link.href);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

     const { error } = await supabase.from("contact_messages").insert({
       name: formData.name,
       email: formData.email,
       message: formData.message,
     });

     if (error) {
       toast({
         title: "Error",
         description: "Failed to send message. Please try again.",
         variant: "destructive",
       });
     } else {
       toast({
         title: "Message sent!",
         description: "Thank you for reaching out. I'll get back to you soon.",
       });
       setFormData({ name: "", email: "", message: "" });
     }

    setIsSubmitting(false);
  };

  return (
    <section id="contact" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Get in <span className="text-primary">Touch</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have a question or want to work together? I'd love to hear from you.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Contact Form */}
            <Card className="lg:col-span-3 border-none shadow-soft">
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Your message..."
                      rows={5}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full gradient-accent"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        Send Message <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Email */}
              <Card className="border-none shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <a
                         href={`mailto:${contactInfo.email}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                         {contactInfo.email}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card className="border-none shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                       <p className="font-medium">{contactInfo.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
               {socialLinks.length > 0 && (
               <Card className="border-none shadow-card">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect with me
                  </p>
                  <div className="flex gap-3">
                    {socialLinks.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
                        aria-label={social.label}
                      >
                        <social.icon className="w-5 h-5" />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
               )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
