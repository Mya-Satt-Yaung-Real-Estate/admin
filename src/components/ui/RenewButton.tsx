import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

interface RenewButtonProps {
  onClick: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  tooltip?: string;
}

const RenewButton: React.FC<RenewButtonProps> = ({
  onClick,
  disabled = false,
  size = 'small',
  tooltip = 'Renew Property',
}) => {
  return (
    <Tooltip title={tooltip}>
      <IconButton
        size={size}
        onClick={onClick}
        color="warning"
        disabled={disabled}
        sx={{
          '&:hover': {
            backgroundColor: 'warning.light',
            color: 'warning.contrastText',
          },
        }}
      >
        <RefreshIcon />
      </IconButton>
    </Tooltip>
  );
};

export default RenewButton;
