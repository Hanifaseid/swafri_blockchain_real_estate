'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Crosshair, Loader2, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import type * as Leaflet from 'leaflet';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { reverseGeocode } from '@/features/listings/services/listing.service';
import type { ReverseGeocodeResult } from '@/features/listings/types/listing.types';

type PickedCoordinates = { lng: number; lat: number };

interface ListingLocationPickerProps {
  coords: PickedCoordinates | null;
  onPick: (coords: PickedCoordinates, result?: ReverseGeocodeResult | null) => void;
  className?: string;
}

const DEFAULT_CENTER: [number, number] = [8.9806, 38.7578];

export function ListingLocationPicker({ coords, onPick, className }: ListingLocationPickerProps) {
  const [locating, setLocating] = useState(false);
  const [resolving, setResolving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<typeof import('leaflet') | null>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const markerRef = useRef<Leaflet.Marker | null>(null);
  const onPickRef = useRef(onPick);
  const initialCoordsRef = useRef(coords);

  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);

  const placeMarker = useCallback((lat: number, lng: number, zoom = 15) => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;

    map.setView([lat, lng], zoom);
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      return;
    }

    markerRef.current = L.marker([lat, lng]).addTo(map);
  }, []);

  const pickPoint = useCallback(
    async (lat: number, lng: number) => {
      placeMarker(lat, lng);
      onPickRef.current({ lat, lng });
      setResolving(true);

      try {
        const result = await reverseGeocode(lat, lng);
        onPickRef.current({ lat, lng }, result);
      } finally {
        setResolving(false);
      }
    },
    [placeMarker],
  );

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      if (!containerRef.current || mapRef.current) return;

      const L = await import('leaflet');
      if (cancelled || !containerRef.current || mapRef.current) return;

      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      leafletRef.current = L;
      const initialCoords = initialCoordsRef.current;
      const initialCenter: [number, number] = initialCoords ? [initialCoords.lat, initialCoords.lng] : DEFAULT_CENTER;
      const map = L.map(containerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView(initialCenter, initialCoords ? 15 : 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      map.on('click', (event: Leaflet.LeafletMouseEvent) => {
        void pickPoint(event.latlng.lat, event.latlng.lng);
      });

      mapRef.current = map;
      if (initialCoords) placeMarker(initialCoords.lat, initialCoords.lng);

      window.setTimeout(() => map.invalidateSize(), 120);
    }

    void initMap();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
      leafletRef.current = null;
    };
  }, [pickPoint, placeMarker]);

  useEffect(() => {
    if (!coords) return;
    placeMarker(coords.lat, coords.lng);
  }, [coords, placeMarker]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        void pickPoint(latitude, longitude).finally(() => setLocating(false));
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className={cn('overflow-hidden rounded-xl border border-border-primary bg-surface-highlight', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-secondary px-3 py-3">
        <div className="flex min-w-0 items-center gap-2 text-sm text-white">
          <MapPin size={16} className="shrink-0 text-accent-400" />
          <span className="font-semibold">Pin the property on the map</span>
          {resolving && (
            <span className="inline-flex items-center gap-1 text-xs text-text-muted">
              <Loader2 size={12} className="animate-spin" />
              resolving address
            </span>
          )}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleUseCurrentLocation}
          loading={locating}
          disabled={locating}
        >
          <Crosshair size={14} />
          Use my location
        </Button>
      </div>
      <div ref={containerRef} className="h-[320px] w-full" />
    </div>
  );
}
