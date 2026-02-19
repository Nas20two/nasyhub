import { useState, useEffect } from "react";
import { Play, Pause, Music2, ExternalLink, Headphones, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Track {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  audio_url: string | null;
  duration: string | null;
  price: number | null;
  sale_url: string | null;
}

interface SoundCloudPlaylist {
  id: string;
  title: string;
  description: string | null;
  soundcloud_url: string;
  embed_url: string | null;
  use_embed: boolean | null;
}

interface YouTubePlaylist {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  embed_url: string | null;
}

export function MusicSection() {
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [soundcloudPlaylists, setSoundcloudPlaylists] = useState<SoundCloudPlaylist[]>([]);
  const [youtubePlaylists, setYoutubePlaylists] = useState<YouTubePlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [tracksRes, soundcloudRes, youtubeRes] = await Promise.all([
        supabase.from("music_tracks").select("id, title, description, category, audio_url, duration, price, sale_url").eq("is_active", true).order("display_order"),
        supabase.from("soundcloud_playlists").select("*").eq("is_active", true).order("display_order") as any,
        supabase.from("youtube_playlists").select("*").eq("is_active", true).order("display_order"),
      ]);

      if (!tracksRes.error) setTracks(tracksRes.data || []);
      if (!soundcloudRes.error) setSoundcloudPlaylists(soundcloudRes.data || []);
      if (!youtubeRes.error) setYoutubePlaylists(youtubeRes.data || []);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const togglePlay = (track: Track) => {
    if (!track.audio_url) return;

    if (playingTrack === track.id) {
      audioRef?.pause();
      setPlayingTrack(null);
    } else {
      if (audioRef) audioRef.pause();
      const audio = new Audio(track.audio_url);
      audio.play();
      audio.onended = () => setPlayingTrack(null);
      setAudioRef(audio);
      setPlayingTrack(track.id);
    }
  };

  // Show placeholder content if no data from database
  const displayTracks = tracks.length > 0 ? tracks : [
    { id: "1", title: "Summer Vibes", description: "Chill lo-fi beat perfect for relaxation", category: "Original Beats", audio_url: null, duration: "3:24" },
    { id: "2", title: "Urban Nights", description: "Dark trap instrumental with atmospheric elements", category: "Original Beats", audio_url: null, duration: "2:58" },
  ];

  const hasSoundcloudPlaylists = soundcloudPlaylists.length > 0;
  const hasYoutubePlaylists = youtubePlaylists.length > 0;

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
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="tracks">My Tracks</TabsTrigger>
              <TabsTrigger value="soundcloud">SoundCloud</TabsTrigger>
              <TabsTrigger value="youtube">YouTube</TabsTrigger>
            </TabsList>

            {/* Original Tracks */}
            <TabsContent value="tracks" className="space-y-4" onContextMenu={(e) => e.preventDefault()}>
              <p className="text-center text-xs text-muted-foreground italic mb-2">
                🎧 Streaming only — downloads not available
              </p>
              {displayTracks.map((track) => (
                <Card key={track.id} className="overflow-hidden border-none shadow-card hover:shadow-soft transition-all">
                  <div className="flex items-center gap-4 p-4">
                    {/* Play Button */}
                    <Button
                      variant="outline"
                      size="icon"
                      className={cn(
                        "rounded-full shrink-0 w-12 h-12",
                        playingTrack === track.id && "gradient-accent text-primary-foreground",
                        !track.audio_url && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => togglePlay(track)}
                      disabled={!track.audio_url}
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

                    {/* Buy Button */}
                    {track.sale_url && (
                      <a
                        href={track.sale_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 text-sm font-medium rounded-lg transition-colors shrink-0"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {track.price ? `$${track.price}` : "Buy"}
                      </a>
                    )}

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

              {tracks.length === 0 && (
                <p className="text-center text-sm text-muted-foreground mt-8">
                  <Music2 className="inline-block w-4 h-4 mr-1" />
                  Audio playback will be available once tracks are uploaded in the admin panel.
                </p>
              )}
            </TabsContent>

            {/* SoundCloud Playlists */}
            <TabsContent value="soundcloud">
              {!hasSoundcloudPlaylists ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Music2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No SoundCloud playlists added yet.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {soundcloudPlaylists.map((playlist) => (
                    <Card key={playlist.id} className="overflow-hidden border-none shadow-card">
                      {playlist.use_embed && playlist.embed_url ? (
                        <div className="aspect-video bg-muted">
                          <iframe
                            src={playlist.embed_url}
                            width="100%"
                            height="100%"
                            allow="autoplay"
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
                                href={playlist.soundcloud_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Open in SoundCloud <ExternalLink className="ml-2 h-4 w-4" />
                              </a>
                            </Button>
                          </CardFooter>
                        </>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* YouTube Playlists */}
            <TabsContent value="youtube">
              {!hasYoutubePlaylists ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Music2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No YouTube playlists added yet.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {youtubePlaylists.map((playlist) => (
                    <Card key={playlist.id} className="overflow-hidden border-none shadow-card">
                      {playlist.embed_url ? (
                        <div className="aspect-video bg-muted">
                          <iframe
                            src={playlist.embed_url}
                            width="100%"
                            height="100%"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                            className="border-0"
                          />
                        </div>
                      ) : (
                        <>
                          <CardHeader>
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-destructive/20 to-accent flex items-center justify-center">
                                <span className="text-2xl">▶️</span>
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
                                href={playlist.youtube_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Open in YouTube <ExternalLink className="ml-2 h-4 w-4" />
                              </a>
                            </Button>
                          </CardFooter>
                        </>
                      )}
                      {playlist.embed_url && (
                        <CardFooter className="pt-0">
                          <div className="w-full">
                            <h3 className="font-semibold mb-1">{playlist.title}</h3>
                            {playlist.description && (
                              <p className="text-sm text-muted-foreground">{playlist.description}</p>
                            )}
                          </div>
                        </CardFooter>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
