import { useState } from "react";
import { Image, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Placeholder data - will be replaced with database content
const placeholderCategories = ["All", "Digital Art", "Photography", "Illustrations"];

const placeholderImages = [
  { id: "1", title: "Abstract Waves", description: "Digital art exploration", category: "Digital Art", image_url: null },
  { id: "2", title: "Urban Sunset", description: "Street photography", category: "Photography", image_url: null },
  { id: "3", title: "Character Study", description: "Illustration work", category: "Illustrations", image_url: null },
  { id: "4", title: "Geometric Dreams", description: "Abstract composition", category: "Digital Art", image_url: null },
  { id: "5", title: "Nature's Light", description: "Landscape capture", category: "Photography", image_url: null },
  { id: "6", title: "Fantasy World", description: "Concept illustration", category: "Illustrations", image_url: null },
];

export function GallerySection() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const filteredImages = activeCategory === "All"
    ? placeholderImages
    : placeholderImages.filter((img) => img.category === activeCategory);

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
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {placeholderCategories.map((category) => (
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

          {/* Masonry Grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {filteredImages.map((image, index) => (
              <div
                key={image.id}
                className="break-inside-avoid group cursor-pointer"
                onClick={() => openLightbox(index)}
              >
                <div className="relative overflow-hidden rounded-xl shadow-card hover:shadow-soft transition-all duration-300">
                  {/* Image placeholder */}
                  <div 
                    className="aspect-square bg-gradient-to-br from-secondary to-accent flex items-center justify-center"
                    style={{ aspectRatio: index % 3 === 0 ? "4/5" : index % 2 === 0 ? "1/1" : "4/3" }}
                  >
                    {image.image_url ? (
                      <img
                        src={image.image_url}
                        alt={image.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image className="w-12 h-12 text-muted-foreground/30" />
                    )}
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-semibold mb-1">{image.title}</h3>
                      <p className="text-sm text-white/80">{image.description}</p>
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
                {/* Close button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                  onClick={() => setLightboxOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>

                {/* Navigation */}
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

                {/* Image */}
                <div className="aspect-video flex items-center justify-center p-8">
                  {filteredImages[currentImageIndex]?.image_url ? (
                    <img
                      src={filteredImages[currentImageIndex].image_url}
                      alt={filteredImages[currentImageIndex].title}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted/20 rounded-lg flex items-center justify-center">
                      <Image className="w-24 h-24 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                {/* Caption */}
                <div className="p-6 text-center text-white">
                  <h3 className="text-xl font-semibold mb-1">
                    {filteredImages[currentImageIndex]?.title}
                  </h3>
                  <p className="text-white/70">
                    {filteredImages[currentImageIndex]?.description}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    {filteredImages[currentImageIndex]?.category}
                  </Badge>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
}
