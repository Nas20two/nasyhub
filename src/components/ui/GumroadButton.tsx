import { ShoppingCart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GumroadButtonProps {
  url: string;
  price?: number;
  currency?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: React.ReactNode;
}

export function GumroadButton({
  url,
  price,
  currency = "USD",
  variant = "default",
  size = "md",
  className,
  children,
}: GumroadButtonProps) {
  const variants = {
    default: "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white",
    outline: "border-pink-500 text-pink-400 hover:bg-pink-500/10",
    ghost: "text-pink-400 hover:bg-pink-500/10",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className={cn(
        "inline-flex items-center gap-2 font-medium rounded-lg transition-all",
        variants[variant],
        sizes[size],
        className
      )}
    >
      <a href={url} target="_blank" rel="noopener noreferrer">
        <ShoppingCart className="w-4 h-4" />
        {children || (price ? `Buy $${price}` : "Buy Now")}
        <ExternalLink className="w-3 h-3 opacity-50" />
      </a>
    </Button>
  );
}

// Gumroad Embed for products
interface GumroadEmbedProps {
  url: string;
  className?: string;
}

export function GumroadEmbed({ url, className }: GumroadEmbedProps) {
  // Extract product ID from Gumroad URL
  const productId = url.split("/").pop()?.split("?")[0];
  
  if (!productId) return null;

  return (
    <div className={cn("w-full", className)}>
      <iframe
        src={`https://gumroad.com/l/${productId}?embed=true`}
        width="100%"
        height="480"
        frameBorder="0"
        allowTransparency
        className="rounded-xl"
        title="Gumroad Product"
      />
    </div>
  );
}
