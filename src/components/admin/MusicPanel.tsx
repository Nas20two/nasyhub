import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, Upload, Music, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Track {
  id: string;
  title: string;
  description: string | null;
  audio_url: string | null;
  category: string | null;
  duration: string | null;
  is_active: boolean;
}

interface SpotifyPlaylist {
  id: string;
  title: string;
  description: string | null;
  spotify_url: string;
  embed_url: string | null;
  use_embed: boolean;
  is_active: boolean;
}

interface YouTubePlaylist {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  embed_url: string | null;
  is_active: boolean;
}

// Helper to convert YouTube URL to embed URL
const getYouTubeEmbedUrl = (url: string): string => {
  // Handle playlist URLs
  const playlistMatch = url.match(/[?&]list=([^&]+)/);
  if (playlistMatch) {
    return `https://www.youtube.com/embed/videoseries?list=${playlistMatch[1]}`;
  }
  // Handle video URLs
  const videoMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  if (videoMatch) {
    return `https://www.youtube.com/embed/${videoMatch[1]}`;
  }
  return "";
};

export function MusicPanel() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [youtubePlaylists, setYoutubePlaylists] = useState<YouTubePlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tracks");
  
  // Track dialog state
  const [isTrackDialogOpen, setIsTrackDialogOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [deleteTrackId, setDeleteTrackId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [trackFormData, setTrackFormData] = useState({
    title: "",
    description: "",
    audio_url: "",
    category: "Original Beats",
    duration: "",
    is_active: true,
  });

  // Spotify playlist dialog state
  const [isSpotifyDialogOpen, setIsSpotifyDialogOpen] = useState(false);
  const [editingSpotifyPlaylist, setEditingSpotifyPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [deleteSpotifyId, setDeleteSpotifyId] = useState<string | null>(null);
  const [spotifyFormData, setSpotifyFormData] = useState({
    title: "",
    description: "",
    spotify_url: "",
    embed_url: "",
    use_embed: false,
    is_active: true,
  });

  // YouTube playlist dialog state
  const [isYouTubeDialogOpen, setIsYouTubeDialogOpen] = useState(false);
  const [editingYouTubePlaylist, setEditingYouTubePlaylist] = useState<YouTubePlaylist | null>(null);
  const [deleteYouTubeId, setDeleteYouTubeId] = useState<string | null>(null);
  const [youtubeFormData, setYoutubeFormData] = useState({
    title: "",
    description: "",
    youtube_url: "",
    embed_url: "",
    is_active: true,
  });

  const fetchData = async () => {
    const [tracksRes, spotifyRes, youtubeRes] = await Promise.all([
      supabase.from("music_tracks").select("*").order("display_order", { ascending: true }),
      supabase.from("spotify_playlists").select("*").order("display_order", { ascending: true }),
      supabase.from("youtube_playlists").select("*").order("display_order", { ascending: true }),
    ]);

    if (!tracksRes.error) setTracks(tracksRes.data || []);
    if (!spotifyRes.error) setSpotifyPlaylists(spotifyRes.data || []);
    if (!youtubeRes.error) setYoutubePlaylists(youtubeRes.data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Audio file upload
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("audio")
      .upload(fileName, file);

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
    } else {
      const { data: urlData } = supabase.storage.from("audio").getPublicUrl(fileName);
      setTrackFormData({ ...trackFormData, audio_url: urlData.publicUrl });
      toast({ title: "Success", description: "Audio uploaded successfully" });
    }
    setUploading(false);
  };

  // Track CRUD
  const openCreateTrackDialog = () => {
    setEditingTrack(null);
    setTrackFormData({
      title: "",
      description: "",
      audio_url: "",
      category: "Original Beats",
      duration: "",
      is_active: true,
    });
    setIsTrackDialogOpen(true);
  };

  const openEditTrackDialog = (track: Track) => {
    setEditingTrack(track);
    setTrackFormData({
      title: track.title,
      description: track.description || "",
      audio_url: track.audio_url || "",
      category: track.category || "Original Beats",
      duration: track.duration || "",
      is_active: track.is_active,
    });
    setIsTrackDialogOpen(true);
  };

  const handleSaveTrack = async () => {
    const trackData = {
      title: trackFormData.title,
      description: trackFormData.description || null,
      audio_url: trackFormData.audio_url || null,
      category: trackFormData.category,
      duration: trackFormData.duration || null,
      is_active: trackFormData.is_active,
    };

    if (editingTrack) {
      const { error } = await supabase
        .from("music_tracks")
        .update(trackData)
        .eq("id", editingTrack.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Track updated" });
        fetchData();
        setIsTrackDialogOpen(false);
      }
    } else {
      const { error } = await supabase.from("music_tracks").insert({
        ...trackData,
        display_order: tracks.length,
      });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Track created" });
        fetchData();
        setIsTrackDialogOpen(false);
      }
    }
  };

  const handleDeleteTrack = async () => {
    if (!deleteTrackId) return;
    const { error } = await supabase.from("music_tracks").delete().eq("id", deleteTrackId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Track deleted" });
      fetchData();
    }
    setDeleteTrackId(null);
  };

  // Spotify CRUD
  const openCreateSpotifyDialog = () => {
    setEditingSpotifyPlaylist(null);
    setSpotifyFormData({
      title: "",
      description: "",
      spotify_url: "",
      embed_url: "",
      use_embed: false,
      is_active: true,
    });
    setIsSpotifyDialogOpen(true);
  };

  const openEditSpotifyDialog = (playlist: SpotifyPlaylist) => {
    setEditingSpotifyPlaylist(playlist);
    setSpotifyFormData({
      title: playlist.title,
      description: playlist.description || "",
      spotify_url: playlist.spotify_url,
      embed_url: playlist.embed_url || "",
      use_embed: playlist.use_embed,
      is_active: playlist.is_active,
    });
    setIsSpotifyDialogOpen(true);
  };

  const handleSaveSpotifyPlaylist = async () => {
    const playlistData = {
      title: spotifyFormData.title,
      description: spotifyFormData.description || null,
      spotify_url: spotifyFormData.spotify_url,
      embed_url: spotifyFormData.embed_url || null,
      use_embed: spotifyFormData.use_embed,
      is_active: spotifyFormData.is_active,
    };

    if (editingSpotifyPlaylist) {
      const { error } = await supabase
        .from("spotify_playlists")
        .update(playlistData)
        .eq("id", editingSpotifyPlaylist.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Playlist updated" });
        fetchData();
        setIsSpotifyDialogOpen(false);
      }
    } else {
      const { error } = await supabase.from("spotify_playlists").insert({
        ...playlistData,
        display_order: spotifyPlaylists.length,
      });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Playlist created" });
        fetchData();
        setIsSpotifyDialogOpen(false);
      }
    }
  };

  const handleDeleteSpotifyPlaylist = async () => {
    if (!deleteSpotifyId) return;
    const { error } = await supabase.from("spotify_playlists").delete().eq("id", deleteSpotifyId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Playlist deleted" });
      fetchData();
    }
    setDeleteSpotifyId(null);
  };

  // YouTube CRUD
  const openCreateYouTubeDialog = () => {
    setEditingYouTubePlaylist(null);
    setYoutubeFormData({
      title: "",
      description: "",
      youtube_url: "",
      embed_url: "",
      is_active: true,
    });
    setIsYouTubeDialogOpen(true);
  };

  const openEditYouTubeDialog = (playlist: YouTubePlaylist) => {
    setEditingYouTubePlaylist(playlist);
    setYoutubeFormData({
      title: playlist.title,
      description: playlist.description || "",
      youtube_url: playlist.youtube_url,
      embed_url: playlist.embed_url || "",
      is_active: playlist.is_active,
    });
    setIsYouTubeDialogOpen(true);
  };

  const handleYouTubeUrlChange = (url: string) => {
    const embedUrl = getYouTubeEmbedUrl(url);
    setYoutubeFormData({ ...youtubeFormData, youtube_url: url, embed_url: embedUrl });
  };

  const handleSaveYouTubePlaylist = async () => {
    const playlistData = {
      title: youtubeFormData.title,
      description: youtubeFormData.description || null,
      youtube_url: youtubeFormData.youtube_url,
      embed_url: youtubeFormData.embed_url || null,
      is_active: youtubeFormData.is_active,
    };

    if (editingYouTubePlaylist) {
      const { error } = await supabase
        .from("youtube_playlists")
        .update(playlistData)
        .eq("id", editingYouTubePlaylist.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "YouTube playlist updated" });
        fetchData();
        setIsYouTubeDialogOpen(false);
      }
    } else {
      const { error } = await supabase.from("youtube_playlists").insert({
        ...playlistData,
        display_order: youtubePlaylists.length,
      });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "YouTube playlist created" });
        fetchData();
        setIsYouTubeDialogOpen(false);
      }
    }
  };

  const handleDeleteYouTubePlaylist = async () => {
    if (!deleteYouTubeId) return;
    const { error } = await supabase.from("youtube_playlists").delete().eq("id", deleteYouTubeId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "YouTube playlist deleted" });
      fetchData();
    }
    setDeleteYouTubeId(null);
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading music...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Music</h1>
          <p className="text-muted-foreground">Manage your tracks and playlists</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="tracks">My Tracks</TabsTrigger>
          <TabsTrigger value="spotify">Spotify Playlists</TabsTrigger>
          <TabsTrigger value="youtube">YouTube Playlists</TabsTrigger>
        </TabsList>

        {/* Tracks Tab */}
        <TabsContent value="tracks">
          <div className="flex justify-end mb-4">
            <Button onClick={openCreateTrackDialog} className="gradient-accent">
              <Plus className="h-4 w-4 mr-2" />
              Add Track
            </Button>
          </div>

          {tracks.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">No tracks yet</p>
                <Button onClick={openCreateTrackDialog} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add your first track
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {tracks.map((track) => (
                <Card key={track.id} className={!track.is_active ? "opacity-60" : ""}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <Music className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{track.title}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">
                          {track.category}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {track.description || "No description"} • {track.duration || "0:00"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditTrackDialog(track)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => setDeleteTrackId(track.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Spotify Tab */}
        <TabsContent value="spotify">
          <div className="flex justify-end mb-4">
            <Button onClick={openCreateSpotifyDialog} className="gradient-accent">
              <Plus className="h-4 w-4 mr-2" />
              Add Spotify Playlist
            </Button>
          </div>

          {spotifyPlaylists.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">No Spotify playlists yet</p>
                <Button onClick={openCreateSpotifyDialog} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add your first playlist
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {spotifyPlaylists.map((playlist) => (
                <Card key={playlist.id} className={!playlist.is_active ? "opacity-60" : ""}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <span className="text-2xl">🎵</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{playlist.title}</h3>
                        {playlist.use_embed && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">
                            Embedded
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {playlist.description || "No description"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <a href={playlist.spotify_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditSpotifyDialog(playlist)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => setDeleteSpotifyId(playlist.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* YouTube Tab */}
        <TabsContent value="youtube">
          <div className="flex justify-end mb-4">
            <Button onClick={openCreateYouTubeDialog} className="gradient-accent">
              <Plus className="h-4 w-4 mr-2" />
              Add YouTube Playlist
            </Button>
          </div>

          {youtubePlaylists.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">No YouTube playlists yet</p>
                <Button onClick={openCreateYouTubeDialog} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add your first YouTube playlist
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {youtubePlaylists.map((playlist) => (
                <Card key={playlist.id} className={!playlist.is_active ? "opacity-60" : ""}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <span className="text-2xl">▶️</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{playlist.title}</h3>
                        {playlist.embed_url && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">
                            Embedded
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {playlist.description || "No description"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <a href={playlist.youtube_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditYouTubeDialog(playlist)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => setDeleteYouTubeId(playlist.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Track Dialog */}
      <Dialog open={isTrackDialogOpen} onOpenChange={setIsTrackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTrack ? "Edit Track" : "Add New Track"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={trackFormData.title}
                onChange={(e) => setTrackFormData({ ...trackFormData, title: e.target.value })}
                placeholder="Track title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={trackFormData.description}
                onChange={(e) => setTrackFormData({ ...trackFormData, description: e.target.value })}
                placeholder="Brief description"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Audio File</Label>
              <div className="flex gap-2">
                <Input
                  value={trackFormData.audio_url}
                  onChange={(e) => setTrackFormData({ ...trackFormData, audio_url: e.target.value })}
                  placeholder="Audio URL or upload"
                  className="flex-1"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? "..." : <Upload className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={trackFormData.category}
                  onValueChange={(value) => setTrackFormData({ ...trackFormData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Original Beats">Original Beats</SelectItem>
                    <SelectItem value="Sound Design">Sound Design</SelectItem>
                    <SelectItem value="Samples">Samples</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={trackFormData.duration}
                  onChange={(e) => setTrackFormData({ ...trackFormData, duration: e.target.value })}
                  placeholder="3:24"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={trackFormData.is_active}
                onCheckedChange={(checked) => setTrackFormData({ ...trackFormData, is_active: checked })}
              />
              <Label htmlFor="is_active">Visible on portfolio</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTrackDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTrack} className="gradient-accent">
              {editingTrack ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Spotify Playlist Dialog */}
      <Dialog open={isSpotifyDialogOpen} onOpenChange={setIsSpotifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSpotifyPlaylist ? "Edit Playlist" : "Add Spotify Playlist"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="spotify-title">Title</Label>
              <Input
                id="spotify-title"
                value={spotifyFormData.title}
                onChange={(e) => setSpotifyFormData({ ...spotifyFormData, title: e.target.value })}
                placeholder="Playlist title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spotify-description">Description</Label>
              <Textarea
                id="spotify-description"
                value={spotifyFormData.description}
                onChange={(e) => setSpotifyFormData({ ...spotifyFormData, description: e.target.value })}
                placeholder="Brief description"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spotify_url">Spotify URL</Label>
              <Input
                id="spotify_url"
                value={spotifyFormData.spotify_url}
                onChange={(e) => setSpotifyFormData({ ...spotifyFormData, spotify_url: e.target.value })}
                placeholder="https://open.spotify.com/playlist/..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="use_embed"
                checked={spotifyFormData.use_embed}
                onCheckedChange={(checked) => setSpotifyFormData({ ...spotifyFormData, use_embed: checked })}
              />
              <Label htmlFor="use_embed">Use embedded player</Label>
            </div>
            {spotifyFormData.use_embed && (
              <div className="space-y-2">
                <Label htmlFor="embed_url">Embed URL</Label>
                <Input
                  id="embed_url"
                  value={spotifyFormData.embed_url}
                  onChange={(e) => setSpotifyFormData({ ...spotifyFormData, embed_url: e.target.value })}
                  placeholder="https://open.spotify.com/embed/playlist/..."
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <Switch
                id="spotify-is_active"
                checked={spotifyFormData.is_active}
                onCheckedChange={(checked) => setSpotifyFormData({ ...spotifyFormData, is_active: checked })}
              />
              <Label htmlFor="spotify-is_active">Visible on portfolio</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSpotifyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSpotifyPlaylist} className="gradient-accent">
              {editingSpotifyPlaylist ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* YouTube Playlist Dialog */}
      <Dialog open={isYouTubeDialogOpen} onOpenChange={setIsYouTubeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingYouTubePlaylist ? "Edit YouTube Playlist" : "Add YouTube Playlist"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="youtube-title">Title</Label>
              <Input
                id="youtube-title"
                value={youtubeFormData.title}
                onChange={(e) => setYoutubeFormData({ ...youtubeFormData, title: e.target.value })}
                placeholder="Playlist title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube-description">Description</Label>
              <Textarea
                id="youtube-description"
                value={youtubeFormData.description}
                onChange={(e) => setYoutubeFormData({ ...youtubeFormData, description: e.target.value })}
                placeholder="Brief description"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube_url">YouTube URL</Label>
              <Input
                id="youtube_url"
                value={youtubeFormData.youtube_url}
                onChange={(e) => handleYouTubeUrlChange(e.target.value)}
                placeholder="https://www.youtube.com/playlist?list=..."
              />
              <p className="text-xs text-muted-foreground">
                Paste a YouTube playlist or video URL. The embed URL will be generated automatically.
              </p>
            </div>
            {youtubeFormData.embed_url && (
              <div className="space-y-2">
                <Label htmlFor="youtube-embed_url">Embed URL (auto-generated)</Label>
                <Input
                  id="youtube-embed_url"
                  value={youtubeFormData.embed_url}
                  onChange={(e) => setYoutubeFormData({ ...youtubeFormData, embed_url: e.target.value })}
                  placeholder="https://www.youtube.com/embed/..."
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <Switch
                id="youtube-is_active"
                checked={youtubeFormData.is_active}
                onCheckedChange={(checked) => setYoutubeFormData({ ...youtubeFormData, is_active: checked })}
              />
              <Label htmlFor="youtube-is_active">Visible on portfolio</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsYouTubeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveYouTubePlaylist} className="gradient-accent">
              {editingYouTubePlaylist ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmations */}
      <AlertDialog open={!!deleteTrackId} onOpenChange={() => setDeleteTrackId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete track?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTrack} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteSpotifyId} onOpenChange={() => setDeleteSpotifyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Spotify playlist?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSpotifyPlaylist} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteYouTubeId} onOpenChange={() => setDeleteYouTubeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete YouTube playlist?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteYouTubePlaylist} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
