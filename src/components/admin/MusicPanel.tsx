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

interface Playlist {
  id: string;
  title: string;
  description: string | null;
  spotify_url: string;
  embed_url: string | null;
  use_embed: boolean;
  is_active: boolean;
}

export function MusicPanel() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
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

  // Playlist dialog state
  const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [deletePlaylistId, setDeletePlaylistId] = useState<string | null>(null);
  const [playlistFormData, setPlaylistFormData] = useState({
    title: "",
    description: "",
    spotify_url: "",
    embed_url: "",
    use_embed: false,
    is_active: true,
  });

  const fetchData = async () => {
    const [tracksRes, playlistsRes] = await Promise.all([
      supabase.from("music_tracks").select("*").order("display_order", { ascending: true }),
      supabase.from("spotify_playlists").select("*").order("display_order", { ascending: true }),
    ]);

    if (!tracksRes.error) setTracks(tracksRes.data || []);
    if (!playlistsRes.error) setPlaylists(playlistsRes.data || []);
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

  // Playlist CRUD
  const openCreatePlaylistDialog = () => {
    setEditingPlaylist(null);
    setPlaylistFormData({
      title: "",
      description: "",
      spotify_url: "",
      embed_url: "",
      use_embed: false,
      is_active: true,
    });
    setIsPlaylistDialogOpen(true);
  };

  const openEditPlaylistDialog = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    setPlaylistFormData({
      title: playlist.title,
      description: playlist.description || "",
      spotify_url: playlist.spotify_url,
      embed_url: playlist.embed_url || "",
      use_embed: playlist.use_embed,
      is_active: playlist.is_active,
    });
    setIsPlaylistDialogOpen(true);
  };

  const handleSavePlaylist = async () => {
    const playlistData = {
      title: playlistFormData.title,
      description: playlistFormData.description || null,
      spotify_url: playlistFormData.spotify_url,
      embed_url: playlistFormData.embed_url || null,
      use_embed: playlistFormData.use_embed,
      is_active: playlistFormData.is_active,
    };

    if (editingPlaylist) {
      const { error } = await supabase
        .from("spotify_playlists")
        .update(playlistData)
        .eq("id", editingPlaylist.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Playlist updated" });
        fetchData();
        setIsPlaylistDialogOpen(false);
      }
    } else {
      const { error } = await supabase.from("spotify_playlists").insert({
        ...playlistData,
        display_order: playlists.length,
      });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Playlist created" });
        fetchData();
        setIsPlaylistDialogOpen(false);
      }
    }
  };

  const handleDeletePlaylist = async () => {
    if (!deletePlaylistId) return;
    const { error } = await supabase.from("spotify_playlists").delete().eq("id", deletePlaylistId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Playlist deleted" });
      fetchData();
    }
    setDeletePlaylistId(null);
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
          <TabsTrigger value="playlists">Spotify Playlists</TabsTrigger>
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

        {/* Playlists Tab */}
        <TabsContent value="playlists">
          <div className="flex justify-end mb-4">
            <Button onClick={openCreatePlaylistDialog} className="gradient-accent">
              <Plus className="h-4 w-4 mr-2" />
              Add Playlist
            </Button>
          </div>

          {playlists.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">No playlists yet</p>
                <Button onClick={openCreatePlaylistDialog} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add your first playlist
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {playlists.map((playlist) => (
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
                      <Button variant="ghost" size="icon" onClick={() => openEditPlaylistDialog(playlist)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => setDeletePlaylistId(playlist.id)}
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

      {/* Playlist Dialog */}
      <Dialog open={isPlaylistDialogOpen} onOpenChange={setIsPlaylistDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPlaylist ? "Edit Playlist" : "Add Spotify Playlist"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={playlistFormData.title}
                onChange={(e) => setPlaylistFormData({ ...playlistFormData, title: e.target.value })}
                placeholder="Playlist title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={playlistFormData.description}
                onChange={(e) => setPlaylistFormData({ ...playlistFormData, description: e.target.value })}
                placeholder="Brief description"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spotify_url">Spotify URL</Label>
              <Input
                id="spotify_url"
                value={playlistFormData.spotify_url}
                onChange={(e) => setPlaylistFormData({ ...playlistFormData, spotify_url: e.target.value })}
                placeholder="https://open.spotify.com/playlist/..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="use_embed"
                checked={playlistFormData.use_embed}
                onCheckedChange={(checked) => setPlaylistFormData({ ...playlistFormData, use_embed: checked })}
              />
              <Label htmlFor="use_embed">Use embedded player</Label>
            </div>
            {playlistFormData.use_embed && (
              <div className="space-y-2">
                <Label htmlFor="embed_url">Embed URL</Label>
                <Input
                  id="embed_url"
                  value={playlistFormData.embed_url}
                  onChange={(e) => setPlaylistFormData({ ...playlistFormData, embed_url: e.target.value })}
                  placeholder="https://open.spotify.com/embed/playlist/..."
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={playlistFormData.is_active}
                onCheckedChange={(checked) => setPlaylistFormData({ ...playlistFormData, is_active: checked })}
              />
              <Label htmlFor="is_active">Visible on portfolio</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPlaylistDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePlaylist} className="gradient-accent">
              {editingPlaylist ? "Update" : "Create"}
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

      <AlertDialog open={!!deletePlaylistId} onOpenChange={() => setDeletePlaylistId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete playlist?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlaylist} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
