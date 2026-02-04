import { useState } from "react";
import { Play, Pause, Music2, ExternalLink, Headphones } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Placeholder data - will be replaced with database content
const placeholderTracks = [
  {
    id: "1",
    title: "Summer Vibes",
    description: "Chill lo-fi beat perfect for relaxation",
    category: "Original Beats",
    audio_url: null,
    duration: "3:24",
  },
  {
    id: "2",
    title: "Urban Nights",
    description: "Dark trap instrumental with atmospheric elements",
    category: "Original Beats",
    audio_url: null,
    duration: "2:58",
  },
  {
    id: "3",
    title: "Cinematic Rise",
    description: "Sound design element for video production",
    category: "Sound Design",
    audio_url: null,
    duration: "0:45",
  },
];

const placeholderPlaylists = [
  {
    id: "1",
    title: "Creative Flow",
    description: "My go-to playlist for creative work sessions",
    spotify_url: "https://open.spotify.com/playlist/example",
    embed: true,
    embed_url: "https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M",
  },
  {
    id: "2",
    title: "Late Night Coding",
    description: "Ambient and electronic tracks for focused work",
    spotify_url: "https://open.spotify.com/playlist/example2",
    embed: false,
    embed_url: null,
  },
];

export function MusicSection() {
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);

  const togglePlay = (trackId: string) => {
    setPlayingTrack(playingTrack === trackId ? null : trackId);
  };

  return (
    <section id="music" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full mb-4">
              <Headphones className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Audio Content</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="text-primary">Music</span> & Sounds
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Original beats, sound design experiments, and curated playlists that inspire my work.
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="tracks" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="tracks">My Tracks</TabsTrigger>
              <TabsTrigger value="playlists">Playlists</TabsTrigger>
            </TabsList>

            {/* Original Tracks */}
            <TabsContent value="tracks" className="space-y-4">
              {placeholderTracks.map((track) => (
                <Card key={track.id} className="overflow-hidden border-none shadow-card hover:shadow-soft transition-all">
                  <div className="flex items-center gap-4 p-4">
                    {/* Play Button */}
                    <Button
                      variant="outline"
                      size="icon"
                      className={cn(
                        "rounded-full shrink-0 w-12 h-12",
                        playingTrack === track.id && "gradient-accent text-primary-foreground"
                      )}
                      onClick={() => togglePlay(track.id)}
                    >
                      {playingTrack === track.id ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5 ml-0.5" />
                      )}
                    </Button>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{track.title}</h3>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {track.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {track.description}
                      </p>
                    </div>

                    {/* Duration */}
                    <span className="text-sm text-muted-foreground shrink-0">
                      {track.duration}
                    </span>

                    {/* Waveform placeholder */}
                    <div className="hidden md:flex items-center gap-0.5 h-8">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-1 rounded-full transition-all",
                            playingTrack === track.id ? "bg-primary" : "bg-muted-foreground/30"
                          )}
                          style={{
                            height: `${Math.random() * 24 + 8}px`,
                            animationDelay: `${i * 50}ms`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </Card>
              ))}

              {/* Note about audio */}
              <p className="text-center text-sm text-muted-foreground mt-8">
                <Music2 className="inline-block w-4 h-4 mr-1" />
                Audio playback will be available once tracks are uploaded in the admin panel.
              </p>
            </TabsContent>

            {/* Playlists */}
            <TabsContent value="playlists">
              <div className="grid md:grid-cols-2 gap-6">
                {placeholderPlaylists.map((playlist) => (
                  <Card key={playlist.id} className="overflow-hidden border-none shadow-card">
                    {playlist.embed ? (
                      <div className="aspect-[4/5] bg-muted">
                        <iframe
                          src={playlist.embed_url}
                          width="100%"
                          height="100%"
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                          className="border-0"
                        />
                      </div>
                    ) : (
                      <>
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center">
                              <Music2 className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{playlist.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {playlist.description}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardFooter>
                          <Button variant="outline" className="w-full" asChild>
                            <a
                              href={playlist.spotify_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Open in Spotify <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                          </Button>
                        </CardFooter>
                      </>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
