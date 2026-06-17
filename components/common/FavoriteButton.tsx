"use client";

import * as React from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useFavorites,
  useSaveFavorite,
  useRemoveFavorite,
} from "@/features/favorites/queries/favorite.queries";

interface FavoriteButtonProps {
  listingId: string;
  className?: string;
}

export function FavoriteButton({ listingId, className }: FavoriteButtonProps) {
  const { data: favorites = [] } = useFavorites();
  const { mutate: save, isPending: saving } = useSaveFavorite();
  const { mutate: remove, isPending: removing } = useRemoveFavorite();

  const isSaved = favorites.some((p) => p.id === listingId);
  const isPending = saving || removing;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPending) return;
    isSaved ? remove(listingId) : save(listingId);
  };

  return (
    <button
      onClick={handleClick}
      aria-pressed={isSaved}
      aria-label={isSaved ? "Remove from saved" : "Save listing"}
      disabled={isPending}
      className={cn(
        "inline-flex items-center justify-center p-2 rounded-full bg-white/80 shadow backdrop-blur-sm transition-all",
        "hover:bg-white hover:scale-110 disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      )}
    >
      <Heart
        className={cn(
          "w-4 h-4 transition-colors",
          isSaved ? "text-rose-500 fill-rose-500" : "text-slate-400",
        )}
      />
    </button>
  );
}

export default FavoriteButton;
