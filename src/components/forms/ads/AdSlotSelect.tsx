import React from 'react';
import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import {
  adGridIndexMax,
  adGridIndexSelectValue,
  adUsesGridIndex,
} from '../../../types/ad';

interface AdSlotSelectProps {
  displayLocation: string;
  gridIndex: number | null | undefined;
  onGridIndexChange: (value: number | null) => void;
  onBlur?: (e: React.FocusEvent<any>) => void;
  error?: string;
  touched?: boolean;
}

export const AdSlotSelect: React.FC<AdSlotSelectProps> = ({
  displayLocation,
  gridIndex,
  onGridIndexChange,
  onBlur,
  error,
  touched,
}) => {
  if (!adUsesGridIndex(displayLocation)) {
    return null;
  }

  const isBlock = displayLocation === 'homepage_block';
  const label = isBlock ? 'Block slot *' : 'Grid slot *';
  const labelId = isBlock ? 'ad-block-slot-label' : 'ad-grid-slot-label';
  const selectValue = adGridIndexSelectValue(gridIndex);
  const max = adGridIndexMax(displayLocation);

  const options = isBlock
    ? [
        { value: '1', label: 'Left' },
        { value: '2', label: 'Right' },
      ]
    : Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        return { value: String(n), label: `Grid ${n}` };
      });

  return (
    <FormControl fullWidth variant="outlined" error={Boolean(touched && error)}>
      <InputLabel id={labelId} shrink={Boolean(selectValue)}>
        {label}
      </InputLabel>
      <Select
        labelId={labelId}
        id={isBlock ? 'ad_block_slot' : 'ad_grid_slot'}
        name="grid_index"
        value={selectValue}
        onChange={(e) => {
          const v = e.target.value as string;
          onGridIndexChange(v === '' ? null : Number(v));
        }}
        onBlur={onBlur}
        label={label}
        displayEmpty
      >
        <MenuItem value="" disabled>
          <em>{isBlock ? 'Select left or right' : 'Select a grid slot'}</em>
        </MenuItem>
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
      {touched && error ? <FormHelperText error>{error}</FormHelperText> : null}
    </FormControl>
  );
};

export default AdSlotSelect;
