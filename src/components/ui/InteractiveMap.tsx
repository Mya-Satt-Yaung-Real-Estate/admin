import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Chip, IconButton } from '@mui/material';
import { LocationOn as LocationIcon, Edit as EditIcon, Clear as ClearIcon } from '@mui/icons-material';
import { MapSelectionModal } from './MapSelectionModal';
import { LeafletMap } from './LeafletMap';

interface InteractiveMapProps {
  latitude?: number;
  longitude?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  height?: number;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  latitude = 16.8661, // Default to Yangon
  longitude = 96.1951,
  onLocationSelect,
  height = 300,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasSelectedLocation, setHasSelectedLocation] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentLatitude, setCurrentLatitude] = useState<number>(16.8661);
  const [currentLongitude, setCurrentLongitude] = useState<number>(96.1951);

  // Ensure coordinates are numbers
  const safeLatitude = typeof latitude === 'number' ? latitude : parseFloat(latitude) || 16.8661;
  const safeLongitude = typeof longitude === 'number' ? longitude : parseFloat(longitude) || 96.1951;

  // Initialize with existing coordinates if they exist (only once)
  useEffect(() => {
    if (!isInitialized) {
      setCurrentLatitude(safeLatitude);
      setCurrentLongitude(safeLongitude);
      if (safeLatitude && safeLongitude && (safeLatitude !== 16.8661 || safeLongitude !== 96.1951)) {
        setHasSelectedLocation(true);
      }
      setIsInitialized(true);
    }
  }, [safeLatitude, safeLongitude, isInitialized]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setCurrentLatitude(lat);
    setCurrentLongitude(lng);
    onLocationSelect(lat, lng);
    setHasSelectedLocation(true);
  };

  const handleResetLocation = () => {
    setCurrentLatitude(16.8661);
    setCurrentLongitude(96.1951);
    setHasSelectedLocation(false);
    setIsInitialized(false);
    // Reset to default coordinates
    onLocationSelect(16.8661, 96.1951);
  };

  return (
    <Box>
      {!hasSelectedLocation ? (
        // Initial state - show placeholder
        <>
          <Typography variant="subtitle2" gutterBottom color="text.secondary">
            Click the button below to open a full-screen map for precise location selection
          </Typography>
          
          <Box
            sx={{
              height,
              width: '100%',
              border: '1px solid #ddd',
              borderRadius: 1,
              backgroundColor: '#f5f5f5',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <LocationIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Interactive map will help you set the exact location
            </Typography>
            <Button
              variant="contained"
              startIcon={<LocationIcon />}
              onClick={handleOpenModal}
              size="small"
            >
              Open Map Selector
            </Button>
          </Box>
        </>
      ) : (
        // After selection - show preview
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Selected Location Preview
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={`${currentLatitude.toFixed(6)}, ${currentLongitude.toFixed(6)}`}
                size="small"
                color="primary"
                variant="outlined"
              />
              <IconButton
                size="small"
                onClick={handleResetLocation}
                sx={{ color: 'text.secondary' }}
                title="Reset location"
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          
          <Box
            sx={{
              height,
              width: '100%',
              border: '1px solid #ddd',
              borderRadius: 1,
              overflow: 'hidden',
              position: 'relative',
              minHeight: height, // Ensure minimum height
              '& .leaflet-container': {
                height: '100% !important',
                width: '100% !important',
              },
            }}
          >
            <LeafletMap
              latitude={currentLatitude}
              longitude={currentLongitude}
              onLocationSelect={() => {}} // Disable clicks on preview
              height={height}
              zoom={15}
            />
            
            {/* Overlay with edit button */}
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 1000,
              }}
            >
              <Button
                variant="contained"
                size="small"
                startIcon={<EditIcon />}
                onClick={handleOpenModal}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                  },
                }}
              >
                Change Location
              </Button>
            </Box>
          </Box>
        </>
      )}

      <MapSelectionModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onLocationSelect={handleLocationSelect}
        initialLatitude={currentLatitude}
        initialLongitude={currentLongitude}
      />
    </Box>
  );
};
