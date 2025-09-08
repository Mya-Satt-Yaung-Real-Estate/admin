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
          width: '95vw',
          height: '95vh',
          maxWidth: 'none',
          maxHeight: 'none',
        },
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid #e0e0e0',
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationIcon color="primary" />
          <Typography variant="h6">Select Property Location</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {error && (
          <Alert severity="error" sx={{ m: 2, mb: 0 }}>
            {error}
          </Alert>
        )}

        {/* Info Panel */}
        <Box sx={{ 
          p: 2, 
          backgroundColor: '#f8f9fa', 
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box>
            {/* <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Selected Coordinates
            </Typography> */}
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              <strong>Lat:</strong> {selectedLat.toFixed(6)} | <strong>Lng:</strong> {selectedLng.toFixed(6)}
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            size="small"
            startIcon={isLoading ? <CircularProgress size={16} /> : <MyLocationIcon />}
            onClick={handleUseCurrentLocation}
            disabled={isLoading}
            sx={{ minWidth: 180 }}
          >
            Use Current Location
          </Button>
        </Box>

        {/* Map Container */}
        <Box sx={{ 
          flex: 1, 
          position: 'relative',
          minHeight: 0 // Important for flex child to shrink
        }}>
          <LeafletMap
            latitude={selectedLat}
            longitude={selectedLng}
            onLocationSelect={handleMapClick}
            height="100%"
            zoom={15}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: 2, 
        gap: 1,
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#fafafa'
      }}>
        <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>
          Click on the map to select a location, or use the "Use Current Location" button above.
        </Typography>
        
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
