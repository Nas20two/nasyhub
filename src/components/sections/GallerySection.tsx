import { useState, useEffect } from "react";
import { Image, X, ChevronLeft, ChevronRight, Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface GalleryImage {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  category_id: string | null;
  display_order: number | null;
  price: number | null;
  sale_url: string | null;
}

interface GalleryCategory {
  id: string;
  name: string;
  display_order: number | null;
}

export function GallerySection() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const [imagesRes, categoriesRes] = await Promise.all([
        supabase
          .from("gallery_images")
          .select("id, title, description, image_url, category_id, display_order, price, sale_url")
          .eq("is_active", true)
          .order("display_order", { ascending: true }),
        supabase
          .from("gallery_categories")
          .select("id, name, display_order")
          .order("display_order", { ascending: true }),
      ]);

      if (imagesRes.data) setImages(imagesRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const categoryNames = ["All", ...categories.map((c) => c.name)];

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null;
    return categories.find((c) => c.id === categoryId)?.name || null;
  };

  const filteredImages =
    activeCategory === "All"
      ? images
      : images.filter((img) => getCategoryName(img.category_id) === activeCategory);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const navigateLightbox = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentImageIndex((prev) => (prev === 0 ? filteredImages.length - 1 : prev - 1));
    } else {
      setCurrentImageIndex((prev) => (prev === filteredImages.length - 1 ? 0 : prev + 1));
    }
  };

  if (isLoading) {
    return (
      <section id="gallery" className="py-24">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (images.length === 0) {
    return (
      <section id="gallery" className="py-24">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Art <span className="text-primary">Gallery</span>
          </h2>
          <p className="text-muted-foreground mb-4">Digital artwork created with AI tools.</p>
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
            <Image className="w-12 h-12 mx-auto mb-3 text-slate-500" />
            <p className="text-slate-400">No artwork uploaded yet.</p>
            <p className="text-sm text-slate-500 mt-2">Add your digital art to Supabase to display here with buy buttons.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Art <span className="text-primary">Gallery</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A collection of my visual creations, from digital art to photography.
            </p>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {categoryNames.map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "rounded-full",
                    activeCategory === category && "gradient-accent"
                  )}
                >
                  {category}
                </Button>
              ))}
            </div>
          )}

          {/* Masonry Grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {filteredImages.map((image, index) => (
              <div
                key={image.id}
                className="break-inside-avoid group cursor-pointer"
                onClick={() => openLightbox(index)}
              >
                <div className="relative overflow-hidden rounded-xl shadow-card hover:shadow-soft transition-all duration-300" onContextMenu={(e) => e.preventDefault()}>
                  <img
                    src={image.image_url}
                    alt={image.title}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                    draggable={false}
                  />
                  {/* Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                    <span className="text-white/30 text-4xl font-display font-bold -rotate-12 tracking-widest">NaSy</span>
                  </div>
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-semibold mb-1">{image.title}</h3>
                      {image.description && (
                        <p className="text-sm text-white/80 mb-2">{image.description}</p>
                      )}
                      {image.sale_url && (
                        <a
                          href={image.sale_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-medium text-pink-400 hover:text-pink-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          {image.price ? `Buy $${image.price}` : "Buy Print"}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Lightbox */}
          <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
            <DialogContent className="max-w-5xl p-0 bg-black/95 border-none">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                  onClick={() => setLightboxOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                  onClick={() => navigateLightbox("prev")}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                  onClick={() => navigateLightbox("next")}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>

                <div className="aspect-video flex items-center justify-center p-8 relative" onContextMenu={(e) => e.preventDefault()}>
                  <img
                    src={filteredImages[currentImageIndex]?.image_url}
                    alt={filteredImages[currentImageIndex]?.title}
                    className="max-h-full max-w-full object-contain"
                    draggable={false}
                  />
                  {/* Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                    <span className="text-white/30 text-6xl font-display font-bold -rotate-12 tracking-widest">NaSy</span>
                  </div>
                </div>

                <div className="p-6 text-center text-white">
                  <h3 className="text-xl font-semibold mb-1">
                    {filteredImages[currentImageIndex]?.title}
                  </h3>
                  {filteredImages[currentImageIndex]?.description && (
                    <p className="text-white/70 mb-2">
                      {filteredImages[currentImageIndex]?.description}
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-2">
                    {filteredImages[currentImageIndex]?.category_id && (
                      <Badge variant="secondary">
                        {getCategoryName(filteredImages[currentImageIndex]?.category_id)}
                      </Badge>
                    )}
                    {filteredImages[currentImageIndex]?.sale_url && (
                      <a
                        href={filteredImages[currentImageIndex]?.sale_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium rounded-full transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {filteredImages[currentImageIndex]?.price 
                          ? `Buy $${filteredImages[currentImageIndex]?.price}` 
                          : "Buy Print"}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
}
