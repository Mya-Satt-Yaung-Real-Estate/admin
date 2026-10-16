import React, { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { OpenInFull as ExpandMapIcon } from '@mui/icons-material';
import { loadGoogleMaps } from '../../lib/googleMapsLoader';
import type { PropertyNoteBoundaryGeoJson } from '../../types/propertyNote';

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
  /**
   * When set, shows Maximize in the map toolbar (top-right with Map type).
   */
  onMaximize?: () => void;
}

/** Admin teal — match prior Leaflet polygon. */
const POLY_STYLE = {
  fillColor: '#3B8880',
  fillOpacity: 0.25,
  strokeColor: '#3B8880',
  strokeOpacity: 1,
  strokeWeight: 2,
};

type MapTypeId = 'roadmap' | 'hybrid';

const toolSurfaceSx = {
  height: 36,
  borderRadius: 1,
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
  boxShadow: 1,
  '&:hover': { bgcolor: 'grey.50' },
} as const;

/**
 * GeoJSON [lng, lat] ring → Google LatLngLiteral path.
 */
function boundaryToPath(
  boundary: PropertyNoteBoundaryGeoJson | null | undefined
): google.maps.LatLngLiteral[] | null {
  if (!boundary || boundary.type !== 'Polygon') {
    return null;
  }
  const ring = boundary.coordinates?.[0];
  if (!Array.isArray(ring) || ring.length < 4) {
    return null;
  }
  return ring.map(([lng, lat]) => ({ lat, lng }));
}

/**
 * Read-only Property Note location: Google Maps pin + optional drawn area.
 * Toolbar (top-right): Maximize · Map/Satellite — same pattern as Jade web.
 * Zoom sits bottom-left so it does not collide with the toolbar.
 */
export const PropertyNoteLocationMap: React.FC<PropertyNoteLocationMapProps> = ({
  latitude,
  longitude,
  boundary = null,
  height = 220,
  zoom = 15,
  mapKey = 'note-location-map',
  onMaximize,
}) => {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mapTypeId, setMapTypeId] = useState<MapTypeId>('roadmap');
  const [mapReady, setMapReady] = useState(false);

  const mapHeight = typeof height === 'string' ? height : `${height}px`;

  useEffect(() => {
    let cancelled = false;
    setMapReady(false);
    setMapTypeId('roadmap');

    const boot = async () => {
      if (!mapElRef.current) return;
      try {
        await loadGoogleMaps();
        if (cancelled || !mapElRef.current) return;

        const center = { lat: Number(latitude), lng: Number(longitude) };
        const map = new google.maps.Map(mapElRef.current, {
          center,
          zoom,
          mapTypeId: 'roadmap',
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: false,
          rotateControl: false,
          scaleControl: false,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_BOTTOM,
          },
          gestureHandling: 'greedy',
          clickableIcons: false,
        });
        mapRef.current = map;

        markerRef.current = new google.maps.Marker({
          map,
          position: center,
        });

        const path = boundaryToPath(boundary);
        if (path && path.length >= 3) {
          polygonRef.current = new google.maps.Polygon({
            map,
            paths: path,
            ...POLY_STYLE,
            clickable: false,
          });
          const bounds = new google.maps.LatLngBounds();
          path.forEach((p) => bounds.extend(p));
          map.fitBounds(bounds, 28);
        }

        window.setTimeout(() => {
          if (cancelled || !mapRef.current) return;
          google.maps.event.trigger(mapRef.current, 'resize');
          if (path && path.length >= 3) {
            const bounds = new google.maps.LatLngBounds();
            path.forEach((p) => bounds.extend(p));
            mapRef.current.fitBounds(bounds, 28);
          } else {
            mapRef.current.setCenter(center);
          }
        }, 120);

        if (!cancelled) setMapReady(true);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Map failed to load');
        }
      }
    };

    void boot();

    return () => {
      cancelled = true;
      polygonRef.current?.setMap(null);
      polygonRef.current = null;
      markerRef.current?.setMap(null);
      markerRef.current = null;
      mapRef.current = null;
      setMapReady(false);
    };
  }, [latitude, longitude, boundary, zoom, mapKey]);

  if (loadError) {
    return (
      <Box
        sx={{
          height: mapHeight,
          width: '100%',
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary" align="center">
          {loadError}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      key={mapKey}
      sx={{
        position: 'relative',
        height: mapHeight,
        width: '100%',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      {mapReady ? (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            pointerEvents: 'auto',
          }}
        >
          {onMaximize ? (
            <IconButton
              type="button"
              aria-label="Maximize map"
              size="small"
              onClick={onMaximize}
              sx={{
                ...toolSurfaceSx,
                width: 36,
                p: 0,
              }}
            >
              <ExpandMapIcon fontSize="small" />
            </IconButton>
          ) : null}
          <Box
            component="select"
            aria-label="Map type"
            value={mapTypeId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const next = e.target.value as MapTypeId;
              setMapTypeId(next);
              mapRef.current?.setMapTypeId(next);
            }}
            sx={{
              ...toolSurfaceSx,
              minWidth: 108,
              px: 1.25,
              fontSize: 13,
              fontFamily: 'inherit',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="roadmap">Map</option>
            <option value="hybrid">Satellite</option>
          </Box>
        </Box>
      ) : null}

      <Box
        ref={mapElRef}
        sx={{ height: '100%', width: '100%' }}
        aria-label="Location map"
      />
    </Box>
  );
};

export default PropertyNoteLocationMap;
