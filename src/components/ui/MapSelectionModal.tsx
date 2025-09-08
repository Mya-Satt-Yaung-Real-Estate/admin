import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  LocationOn as LocationIcon,
  MyLocation as MyLocationIcon,
} from '@mui/icons-material';
import { LeafletMap } from './LeafletMap';

interface MapSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onLocationSelect: (lat: number, lng: number) => void;
  initialLatitude?: number;
  initialLongitude?: number;
}

export const MapSelectionModal: React.FC<MapSelectionModalProps> = ({
  open,
  onClose,
  onLocationSelect,
  initialLatitude = 16.8661,
  initialLongitude = 96.1951,
}) => {
  // Ensure coordinates are numbers
  const safeInitialLat = typeof initialLatitude === 'number' ? initialLatitude : parseFloat(initialLatitude) || 16.8661;
  const safeInitialLng = typeof initialLongitude === 'number' ? initialLongitude : parseFloat(initialLongitude) || 96.1951;
  
  const [selectedLat, setSelectedLat] = useState(safeInitialLat);
  const [selectedLng, setSelectedLng] = useState(safeInitialLng);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update selected coordinates when modal opens with new initial values
  useEffect(() => {
    if (open) {
      setSelectedLat(safeInitialLat);
      setSelectedLng(safeInitialLng);
    }
  }, [open, safeInitialLat, safeInitialLng]);

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLat(lat);
    setSelectedLng(lng);
  };

  const handleConfirm = () => {
    onLocationSelect(selectedLat, selectedLng);
    onClose();
  };

  const handleUseCurrentLocation = () => {
    setIsLoading(true);
    setError(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSelectedLat(position.coords.latitude);
          setSelectedLng(position.coords.longitude);
          setIsLoading(false);
        },
        (_error) => {
          setError('Unable to get your current location. Please select manually.');
          setIsLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          width: '90vw',
          height: '90vh',
          maxWidth: 'none',
          maxHeight: 'none',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationIcon color="primary" />
          <Typography variant="h6">Select Property Location</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, position: 'relative' }}>
        {error && (
          <Alert severity="error" sx={{ m: 2, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ position: 'relative', height: '100%' }}>
          <LeafletMap
            latitude={selectedLat}
            longitude={selectedLng}
            onLocationSelect={handleMapClick}
            height="100%"
            zoom={15}
          />

          {/* Coordinates display */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: 2,
              borderRadius: 2,
              border: '1px solid #ddd',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              zIndex: 1000,
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Selected Location
            </Typography>
            <Typography variant="caption" display="block">
              <strong>Latitude:</strong> {selectedLat.toFixed(6)}
            </Typography>
            <Typography variant="caption" display="block">
              <strong>Longitude:</strong> {selectedLng.toFixed(6)}
            </Typography>
          </Box>

          {/* Use Current Location button floating on map */}
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 1000,
            }}
          >
            <Button
              variant="contained"
              size="small"
              startIcon={isLoading ? <CircularProgress size={16} /> : <MyLocationIcon />}
              onClick={handleUseCurrentLocation}
              disabled={isLoading}
              sx={{
                backgroundColor: '#4caf50',
                '&:hover': {
                  backgroundColor: '#45a049',
                },
              }}
            >
              Use Current Location
            </Button>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Box sx={{ flexGrow: 1 }} />
        
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleConfirm} variant="contained" startIcon={<LocationIcon />}>
          Confirm Location
        </Button>
      </DialogActions>
    </Dialog>
  );
};
