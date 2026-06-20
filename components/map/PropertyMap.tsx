'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, Navigation, PencilLine, Trash2 } from 'lucide-react';
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

export function PropertyMap({
  center = [40.4897, 9.1450], // Default to Ethiopia center
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
  const clusterMarkersRef = useRef<L.Marker[]>([]);
  const circleRef = useRef<L.Circle | null>(null);
  const polygonLayerRef = useRef<L.Polyline | L.Polygon | null>(null);
  const drawingModeRef = useRef<'polygon' | null>(null);
  const polygonPointsRef = useRef<[number, number][]>([]);
  const tempMarkersRef = useRef<L.CircleMarker[]>([]);
  const centerMarkerRef = useRef<L.Marker | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Ensure container has proper dimensions
    const container = mapContainerRef.current;
    container.style.height = '100%';
    container.style.width = '100%';

    // Initialize map with OpenStreetMap tiles
    const map = L.map(container).setView(center, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Force map to invalidate size after initialization
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    // Keep Leaflet's internal size in sync whenever the pane resizes or
    // becomes visible (flex/grid layouts settle after mount; toggling
    // list/map changes the container size). Without this the map can render
    // at the wrong size and feel non-interactive.
    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(container);

    // Handle viewport changes
    const handleMoveEnd = () => {
      if (mode === 'viewport' && onViewportChange) {
        const bounds = map.getBounds();
        onViewportChange({
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

    // Handle click for polygon drawing and radius center setting
    map.on('click', (e) => {
      if (drawingModeRef.current === 'polygon') {
        const point: [number, number] = [e.latlng.lng, e.latlng.lat];
        polygonPointsRef.current.push(point);

        // Add temporary marker
        const marker = L.circleMarker([point[1], point[0]], {
          radius: 6,
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 1,
        }).addTo(map);
        tempMarkersRef.current.push(marker);

        // Draw lines between points
        if (polygonPointsRef.current.length > 1) {
          const points = polygonPointsRef.current.map(p => [p[1], p[0]] as L.LatLngExpression);
          if (polygonLayerRef.current) {
            map.removeLayer(polygonLayerRef.current);
          }
          polygonLayerRef.current = L.polyline(points, {
            color: '#10b981',
            weight: 2,
          }).addTo(map);
        }
      } else if (mode === 'radius' && onRadiusChange) {
        // Set center point for radius search
        const newCenter: [number, number] = [e.latlng.lat, e.latlng.lng];
        onRadiusChange(newCenter, radius);
      }
    });

    // Handle right-click to finish polygon
    map.on('contextmenu', (e) => {
      e.originalEvent.preventDefault();
      if (drawingModeRef.current === 'polygon' && polygonPointsRef.current.length >= 3) {
        // Close the polygon
        const points = polygonPointsRef.current.map(p => [p[1], p[0]] as L.LatLngExpression);
        points.push(points[0] as L.LatLngExpression); // Close the loop

        if (polygonLayerRef.current) {
          map.removeLayer(polygonLayerRef.current);
        }
        polygonLayerRef.current = L.polygon(points, {
          color: '#10b981',
          weight: 2,
          fillColor: '#10b981',
          fillOpacity: 0.2,
        }).addTo(map);

        // Clear temporary markers
        tempMarkersRef.current.forEach(m => map.removeLayer(m));
        tempMarkersRef.current = [];

        // Notify parent
        if (onPolygonChange) {
          onPolygonChange(polygonPointsRef.current);
        }

        drawingModeRef.current = null;
      }
    });

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update center when prop changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // Update radius circle and center marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (mode === 'radius') {
      // Update or create radius circle
      if (circleRef.current) {
        mapRef.current.removeLayer(circleRef.current);
      }
      circleRef.current = L.circle(center, {
        radius: radius,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.2,
      }).addTo(mapRef.current);

      // Update or create center marker
      if (centerMarkerRef.current) {
        centerMarkerRef.current.setLatLng(center);
      } else {
        const centerIcon = L.divIcon({
          className: 'custom-center-marker',
          html: `<div style="background-color: #10b981; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        centerMarkerRef.current = L.marker(center, { icon: centerIcon }).addTo(mapRef.current);
      }
    } else {
      // Remove radius circle and center marker
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

  // Update polygon
  useEffect(() => {
    if (!mapRef.current) return;

    if (mode === 'polygon' && polygon && polygon.length > 0) {
      if (polygonLayerRef.current) {
        mapRef.current.removeLayer(polygonLayerRef.current);
      }
      const points = polygon.map(p => [p[1], p[0]] as L.LatLngExpression);
      polygonLayerRef.current = L.polygon(points, {
        color: '#10b981',
        weight: 2,
        fillColor: '#10b981',
        fillOpacity: 0.2,
      }).addTo(mapRef.current);
    } else {
      if (polygonLayerRef.current) {
        mapRef.current.removeLayer(polygonLayerRef.current);
        polygonLayerRef.current = null;
      }
    }
  }, [mode, polygon]);

  // Update listings / clusters markers
  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((marker) => mapRef.current!.removeLayer(marker));
    markersRef.current = [];

    if (clusters.length > 0) {
      clusters.forEach((cluster) => {
        const clusterIcon = L.divIcon({
          className: 'property-cluster-marker',
          html: `<div style="background-color: #10b981; color: white; width: 36px; height: 36px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.2); font-size: 12px; font-weight: 700;">${cluster.count}</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([cluster.lat, cluster.lng], { icon: clusterIcon })
          .addTo(mapRef.current!)
          .bindPopup(`
            <div style="min-width: 180px;">
              <strong>${cluster.count} listings</strong><br/>
              ${cluster.minPrice != null && cluster.maxPrice != null ? `$${cluster.minPrice.toLocaleString()} - $${cluster.maxPrice.toLocaleString()}` : 'Zoom in for details'}
            </div>
          `);

        marker.on('click', () => {
          if (mapRef.current) {
            mapRef.current.setView([cluster.lat, cluster.lng], Math.min(mapRef.current.getZoom() + 2, 18));
          }
        });

        markersRef.current.push(marker);
      });

      return;
    }

    listings.forEach((listing) => {
      const marker = L.marker([listing.lat, listing.lng])
        .addTo(mapRef.current!)
        .bindPopup(`
          <div style="min-width: 200px;">
            <strong>${listing.title}</strong><br/>
            $${listing.price.toLocaleString()}
          </div>
        `);

      marker.on('click', () => {
        if (onListingClick) {
          onListingClick(listing.id);
        }
      });

      markersRef.current.push(marker);
    });
  }, [clusters, listings, onListingClick]);

  useEffect(() => {
    if (!mapRef.current) return;

    clusterMarkersRef.current.forEach((m) => mapRef.current!.removeLayer(m));
    clusterMarkersRef.current = [];

    clusters.forEach((cluster) => {
      const lng = cluster.center?.[0] ?? cluster.lng ?? cluster.longitude;
      const lat = cluster.center?.[1] ?? cluster.lat ?? cluster.latitude;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const icon = L.divIcon({
        className: 'property-cluster-marker',
        html: `<div style="min-width:42px;height:42px;padding:0 10px;border-radius:999px;display:flex;align-items:center;justify-content:center;background:#143d2b;color:#f4d38b;font-weight:700;border:2px solid white;box-shadow:0 10px 24px rgba(20,61,43,0.28);">${cluster.count}</div>`,
        iconSize: [42, 42],
        iconAnchor: [21, 21],
      });
      const marker = L.marker([lat as number, lng as number], { icon }).addTo(
        mapRef.current!,
      );
      marker.on('click', () => onClusterClick?.(cluster));
      clusterMarkersRef.current.push(marker);
    });
  }, [clusters, onClusterClick]);

  // Start polygon drawing
  const startPolygonDrawing = () => {
    drawingModeRef.current = 'polygon';
    polygonPointsRef.current = [];

    // Clear existing polygon
    if (polygonLayerRef.current && mapRef.current) {
      mapRef.current.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }

    // Clear temporary markers
    tempMarkersRef.current.forEach(m => {
      if (mapRef.current) mapRef.current.removeLayer(m);
    });
    tempMarkersRef.current = [];
  };

  // Clear polygon
  const clearPolygon = () => {
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

    if (onPolygonChange) {
      onPolygonChange([]);
    }
  };

  // Use current location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newCenter: [number, number] = [latitude, longitude];

        if (mapRef.current) {
          mapRef.current.setView(newCenter, 15);
        }

        if (mode === 'radius' && onRadiusChange) {
          onRadiusChange(newCenter, radius);
        }

        setGettingLocation(false);
      },
      (error) => {
        alert('Failed to get location. Please enable location services.');
        setGettingLocation(false);
      }
    );
  };

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />

      {/* Mode-specific instructions */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000] max-w-xs">
        {mode === 'viewport' && (
          <p className="text-xs text-gray-600">
            <span className="font-semibold">Viewport Mode:</span> Pan and zoom the map to search within the visible area
          </p>
        )}
        {mode === 'radius' && (
          <p className="text-xs text-gray-600">
            <span className="font-semibold">Radius Mode:</span> Click anywhere on the map to set the center point for your search radius
          </p>
        )}
        {mode === 'polygon' && (
          <p className="text-xs text-gray-600">
            <span className="font-semibold">Polygon Mode:</span> Click to add points, right-click to finish drawing
          </p>
        )}
      </div>

      {/* Map controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 z-[1000]">
        <div className="space-y-2">
          <button
            onClick={handleGetCurrentLocation}
            disabled={gettingLocation}
            className="block w-8 h-8 flex items-center justify-center bg-emerald-100 hover:bg-emerald-200 disabled:bg-gray-100 disabled:text-gray-400 rounded text-emerald-600"
            title="Use current location"
          >
            {gettingLocation ? (
              <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Crosshair size={16} />
            )}
          </button>
          <button
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.setView(center, zoom);
              }
            }}
            className="block w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
            title="Reset view"
          >
            <Navigation size={16} />
          </button>
          {mode === 'polygon' && (
            <>
              <button
                onClick={startPolygonDrawing}
                className="block w-8 h-8 flex items-center justify-center bg-blue-100 hover:bg-blue-200 rounded text-blue-600"
                title="Draw polygon (click to add points, right-click to finish)"
              >
                <PencilLine size={16} />
              </button>
              <button
                onClick={clearPolygon}
                className="block w-8 h-8 flex items-center justify-center bg-red-100 hover:bg-red-200 rounded text-red-600"
                title="Clear polygon"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
