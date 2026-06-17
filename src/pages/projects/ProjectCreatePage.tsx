import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import PageHeader from '../../components/layout/PageHeader';
import { LoadingSpinner, ActionAlert, MediaUpload } from '../../components/ui';
import { useAlertSystem } from '../../hooks';
import { useCreateProject } from '../../services/queries/projects';
import { useUsers } from '../../services/queries/users';
import { usePropertyTypes } from '../../services/queries/properties';
import { useRegions, useTownships } from '../../services/queries/locations';
import { ProjectFormData, ProjectPaymentPlan, ProjectUnitType } from '../../types/project';
import { Media } from '../../types/media';
import { projectCreateSchema } from '../../validations/schemas/projectSchemas';
import {
  ProjectModeSection,
  BasicInformationSection,
  LocationSection,
  PricingSection,
  ContactSection,
  StatusSection,
  UnitTypesSection,
  PaymentPlansSection,
} from '../../components/forms/project';
import { FormActions } from '../../components/forms/shared/FormActions';

const ProjectCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [uploadedMedia, setUploadedMedia] = useState<Media[]>([]);
  const [unitTypes, setUnitTypes] = useState<ProjectUnitType[]>([]);
  const [paymentPlans, setPaymentPlans] = useState<ProjectPaymentPlan[]>([]);
  const [uploadState, setUploadState] = useState({
    isUploading: false,
    totalFiles: 0,
    uploadedFiles: 0,
    failedFiles: 0,
  });

  const { alert, showError, clearAlert } = useAlertSystem();
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: propertyTypes, isLoading: propertyTypesLoading } = usePropertyTypes();
  const { data: regions, isLoading: regionsLoading } = useRegions();
  const { data: townships, isLoading: townshipsLoading } = useTownships();
  const createProjectMutation = useCreateProject();

  const formik = useFormik({
    initialValues: {
      is_platform_project: true,
      user_id: undefined as number | undefined,
      title_en: '',
      title_mm: '',
      property_type_id: undefined as number | undefined,
      region_id: undefined as number | undefined,
      township_id: undefined as number | undefined,
      address: '',
      total_units: '',
      completion_text: '',
      condition: 'upcoming' as const,
      publish_status: 'draft' as const,
      price_min: undefined as number | undefined,
      price_max: undefined as number | undefined,
      currency: 'MMK' as const,
      description_en: '',
      description_mm: '',
      contact_name: '',
      contact_phone: '',
      contact_email: '',
      show_on_homepage: false,
    },
    validationSchema: projectCreateSchema,
    onSubmit: async (values) => {
      try {
        const imageMedia = uploadedMedia.filter((media) => media.type === 'image');
        if (imageMedia.length === 0) {
          showError('At least one image is required to create a project.');
          return;
        }

        const validUnitTypes = unitTypes.filter((item) => item.name.trim() !== '');
        const validPaymentPlans = paymentPlans.filter((item) => item.name.trim() !== '');

        const projectData: ProjectFormData = {
          is_platform_project: values.is_platform_project,
          ...(values.is_platform_project ? {} : { user_id: values.user_id || 0 }),
          title_en: values.title_en,
          title_mm: values.title_mm,
          property_type_id: values.property_type_id || 0,
          region_id: values.region_id || 0,
          township_id: values.township_id || 0,
          address: values.address,
          total_units: values.total_units,
          completion_text: values.completion_text,
          condition: values.condition,
          publish_status: values.publish_status,
          price_min: values.price_min || 0,
          price_max: values.price_max || 0,
          currency: values.currency,
          description_en: values.description_en,
          description_mm: values.description_mm,
          contact_name: values.contact_name || undefined,
          contact_phone: values.contact_phone || undefined,
          contact_email: values.contact_email || undefined,
          show_on_homepage: values.show_on_homepage,
          media_ids: uploadedMedia.map((media) => media.id),
          unit_types: validUnitTypes.length > 0 ? validUnitTypes : undefined,
          payment_plans: validPaymentPlans.length > 0 ? validPaymentPlans : undefined,
        };

        const response = await createProjectMutation.mutateAsync(projectData);
        const projectId = response.data?.id;
        if (projectId) {
          navigate(`/projects/${projectId}?success=${encodeURIComponent('Project created successfully!')}`);
        } else {
          navigate('/projects');
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to create project. Please try again.';
        showError(message);
      }
    },
  });

  const isLoading = usersLoading || propertyTypesLoading || regionsLoading || townshipsLoading;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <PageHeader
        title="Create Project"
        subtitle="Add a new development project"
        breadcrumbs="Dashboard / Projects / Create"
        actionButton={{
          text: 'Back to Projects',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/projects'),
        }}
      />

      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      {createProjectMutation.isError && (
        <ActionAlert
          error={{
            show: true,
            message: createProjectMutation.error?.message || 'Failed to create project',
          }}
          sx={{ mb: 2 }}
          onClose={() => createProjectMutation.reset()}
        />
      )}

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <ProjectModeSection
              isPlatformProject={formik.values.is_platform_project}
              onPlatformProjectChange={(isPlatform) => {
                formik.setFieldValue('is_platform_project', isPlatform);
                if (isPlatform) {
                  formik.setFieldValue('user_id', undefined);
                }
              }}
              userId={formik.values.user_id}
              onUserIdChange={(userId) => formik.setFieldValue('user_id', userId)}
              users={users?.data || []}
              usersLoading={usersLoading}
              errors={formik.errors}
              touched={formik.touched}
            />

            <BasicInformationSection
              values={formik.values}
              errors={formik.errors}
              touched={formik.touched}
              handleChange={formik.handleChange}
              setFieldValue={formik.setFieldValue}
              propertyTypes={propertyTypes?.data || []}
              propertyTypesLoading={propertyTypesLoading}
            />

            <LocationSection
              values={formik.values}
              errors={formik.errors}
              touched={formik.touched}
              handleChange={formik.handleChange}
              setFieldValue={formik.setFieldValue}
              regions={regions?.data || []}
              townships={townships?.data || []}
              regionsLoading={regionsLoading}
              townshipsLoading={townshipsLoading}
            />

            <PricingSection
              values={formik.values}
              errors={formik.errors}
              touched={formik.touched}
              handleChange={formik.handleChange}
              setFieldValue={formik.setFieldValue}
            />

            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Media Upload{' '}
                  <Typography component="span" color="error.main">
                    *
                  </Typography>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  At least one image is required. You can upload up to 10 files.
                </Typography>
                <MediaUpload
                  uploadedMedia={uploadedMedia}
                  onMediaUpload={(media) => setUploadedMedia((prev) => [...prev, media])}
                  onMediaDelete={(mediaId) =>
                    setUploadedMedia((prev) => prev.filter((media) => media.id !== mediaId))
                  }
                  maxFiles={10}
                  onUploadStart={() =>
                    setUploadState((prev) => ({ ...prev, isUploading: true, uploadedFiles: 0, failedFiles: 0 }))
                  }
                  onUploadProgress={(uploaded, total) =>
                    setUploadState((prev) => ({ ...prev, totalFiles: total, uploadedFiles: uploaded }))
                  }
                  onUploadComplete={() => setUploadState((prev) => ({ ...prev, isUploading: false }))}
                  onUploadError={(error) => {
                    setUploadState((prev) => ({ ...prev, failedFiles: prev.failedFiles + 1 }));
                    showError(error);
                  }}
                />
              </CardContent>
            </Card>

            <UnitTypesSection unitTypes={unitTypes} onChange={setUnitTypes} />
            <PaymentPlansSection paymentPlans={paymentPlans} onChange={setPaymentPlans} />
            <ContactSection
              values={formik.values}
              errors={formik.errors}
              touched={formik.touched}
              handleChange={formik.handleChange}
            />
          </Grid>

          <Grid item xs={12} lg={4}>
            <StatusSection
              values={formik.values}
              handleChange={formik.handleChange}
              setFieldValue={formik.setFieldValue}
            />

            <FormActions
              onSubmit={formik.handleSubmit}
              onCancel={() => navigate('/projects')}
              submitText={
                uploadState.isUploading
                  ? `Uploading... (${uploadState.uploadedFiles}/${uploadState.totalFiles})`
                  : 'Create Project'
              }
              isSubmitting={createProjectMutation.isPending}
              isDisabled={uploadState.isUploading}
            />
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default ProjectCreatePage;
