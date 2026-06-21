'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Crosshair,
  Minus,
  Navigation,
  PencilLine,
  Plus,
  Trash2,
  Undo2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ListingCluster } from '@/features/listings/types/listing.types';

// Fix for default marker icons in Leaflet with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export type MapSearchMode = 'viewport' | 'radius' | 'polygon';

interface PropertyMapProps {
  center: [number, number]; // [lat, lng]
  zoom?: number;
  mode: MapSearchMode;
  radius?: number; // in meters
  polygon?: [number, number][];
  onViewportChange?: (bounds: { swLng: number; swLat: number; neLng: number; neLat: number; zoom: number }) => void;
  onRadiusChange?: (center: [number, number], radius: number) => void;
  onPolygonChange?: (polygon: [number, number][]) => void;
  listings?: Array<{ id: string; lat: number; lng: number; title: string; price: number }>;
  clusters?: ListingCluster[];
  onListingClick?: (id: string) => void;
  onClusterClick?: (cluster: ListingCluster) => void;
}

// ── Dark-themed popup HTML builder ──────────────────────────────────────────
function popupHtml(content: string) {
  return `<div class="map-popup-dark">${content}</div>`;
}

export function PropertyMap({
  center = [8.9806, 38.7578], // Default to Addis Ababa
  zoom = 13,
  mode,
  radius = 5000,
  polygon,
  onViewportChange,
  onRadiusChange,
  onPolygonChange,
  listings = [],
  clusters = [],
  onListingClick,
  onClusterClick,
}: PropertyMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const circleRef = useRef<L.Circle | null>(null);
  const polygonLayerRef = useRef<L.Polyline | L.Polygon | null>(null);
  const drawingModeRef = useRef<'polygon' | null>(null);
  const polygonPointsRef = useRef<[number, number][]>([]);
  const tempMarkersRef = useRef<L.CircleMarker[]>([]);
  const centerMarkerRef = useRef<L.Marker | null>(null);

  // Stable refs for callbacks so the init effect doesn't re-run
  const modeRef = useRef(mode);
  const onViewportChangeRef = useRef(onViewportChange);
  const onRadiusChangeRef = useRef(onRadiusChange);
  const onPolygonChangeRef = useRef(onPolygonChange);
  const radiusRef = useRef(radius);
  modeRef.current = mode;
  onViewportChangeRef.current = onViewportChange;
  onRadiusChangeRef.current = onRadiusChange;
  onPolygonChangeRef.current = onPolygonChange;
  radiusRef.current = radius;

  const [mapReady, setMapReady] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // ── Map initialization (runs once) ─────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const container = mapContainerRef.current;
    container.style.height = '100%';
    container.style.width = '100%';

    // Initialize with zoom control DISABLED — we provide our own
    const map = L.map(container, {
      zoomControl: false,
      attributionControl: false, // We'll add a custom one
    }).setView(center, zoom);

    // Standard OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Minimal attribution in bottom-right
    L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

    mapRef.current = map;

    // Force correct sizing
    setTimeout(() => {
      map.invalidateSize();
      setMapReady(true);
    }, 150);

    // Resize observer for flex/grid layout shifts
    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(container);

    // Viewport change handler — uses refs so it always reads current mode
    const handleMoveEnd = () => {
      if (modeRef.current === 'viewport' && onViewportChangeRef.current) {
        const bounds = map.getBounds();
        onViewportChangeRef.current({
          swLng: bounds.getWest(),
          swLat: bounds.getSouth(),
          neLng: bounds.getEast(),
          neLat: bounds.getNorth(),
          zoom: map.getZoom(),
        });
      }
    };

    map.on('moveend', handleMoveEnd);
    map.on('zoomend', handleMoveEnd);

    // Click handler — polygon drawing or radius center
    map.on('click', (e) => {
      if (drawingModeRef.current === 'polygon') {
        const point: [number, number] = [e.latlng.lng, e.latlng.lat];
        polygonPointsRef.current.push(point);

        // Vertex dot
        const marker = L.circleMarker([point[1], point[0]], {
          radius: 5,
          color: '#34d399',
          fillColor: '#10b981',
          fillOpacity: 1,
          weight: 2,
        }).addTo(map);
        tempMarkersRef.current.push(marker);

        // Progressive polyline
        if (polygonPointsRef.current.length > 1) {
          const points = polygonPointsRef.current.map(p => [p[1], p[0]] as L.LatLngExpression);
          if (polygonLayerRef.current) map.removeLayer(polygonLayerRef.current);
          polygonLayerRef.current = L.polyline(points, {
            color: '#10b981',
            weight: 2,
            dashArray: '6 4',
          }).addTo(map);
        }
      } else if (modeRef.current === 'radius' && onRadiusChangeRef.current) {
        const newCenter: [number, number] = [e.latlng.lat, e.latlng.lng];
        onRadiusChangeRef.current(newCenter, radiusRef.current);
      }
    });

    // Right-click to finish polygon
    map.on('contextmenu', (e) => {
      e.originalEvent.preventDefault();
      if (drawingModeRef.current === 'polygon' && polygonPointsRef.current.length >= 3) {
        const points = polygonPointsRef.current.map(p => [p[1], p[0]] as L.LatLngExpression);
        points.push(points[0] as L.LatLngExpression);

        if (polygonLayerRef.current) map.removeLayer(polygonLayerRef.current);
        polygonLayerRef.current = L.polygon(points, {
          color: '#10b981',
          weight: 2,
          fillColor: '#10b981',
          fillOpacity: 0.15,
        }).addTo(map);

        tempMarkersRef.current.forEach(m => map.removeLayer(m));
        tempMarkersRef.current = [];

        onPolygonChangeRef.current?.(polygonPointsRef.current);
        drawingModeRef.current = null;
      }
    });

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Center / zoom sync ─────────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // ── Radius circle + center marker ─────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;

    if (mode === 'radius') {
      if (circleRef.current) mapRef.current.removeLayer(circleRef.current);
      circleRef.current = L.circle(center, {
        radius,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.12,
        weight: 2,
        dashArray: '6 4',
      }).addTo(mapRef.current);

      if (centerMarkerRef.current) {
        centerMarkerRef.current.setLatLng(center);
      } else {
        const centerIcon = L.divIcon({
          className: 'map-center-pin',
          html: `<div style="width:16px;height:16px;border-radius:50%;background:#10b981;border:3px solid rgba(255,255,255,0.9);box-shadow:0 0 0 4px rgba(16,185,129,0.25),0 2px 8px rgba(0,0,0,0.4);"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        centerMarkerRef.current = L.marker(center, { icon: centerIcon }).addTo(mapRef.current);
      }
    } else {
      if (circleRef.current) {
        mapRef.current.removeLayer(circleRef.current);
        circleRef.current = null;
      }
      if (centerMarkerRef.current) {
        mapRef.current.removeLayer(centerMarkerRef.current);
        centerMarkerRef.current = null;
      }
    }
  }, [mode, center, radius]);

  // ── Auto-start polygon drawing when mode switches to 'polygon' ────────────
  useEffect(() => {
    if (mode === 'polygon') {
      // Automatically enter drawing mode — no need to click pencil separately
      drawingModeRef.current = 'polygon';
      polygonPointsRef.current = [];

      // Clear any existing polygon/temp markers from prior session
      if (polygonLayerRef.current && mapRef.current) {
        mapRef.current.removeLayer(polygonLayerRef.current);
        polygonLayerRef.current = null;
      }
      tempMarkersRef.current.forEach(m => {
        if (mapRef.current) mapRef.current.removeLayer(m);
      });
      tempMarkersRef.current = [];
    } else {
      // Leaving polygon mode — reset drawing state
      drawingModeRef.current = null;
    }
  }, [mode]);

  // ── Polygon sync ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;

    if (mode === 'polygon' && polygon && polygon.length > 0) {
      if (polygonLayerRef.current) mapRef.current.removeLayer(polygonLayerRef.current);
      const points = polygon.map(p => [p[1], p[0]] as L.LatLngExpression);
      polygonLayerRef.current = L.polygon(points, {
        color: '#10b981',
        weight: 2,
        fillColor: '#10b981',
        fillOpacity: 0.12,
      }).addTo(mapRef.current);
    } else {
      if (polygonLayerRef.current) {
        mapRef.current.removeLayer(polygonLayerRef.current);
        polygonLayerRef.current = null;
      }
    }
  }, [mode, polygon]);

  // ── Markers: clusters OR individual listings (SINGLE effect — no duplicates)
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear all previous markers
    markersRef.current.forEach(m => mapRef.current!.removeLayer(m));
    markersRef.current = [];

    if (clusters.length > 0) {
      clusters.forEach((cluster) => {
        const lat = cluster.center?.[1] ?? cluster.lat ?? cluster.latitude;
        const lng = cluster.center?.[0] ?? cluster.lng ?? cluster.longitude;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

        const icon = L.divIcon({
          className: 'map-cluster-marker',
          html: `<div class="map-cluster-bubble">${cluster.count}</div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const marker = L.marker([lat as number, lng as number], { icon }).addTo(mapRef.current!);

        // Popup
        if (cluster.minPrice != null && cluster.maxPrice != null) {
          marker.bindPopup(popupHtml(`
            <strong>${cluster.count} listings</strong><br/>
            <span class="map-popup-price">ETB ${cluster.minPrice.toLocaleString()} – ${cluster.maxPrice.toLocaleString()}</span>
          `));
        }

        marker.on('click', () => {
          if (onClusterClick) {
            onClusterClick(cluster);
          } else if (mapRef.current) {
            mapRef.current.setView([lat as number, lng as number], Math.min(mapRef.current.getZoom() + 2, 18));
          }
        });

        markersRef.current.push(marker);
      });
      return;
    }

    // Individual listing pins
    listings.forEach((listing) => {
      const icon = L.divIcon({
        className: 'map-listing-pin',
        html: `<div class="map-listing-dot"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const marker = L.marker([listing.lat, listing.lng], { icon })
        .addTo(mapRef.current!)
        .bindPopup(popupHtml(`
          <strong>${listing.title}</strong><br/>
          <span class="map-popup-price">ETB ${listing.price.toLocaleString()}</span>
        `));

      marker.on('click', () => onListingClick?.(listing.id));
      markersRef.current.push(marker);
    });
  }, [clusters, listings, onListingClick, onClusterClick]);

  // ── Polygon drawing controls ──────────────────────────────────────────────
  const startPolygonDrawing = useCallback(() => {
    drawingModeRef.current = 'polygon';
    polygonPointsRef.current = [];

    if (polygonLayerRef.current && mapRef.current) {
      mapRef.current.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }
    tempMarkersRef.current.forEach(m => {
      if (mapRef.current) mapRef.current.removeLayer(m);
    });
    tempMarkersRef.current = [];
  }, []);

  const clearPolygon = useCallback(() => {
    drawingModeRef.current = null;
    polygonPointsRef.current = [];

    if (polygonLayerRef.current && mapRef.current) {
      mapRef.current.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }
    tempMarkersRef.current.forEach(m => {
      if (mapRef.current) mapRef.current.removeLayer(m);
    });
    tempMarkersRef.current = [];
    onPolygonChange?.([]);
  }, [onPolygonChange]);

  const undoLastPoint = useCallback(() => {
    if (polygonPointsRef.current.length === 0) return;
    polygonPointsRef.current.pop();

    // Remove last vertex marker
    const lastMarker = tempMarkersRef.current.pop();
    if (lastMarker && mapRef.current) mapRef.current.removeLayer(lastMarker);

    // Redraw polyline
    if (polygonLayerRef.current && mapRef.current) {
      mapRef.current.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }
    if (polygonPointsRef.current.length > 1 && mapRef.current) {
      const points = polygonPointsRef.current.map(p => [p[1], p[0]] as L.LatLngExpression);
      polygonLayerRef.current = L.polyline(points, {
        color: '#10b981',
        weight: 2,
        dashArray: '6 4',
      }).addTo(mapRef.current);
    }
  }, []);

  // ── Geolocation ───────────────────────────────────────────────────────────
  const handleGetCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      setTimeout(() => setLocationError(null), 3000);
      return;
    }

    setGettingLocation(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newCenter: [number, number] = [latitude, longitude];
        if (mapRef.current) mapRef.current.setView(newCenter, 15);
        if (modeRef.current === 'radius' && onRadiusChangeRef.current) {
          onRadiusChangeRef.current(newCenter, radiusRef.current);
        }
        setGettingLocation(false);
      },
      () => {
        setLocationError('Location unavailable');
        setTimeout(() => setLocationError(null), 3000);
        setGettingLocation(false);
      },
    );
  }, []);

  // ── Custom zoom ───────────────────────────────────────────────────────────
  const zoomIn = useCallback(() => mapRef.current?.zoomIn(), []);
  const zoomOut = useCallback(() => mapRef.current?.zoomOut(), []);
  const resetView = useCallback(() => {
    mapRef.current?.setView(center, zoom);
  }, [center, zoom]);

  // ── Shared button style ───────────────────────────────────────────────────
  const btnCls = cn(
    'flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150',
    'bg-white/[0.08] text-white/60 hover:bg-white/[0.14] hover:text-white active:scale-95',
  );

  return (
    <div className="relative h-full w-full">
      {/* Map container */}
      <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />

      {/* Loading overlay */}
      {!mapReady && (
        <div className="absolute inset-0 z-[600] flex items-center justify-center bg-[#1a1814]">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
            <span className="text-[11px] font-medium text-white/40">Loading map…</span>
          </div>
        </div>
      )}

      {/* ── Custom controls — top-right ── */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1 rounded-xl border border-white/[0.08] bg-[#11100d]/90 p-1.5 shadow-xl backdrop-blur-md">
        {/* Zoom in/out */}
        <button onClick={zoomIn} className={btnCls} title="Zoom in" aria-label="Zoom in">
          <Plus size={15} />
        </button>
        <button onClick={zoomOut} className={btnCls} title="Zoom out" aria-label="Zoom out">
          <Minus size={15} />
        </button>

        {/* Divider */}
        <div className="mx-1 h-px bg-white/[0.08]" />

        {/* Current location */}
        <button
          onClick={handleGetCurrentLocation}
          disabled={gettingLocation}
          className={cn(btnCls, gettingLocation && 'opacity-50 pointer-events-none')}
          title="My location"
          aria-label="Use current location"
        >
          {gettingLocation ? (
            <div className="h-3.5 w-3.5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
          ) : (
            <Crosshair size={15} className="text-emerald-400" />
          )}
        </button>

        {/* Reset view */}
        <button onClick={resetView} className={btnCls} title="Reset view" aria-label="Reset view">
          <Navigation size={14} />
        </button>

        {/* Polygon controls — only in polygon mode */}
        {mode === 'polygon' && (
          <>
            <div className="mx-1 h-px bg-white/[0.08]" />
            <button
              onClick={startPolygonDrawing}
              className={cn(btnCls, 'hover:text-sky-300')}
              title="Draw polygon"
              aria-label="Start polygon drawing"
            >
              <PencilLine size={14} />
            </button>
            <button
              onClick={undoLastPoint}
              className={cn(btnCls, 'hover:text-amber-300')}
              title="Undo last point"
              aria-label="Undo last polygon point"
            >
              <Undo2 size={14} />
            </button>
            <button
              onClick={clearPolygon}
              className={cn(btnCls, 'hover:text-rose-400')}
              title="Clear polygon"
              aria-label="Clear polygon"
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
      </div>

      {/* Location error toast */}
      {locationError && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] rounded-lg border border-rose-500/20 bg-rose-500/15 px-3 py-1.5 text-[11px] font-medium text-rose-300 backdrop-blur-md shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          {locationError}
        </div>
      )}
    </div>
  );
}
