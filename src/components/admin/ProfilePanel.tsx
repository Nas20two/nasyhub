import { useState, useEffect, useRef } from "react";
 import { Upload, Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id?: string;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  email: string | null;
  location: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  resume_url: string | null;
   hero_tagline: string | null;
   hero_subtitle: string | null;
   skills: string[] | null;
 }
 
 interface ResumeEntry {
   id?: string;
   type: "experience" | "education";
   title: string;
   organization: string;
   period: string;
   description: string | null;
   display_order: number;
}

export function ProfilePanel() {
  const { toast } = useToast();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState<"avatar" | "resume" | null>(null);
   const [resumeEntries, setResumeEntries] = useState<ResumeEntry[]>([]);
   const [skillInput, setSkillInput] = useState("");
  const [profile, setProfile] = useState<Profile>({
    user_id: "",
    display_name: "",
    bio: "",
    avatar_url: "",
    email: "",
    location: "",
    github_url: "",
    linkedin_url: "",
    twitter_url: "",
    resume_url: "",
     hero_tagline: "",
     hero_subtitle: "",
     skills: [],
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setProfile(data);
      } else {
        setProfile((prev) => ({ ...prev, user_id: user.id }));
      }
       
       // Fetch resume entries
       const { data: entries } = await supabase
         .from("resume_entries")
         .select("*")
         .order("display_order", { ascending: true });
       
       if (entries) {
         setResumeEntries(entries as ResumeEntry[]);
       }
       
      setIsLoading(false);
    };

    fetchProfile();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading("avatar");
    const fileExt = file.name.split(".").pop();
    const fileName = `avatar-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file);

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
    } else {
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
      setProfile((prev) => ({ ...prev, avatar_url: urlData.publicUrl }));
      // Auto-save to database immediately
      if (profile.id) {
        await supabase.from("profiles").update({ avatar_url: urlData.publicUrl }).eq("id", profile.id);
      }
      toast({ title: "Success", description: "Avatar uploaded and saved" });
    }
    setUploading(null);
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading("resume");
    const fileExt = file.name.split(".").pop();
    const fileName = `resume-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(fileName, file);

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
    } else {
      const { data: urlData } = supabase.storage.from("resumes").getPublicUrl(fileName);
      setProfile((prev) => ({ ...prev, resume_url: urlData.publicUrl }));
      toast({ title: "Success", description: "Resume uploaded" });
    }
    setUploading(null);
  };

  const handleSave = async () => {
    setIsSaving(true);

    const profileData = {
      user_id: profile.user_id,
      display_name: profile.display_name || null,
      bio: profile.bio || null,
      avatar_url: profile.avatar_url || null,
      email: profile.email || null,
      location: profile.location || null,
      github_url: profile.github_url || null,
      linkedin_url: profile.linkedin_url || null,
      twitter_url: profile.twitter_url || null,
      resume_url: profile.resume_url || null,
       hero_tagline: profile.hero_tagline || null,
       hero_subtitle: profile.hero_subtitle || null,
       skills: profile.skills || [],
    };

    if (profile.id) {
      const { error } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", profile.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Profile updated" });
      }
    } else {
      const { data, error } = await supabase
        .from("profiles")
        .insert(profileData)
        .select()
        .single();

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        setProfile(data);
        toast({ title: "Success", description: "Profile created" });
      }
    }
    setIsSaving(false);
  };
 
   const handleAddEntry = (type: "experience" | "education") => {
     const newEntry: ResumeEntry = {
       type,
       title: "",
       organization: "",
       period: "",
       description: "",
       display_order: resumeEntries.filter(e => e.type === type).length,
     };
     setResumeEntries([...resumeEntries, newEntry]);
   };
 
   const handleUpdateEntry = (index: number, field: keyof ResumeEntry, value: string) => {
     const updated = [...resumeEntries];
     (updated[index] as any)[field] = value;
     setResumeEntries(updated);
   };
 
   const handleDeleteEntry = async (index: number) => {
     const entry = resumeEntries[index];
     if (entry.id) {
       await supabase.from("resume_entries").delete().eq("id", entry.id);
     }
     setResumeEntries(resumeEntries.filter((_, i) => i !== index));
     toast({ title: "Entry removed" });
   };
 
   const handleSaveEntries = async () => {
     for (const entry of resumeEntries) {
       if (entry.id) {
         await supabase.from("resume_entries").update({
           title: entry.title,
           organization: entry.organization,
           period: entry.period,
           description: entry.description,
           display_order: entry.display_order,
         }).eq("id", entry.id);
       } else if (entry.title && entry.organization) {
         const { data } = await supabase.from("resume_entries").insert({
           type: entry.type,
           title: entry.title,
           organization: entry.organization,
           period: entry.period,
           description: entry.description,
           display_order: entry.display_order,
         }).select().single();
         if (data) {
           entry.id = data.id;
         }
       }
     }
     toast({ title: "Resume entries saved" });
   };
 
   const handleAddSkill = () => {
     if (skillInput.trim()) {
       setProfile({ ...profile, skills: [...(profile.skills || []), skillInput.trim()] });
       setSkillInput("");
     }
   };
 
   const handleRemoveSkill = (index: number) => {
     const updated = [...(profile.skills || [])];
     updated.splice(index, 1);
     setProfile({ ...profile, skills: updated });
   };

  if (isLoading) {
    return <div className="animate-pulse">Loading profile...</div>;
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Profile & Resume</h1>
          <p className="text-muted-foreground">Manage your public profile</p>
        </div>
        <Button onClick={handleSave} className="gradient-accent" disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Avatar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile Photo</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl">👤</span>
              )}
            </div>
            <div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploading === "avatar"}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading === "avatar" ? "Uploading..." : "Upload Photo"}
              </Button>
            </div>
          </CardContent>
        </Card>

         {/* Hero Content */}
         <Card>
           <CardHeader>
             <CardTitle className="text-lg">Hero Section</CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="space-y-2">
               <Label htmlFor="hero_tagline">Tagline</Label>
               <Input
                 id="hero_tagline"
                 value={profile.hero_tagline || ""}
                 onChange={(e) => setProfile({ ...profile, hero_tagline: e.target.value })}
                 placeholder="Your Creative Digital Space"
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="hero_subtitle">Subtitle</Label>
               <Textarea
                 id="hero_subtitle"
                 value={profile.hero_subtitle || ""}
                 onChange={(e) => setProfile({ ...profile, hero_subtitle: e.target.value })}
                 placeholder="Explore my collection of apps, AI experiments..."
                 rows={3}
               />
             </div>
           </CardContent>
         </Card>
 
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={profile.display_name || ""}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email || ""}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="hello@example.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={profile.location || ""}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                placeholder="City, Country"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio || ""}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell visitors about yourself..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

         {/* Skills */}
         <Card>
           <CardHeader>
             <CardTitle className="text-lg">Skills</CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="flex gap-2">
               <Input
                 value={skillInput}
                 onChange={(e) => setSkillInput(e.target.value)}
                 placeholder="Add skill (e.g., Development: Building web apps)"
                 onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
               />
               <Button variant="outline" onClick={handleAddSkill}>
                 <Plus className="h-4 w-4" />
               </Button>
             </div>
             <div className="flex flex-wrap gap-2">
               {(profile.skills || []).map((skill, index) => (
                 <span
                   key={index}
                   className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm flex items-center gap-2"
                 >
                   {skill}
                   <button onClick={() => handleRemoveSkill(index)} className="hover:text-destructive">
                     <Trash2 className="h-3 w-3" />
                   </button>
                 </span>
               ))}
             </div>
             <p className="text-xs text-muted-foreground">
               Format: "Label: Description" (e.g., "Development: Building web apps")
             </p>
           </CardContent>
         </Card>
 
        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Social Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="github_url">GitHub</Label>
              <Input
                id="github_url"
                value={profile.github_url || ""}
                onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
                placeholder="https://github.com/username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn</Label>
              <Input
                id="linkedin_url"
                value={profile.linkedin_url || ""}
                onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter_url">Twitter</Label>
              <Input
                id="twitter_url"
                value={profile.twitter_url || ""}
                onChange={(e) => setProfile({ ...profile, twitter_url: e.target.value })}
                placeholder="https://twitter.com/username"
              />
            </div>
          </CardContent>
        </Card>
         
         {/* Experience Entries */}
         <Card>
           <CardHeader className="flex flex-row items-center justify-between">
             <CardTitle className="text-lg">Experience</CardTitle>
             <Button variant="outline" size="sm" onClick={() => handleAddEntry("experience")}>
               <Plus className="h-4 w-4 mr-1" /> Add
             </Button>
           </CardHeader>
           <CardContent className="space-y-4">
             {resumeEntries.filter(e => e.type === "experience").map((entry, idx) => {
               const realIndex = resumeEntries.indexOf(entry);
               return (
               <div key={realIndex} className="p-4 border rounded-lg space-y-3">
                 <div className="flex justify-between">
                   <Label>Experience #{idx + 1}</Label>
                   <Button variant="ghost" size="sm" onClick={() => handleDeleteEntry(realIndex)}>
                     <Trash2 className="h-4 w-4 text-destructive" />
                   </Button>
                 </div>
                 <div className="grid sm:grid-cols-2 gap-3">
                   <Input
                     placeholder="Job Title"
                     value={entry.title}
                     onChange={(e) => handleUpdateEntry(realIndex, "title", e.target.value)}
                   />
                   <Input
                     placeholder="Company"
                     value={entry.organization}
                     onChange={(e) => handleUpdateEntry(realIndex, "organization", e.target.value)}
                   />
                 </div>
                 <Input
                   placeholder="Period (e.g., 2022 - Present)"
                   value={entry.period}
                   onChange={(e) => handleUpdateEntry(realIndex, "period", e.target.value)}
                 />
                 <Textarea
                   placeholder="Description"
                   value={entry.description || ""}
                   onChange={(e) => handleUpdateEntry(realIndex, "description", e.target.value)}
                   rows={2}
                 />
               </div>
             )})}
             {resumeEntries.filter(e => e.type === "experience").length === 0 && (
               <p className="text-muted-foreground text-sm">No experience entries yet.</p>
             )}
           </CardContent>
         </Card>
 
         {/* Education Entries */}
         <Card>
           <CardHeader className="flex flex-row items-center justify-between">
             <CardTitle className="text-lg">Education</CardTitle>
             <Button variant="outline" size="sm" onClick={() => handleAddEntry("education")}>
               <Plus className="h-4 w-4 mr-1" /> Add
             </Button>
           </CardHeader>
           <CardContent className="space-y-4">
             {resumeEntries.filter(e => e.type === "education").map((entry, idx) => {
               const realIndex = resumeEntries.indexOf(entry);
               return (
               <div key={realIndex} className="p-4 border rounded-lg space-y-3">
                 <div className="flex justify-between">
                   <Label>Education #{idx + 1}</Label>
                   <Button variant="ghost" size="sm" onClick={() => handleDeleteEntry(realIndex)}>
                     <Trash2 className="h-4 w-4 text-destructive" />
                   </Button>
                 </div>
                 <div className="grid sm:grid-cols-2 gap-3">
                   <Input
                     placeholder="Degree / Certificate"
                     value={entry.title}
                     onChange={(e) => handleUpdateEntry(realIndex, "title", e.target.value)}
                   />
                   <Input
                     placeholder="School / Institution"
                     value={entry.organization}
                     onChange={(e) => handleUpdateEntry(realIndex, "organization", e.target.value)}
                   />
                 </div>
                 <Input
                   placeholder="Period (e.g., 2016 - 2020)"
                   value={entry.period}
                   onChange={(e) => handleUpdateEntry(realIndex, "period", e.target.value)}
                 />
               </div>
             )})}
             {resumeEntries.filter(e => e.type === "education").length === 0 && (
               <p className="text-muted-foreground text-sm">No education entries yet.</p>
             )}
             <Button onClick={handleSaveEntries} variant="outline" className="w-full mt-4">
               Save Resume Entries
             </Button>
           </CardContent>
         </Card>

        {/* Resume */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resume</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  value={profile.resume_url || ""}
                  onChange={(e) => setProfile({ ...profile, resume_url: e.target.value })}
                  placeholder="Resume URL or upload file"
                />
              </div>
              <input
                ref={resumeInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => resumeInputRef.current?.click()}
                disabled={uploading === "resume"}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading === "resume" ? "..." : "Upload"}
              </Button>
            </div>
            {profile.resume_url && (
              <p className="text-sm text-muted-foreground">
                Current: <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Resume</a>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
