import React, { useMemo } from 'react';
import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import { useUsers } from '../../services/queries/users';
import {
  RegularUser,
  getUserSelectLabel,
} from '../../types/user';

interface PropertyNoteApproverUserSelectProps {
  value: string;
  onChange: (jsonArray: string) => void;
}

/**
 * Parse stored JSON id array. Invalid / empty → [].
 */
const parseApproverIds = (raw: unknown): number[] => {
  if (Array.isArray(raw)) {
    return raw.map(Number).filter((id) => Number.isFinite(id) && id > 0);
  }
  if (typeof raw !== 'string' || !raw.trim()) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map(Number).filter((id) => Number.isFinite(id) && id > 0);
  } catch {
    return [];
  }
};

/**
 * Stub when an approver id is saved but not in the current user list page.
 */
const toMissingUserStub = (id: number): RegularUser =>
  ({
    id,
    name: `User #${id} (not in loaded list)`,
    slug: `missing-user-${id}`,
    email: '',
    user_type: 'individual',
    member_level: 'basic',
    is_active: true,
    property_count: 0,
    point_balance: 0,
    total_points_allocated: 0,
    total_points_consumed: 0,
    point_packages_count: 0,
    created_at: '',
    updated_at: '',
  }) as RegularUser;

/**
 * Searchable multi-select for property_note.approver_user_ids.
 * Saves the same JSON array format the API already expects.
 */
const PropertyNoteApproverUserSelect: React.FC<PropertyNoteApproverUserSelectProps> = ({
  value,
  onChange,
}) => {
  const { data: usersResponse, isLoading } = useUsers({
    per_page: 100,
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  const users: RegularUser[] = usersResponse?.data || [];
  const selectedIds = useMemo(() => parseApproverIds(value), [value]);

  const selectedUsers = useMemo(() => {
    return selectedIds.map((id) => {
      const found = users.find((user) => user.id === id);
      return found ?? toMissingUserStub(id);
    });
  }, [selectedIds, users]);

  const options = useMemo(() => {
    const missing = selectedUsers.filter(
      (selected) => !users.some((user) => user.id === selected.id)
    );
    return [...users, ...missing];
  }, [users, selectedUsers]);

  return (
    <Autocomplete
      multiple
      options={options}
      value={selectedUsers}
      loading={isLoading}
      filterSelectedOptions
      isOptionEqualToValue={(option, selected) => option.id === selected.id}
      getOptionLabel={(option) => getUserSelectLabel(option)}
      onChange={(_event, nextUsers) => {
        const ids = nextUsers.map((user) => user.id);
        onChange(JSON.stringify(ids));
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Approver users"
          placeholder="Search by name or phone..."
          size="small"
          helperText="Select one or more users who can approve Property Note unlock requests."
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading ? <CircularProgress color="inherit" size={18} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default PropertyNoteApproverUserSelect;
