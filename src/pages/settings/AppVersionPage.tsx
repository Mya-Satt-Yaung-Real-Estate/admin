import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/layout/PageHeader';
import { ActionAlert, PageErrorState, PageLoadingState } from '@/components/ui';
import { useAlertSystem } from '@/hooks';
import { appSettingsAPI } from '@/services/api';
import type { AppSetting, UpdateAppSettingPayload } from '@/types';

type Platform = 'android' | 'ios';

const DEFAULT_FORM: UpdateAppSettingPayload = {
  min_version: '',
  latest_version: '',
  is_force_update: false,
  is_maintenance: false,
  update_url: '',
  message_my: '',
  message_en: '',
};

function cloneFormState(
  source: Record<Platform, UpdateAppSettingPayload>
): Record<Platform, UpdateAppSettingPayload> {
  return {
    android: { ...source.android },
    ios: { ...source.ios },
  };
}

const AppVersionPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();
  const [formByPlatform, setFormByPlatform] = useState<Record<Platform, UpdateAppSettingPayload>>({
    android: { ...DEFAULT_FORM },
    ios: { ...DEFAULT_FORM },
  });
  /** Snapshot from last successful load — used to detect unsaved edits */
  const [baselineByPlatform, setBaselineByPlatform] = useState<Record<Platform, UpdateAppSettingPayload>>({
    android: { ...DEFAULT_FORM },
    ios: { ...DEFAULT_FORM },
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['app-settings'],
    queryFn: () => appSettingsAPI.getAll(),
  });

  useEffect(() => {
    const rows = data?.data || [];
    const next = { android: { ...DEFAULT_FORM }, ios: { ...DEFAULT_FORM } };
    rows.forEach((row: AppSetting) => {
      const key = row.platform as Platform;
      if (key === 'android' || key === 'ios') {
        next[key] = {
          min_version: row.min_version || '',
          latest_version: row.latest_version || '',
          is_force_update: !!row.is_force_update,
          is_maintenance: !!row.is_maintenance,
          update_url: row.update_url || '',
          message_my: row.message_my || '',
          message_en: row.message_en || '',
        };
      }
    });
    setFormByPlatform(next);
    setBaselineByPlatform(cloneFormState(next));
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: ({ platform, payload }: { platform: Platform; payload: UpdateAppSettingPayload }) =>
      appSettingsAPI.update(platform, payload),
    onSuccess: () => {
      showSuccess('App setting updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['app-settings'] });
    },
    onError: (err: any) => {
      showError(err?.message || 'Failed to update app setting');
    },
  });

  const isSaving = updateMutation.isPending;

  const hasChanges = useMemo(() => {
    const platforms: Platform[] = ['android', 'ios'];
    return platforms.some((p) => {
      const cur = formByPlatform[p];
      const base = baselineByPlatform[p];
      return (
        cur.min_version !== base.min_version ||
        cur.latest_version !== base.latest_version ||
        cur.update_url !== base.update_url ||
        cur.is_force_update !== base.is_force_update ||
        cur.is_maintenance !== base.is_maintenance ||
        (cur.message_my || '') !== (base.message_my || '') ||
        (cur.message_en || '') !== (base.message_en || '')
      );
    });
  }, [formByPlatform, baselineByPlatform]);

  const sortedRows = useMemo(() => (['android', 'ios'] as Platform[]), []);

  const setField = (platform: Platform, field: keyof UpdateAppSettingPayload, value: any) => {
    setFormByPlatform((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value,
      },
    }));
  };

  const handleSave = async (platform: Platform) => {
    const payload = formByPlatform[platform];
    await updateMutation.mutateAsync({ platform, payload });
  };

  const handleSaveAll = async () => {
    await Promise.all([
      handleSave('android'),
      handleSave('ios'),
    ]);
  };

  if (isLoading) return <PageLoadingState />;
  if (error) return <PageErrorState error={error} onRetry={refetch} />;

  return (
    <Box>
      <ActionAlert {...alert} onClose={clearAlert} />
      <PageHeader
        title="App Version Settings"
        subtitle="Manage force update and maintenance settings for mobile apps"
        breadcrumbs="Dashboard / Settings / App Version"
      />

      <Grid container spacing={3}>
        {sortedRows.map((platform) => {
          const form = formByPlatform[platform];
          return (
            <Grid item xs={12} md={6} key={platform}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, textTransform: 'capitalize' }}>
                    {platform}
                  </Typography>

                  <Box sx={{ display: 'grid', gap: 2 }}>
                    <TextField
                      label="Minimum Version"
                      value={form.min_version}
                      onChange={(e) => setField(platform, 'min_version', e.target.value)}
                      size="small"
                      fullWidth
                    />
                    <TextField
                      label="Latest Version"
                      value={form.latest_version}
                      onChange={(e) => setField(platform, 'latest_version', e.target.value)}
                      size="small"
                      fullWidth
                    />
                    <TextField
                      label="Update URL"
                      value={form.update_url}
                      onChange={(e) => setField(platform, 'update_url', e.target.value)}
                      size="small"
                      fullWidth
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.is_force_update}
                          onChange={(e) => setField(platform, 'is_force_update', e.target.checked)}
                        />
                      }
                      label="Force Update"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.is_maintenance}
                          onChange={(e) => setField(platform, 'is_maintenance', e.target.checked)}
                        />
                      }
                      label="Maintenance Mode"
                    />

                    <TextField
                      label="Message (Myanmar)"
                      value={form.message_my || ''}
                      onChange={(e) => setField(platform, 'message_my', e.target.value)}
                      size="small"
                      fullWidth
                      multiline
                      minRows={2}
                    />
                    <TextField
                      label="Message (English)"
                      value={form.message_en || ''}
                      onChange={(e) => setField(platform, 'message_en', e.target.value)}
                      size="small"
                      fullWidth
                      multiline
                      minRows={2}
                    />

                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveAll}
          disabled={isSaving || !hasChanges}
        >
          Save All
        </Button>
      </Box>
    </Box>
  );
};

export default AppVersionPage;

