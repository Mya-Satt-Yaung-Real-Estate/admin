import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { PropertyNoteBoundaryGeoJson } from '../../types/propertyNote';

/**
 * Leaflet default marker icons break under Vite bundling without this fix.
 */
const defaultProto = L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown };
delete defaultProto._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface PropertyNoteLocationMapProps {
  latitude: number;
  longitude: number;
  boundary?: PropertyNoteBoundaryGeoJson | null;
  height?: number | string;
  zoom?: number;
  /**
   * Remount key when switching inline ↔ expanded dialog.
   */
  mapKey?: string;
}

/**
 * GeoJSON [lng, lat] ring → Leaflet [lat, lng] positions.
 */
function boundaryToPositions(
  boundary: PropertyNoteBoundaryGeoJson | null | undefined
): [number, number][] | null {
  if (!boundary || boundary.type !== 'Polygon') {
    return null;
  }
  const ring = boundary.coordinates?.[0];
  if (!Array.isArray(ring) || ring.length < 4) {
    return null;
  }
  return ring.map(([lng, lat]) => [lat, lng]);
}

/**
 * Fit map to polygon when present; otherwise center on pin.
 */
function FitMapView({
  pin,
  positions,
}: {
  pin: [number, number];
  positions: [number, number][] | null;
}) {
  const map = useMap();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
      if (positions && positions.length >= 3) {
        map.fitBounds(L.latLngBounds(positions), { padding: [28, 28], maxZoom: 17 });
      } else {
        map.setView(pin, map.getZoom());
      }
    }, 120);
    return () => window.clearTimeout(timer);
  }, [map, pin, positions]);

  return null;
}

/**
 * Read-only Property Note location: pin always; drawn area when boundary exists.
 * No draw/edit/delete tools.
 */
export const PropertyNoteLocationMap: React.FC<PropertyNoteLocationMapProps> = ({
  latitude,
  longitude,
  boundary = null,
  height = 220,
  zoom = 15,
  mapKey = 'note-location-map',
}) => {
  const pin: [number, number] = useMemo(() => [latitude, longitude], [latitude, longitude]);
  const positions = useMemo(() => boundaryToPositions(boundary), [boundary]);
  const mapHeight = typeof height === 'string' ? height : `${height}px`;

  return (
    <div style={{ height: mapHeight, width: '100%', borderRadius: 8, overflow: 'hidden' }}>
      <MapContainer
        key={mapKey}
        center={pin}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
        doubleClickZoom
        zoomControl
        dragging
        /**
         * View only — block accidental draw-style interactions.
         */
        boxZoom={false}
        keyboard={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={pin} />
        {positions ? (
          <Polygon
            positions={positions}
            pathOptions={{
              color: '#3B8880',
              fillColor: '#3B8880',
              fillOpacity: 0.25,
              weight: 2,
            }}
          />
        ) : null}
        <FitMapView pin={pin} positions={positions} />
      </MapContainer>
    </div>
  );
};

export default PropertyNoteLocationMap;
