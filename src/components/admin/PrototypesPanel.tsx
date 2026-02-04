import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Prototype {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  prototype_url: string | null;
  status: string | null;
  display_order: number;
  is_active: boolean;
}

export function PrototypesPanel() {
  const { toast } = useToast();
  const [prototypes, setPrototypes] = useState<Prototype[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrototype, setEditingPrototype] = useState<Prototype | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
    prototype_url: "",
    status: "Prototype",
    is_active: true,
  });

  const fetchPrototypes = async () => {
    const { data, error } = await supabase
      .from("prototypes")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setPrototypes(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPrototypes();
  }, []);

  const openCreateDialog = () => {
    setEditingPrototype(null);
    setFormData({
      name: "",
      description: "",
      image_url: "",
      prototype_url: "",
      status: "Prototype",
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (prototype: Prototype) => {
    setEditingPrototype(prototype);
    setFormData({
      name: prototype.name,
      description: prototype.description || "",
      image_url: prototype.image_url || "",
      prototype_url: prototype.prototype_url || "",
      status: prototype.status || "Prototype",
      is_active: prototype.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const prototypeData = {
      name: formData.name,
      description: formData.description || null,
      image_url: formData.image_url || null,
      prototype_url: formData.prototype_url || null,
      status: formData.status,
      is_active: formData.is_active,
    };

    if (editingPrototype) {
      const { error } = await supabase
        .from("prototypes")
        .update(prototypeData)
        .eq("id", editingPrototype.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Prototype updated successfully" });
        fetchPrototypes();
        setIsDialogOpen(false);
      }
    } else {
      const { error } = await supabase.from("prototypes").insert({
        ...prototypeData,
        display_order: prototypes.length,
      });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Prototype created successfully" });
        fetchPrototypes();
        setIsDialogOpen(false);
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase.from("prototypes").delete().eq("id", deleteId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Prototype deleted successfully" });
      fetchPrototypes();
    }
    setDeleteId(null);
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading prototypes...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">AI Prototypes</h1>
          <p className="text-muted-foreground">Manage your AI experiments</p>
        </div>
        <Button onClick={openCreateDialog} className="gradient-accent">
          <Plus className="h-4 w-4 mr-2" />
          Add Prototype
        </Button>
      </div>

      {prototypes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No prototypes yet</p>
            <Button onClick={openCreateDialog} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add your first prototype
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {prototypes.map((prototype) => (
            <Card key={prototype.id} className={!prototype.is_active ? "opacity-60" : ""}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  {prototype.image_url ? (
                    <img
                      src={prototype.image_url}
                      alt={prototype.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-2xl">🤖</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{prototype.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">
                      {prototype.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {prototype.description || "No description"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {prototype.prototype_url && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={prototype.prototype_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(prototype)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => setDeleteId(prototype.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPrototype ? "Edit Prototype" : "Add New Prototype"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Prototype name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What does this prototype do?"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prototype_url">Prototype URL</Label>
              <Input
                id="prototype_url"
                value={formData.prototype_url}
                onChange={(e) => setFormData({ ...formData, prototype_url: e.target.value })}
                placeholder="https://aistudio.google.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Input
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                placeholder="Prototype, Active, Beta, etc."
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Visible on portfolio</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="gradient-accent">
              {editingPrototype ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the prototype.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
