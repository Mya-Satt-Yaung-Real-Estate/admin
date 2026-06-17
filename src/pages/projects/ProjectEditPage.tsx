import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import PageHeader from '../../components/layout/PageHeader';
import { LoadingSpinner, ActionAlert, MediaUpload } from '../../components/ui';
import { useAlertSystem } from '../../hooks';
import { useProject, useUpdateProject } from '../../services/queries/projects';
import { useUsers } from '../../services/queries/users';
import { usePropertyTypes } from '../../services/queries/properties';
import { useRegions, useTownships } from '../../services/queries/locations';
import { ProjectFormData, ProjectPaymentPlan, ProjectUnitType } from '../../types/project';
import { Media } from '../../types/media';
import { projectUpdateSchema } from '../../validations/schemas/projectSchemas';
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

const ProjectEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = Number(id);

  const [uploadedMedia, setUploadedMedia] = useState<Media[]>([]);
  const [existingMedia, setExistingMedia] = useState<Media[]>([]);
  const [unitTypes, setUnitTypes] = useState<ProjectUnitType[]>([]);
  const [paymentPlans, setPaymentPlans] = useState<ProjectPaymentPlan[]>([]);
  const [uploadState, setUploadState] = useState({
    isUploading: false,
    totalFiles: 0,
    uploadedFiles: 0,
    failedFiles: 0,
  });

  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();
  const { data: projectResponse, isLoading: projectLoading } = useProject(projectId);
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: propertyTypes, isLoading: propertyTypesLoading } = usePropertyTypes();
  const { data: regions, isLoading: regionsLoading } = useRegions();
  const { data: townships, isLoading: townshipsLoading } = useTownships();
  const updateProjectMutation = useUpdateProject();

  const project = projectResponse?.data;

  useEffect(() => {
    if (project?.media?.images) {
      const allMedia: Media[] = project.media.images.map((img) => ({
        id: img.id,
        filename: (img as { file_name?: string }).file_name || img.filename || '',
        url: img.url,
        type: 'image' as const,
        size: img.size || 0,
        formatted_size: img.formatted_size || '0 B',
        mime_type: img.mime_type || 'image/jpeg',
        is_primary: img.is_primary,
        status: 'completed' as const,
        created_at: img.created_at || new Date().toISOString(),
      }));
      setExistingMedia(allMedia);
    }
    if (project?.unit_types) {
      setUnitTypes(project.unit_types);
    }
    if (project?.payment_plans) {
      setPaymentPlans(project.payment_plans);
    }
  }, [project]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      is_platform_project: project?.project_mode === 'platform',
      user_id: project?.project_mode === 'developer' ? project?.user_id : undefined,
      title_en: project?.title_en || '',
      title_mm: project?.title_mm || '',
      property_type_id: project?.property_type?.id,
      region_id: project?.location?.region?.id,
      township_id: project?.location?.township?.id,
      address: project?.location?.address || '',
      total_units: project?.total_units || '',
      completion_text: project?.completion_text || '',
      condition: project?.condition || 'upcoming',
      publish_status: project?.publish_status || 'draft',
      price_min: project?.price?.min != null ? Number(project.price.min) : undefined,
      price_max: project?.price?.max != null ? Number(project.price.max) : undefined,
      currency: project?.price?.currency || 'MMK',
      description_en: project?.description_en || '',
      description_mm: project?.description_mm || '',
      contact_name: project?.contact_info?.name || '',
      contact_phone: project?.contact_info?.phone || '',
      contact_email: project?.contact_info?.email || '',
      show_on_homepage: project?.show_on_homepage || false,
    },
    validationSchema: projectUpdateSchema,
    onSubmit: async (values) => {
      try {
        const allMedia = [...existingMedia, ...uploadedMedia];
        const imageMedia = allMedia.filter((media) => media.type === 'image');
        if (imageMedia.length === 0) {
          showError('At least one image is required.');
          return;
        }

        const validUnitTypes = unitTypes.filter((item) => item.name.trim() !== '');
        const validPaymentPlans = paymentPlans.filter((item) => item.name.trim() !== '');

        const { is_platform_project, user_id, ...restValues } = values;

        const projectData: Partial<ProjectFormData> = {
          ...restValues,
          title_en: values.title_en,
          title_mm: values.title_mm,
          property_type_id: values.property_type_id || 0,
          region_id: values.region_id || 0,
          township_id: values.township_id || 0,
          address: values.address,
          total_units: values.total_units,
          completion_text: values.completion_text,
          condition: values.condition as ProjectFormData['condition'],
          publish_status: values.publish_status as ProjectFormData['publish_status'],
          price_min: values.price_min || 0,
          price_max: values.price_max || 0,
          currency: values.currency as ProjectFormData['currency'],
          description_en: values.description_en,
          description_mm: values.description_mm,
          contact_name: values.contact_name || undefined,
          contact_phone: values.contact_phone || undefined,
          contact_email: values.contact_email || undefined,
          show_on_homepage: values.show_on_homepage,
          media_ids: allMedia.map((media) => media.id),
          unit_types: validUnitTypes,
          payment_plans: validPaymentPlans,
        };

        await updateProjectMutation.mutateAsync({ id: projectId, data: projectData });
        showSuccess('Project updated successfully!', true);
        navigate(`/projects/${projectId}`);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to update project. Please try again.';
        showError(message);
      }
    },
  });

  const isLoading =
    projectLoading || usersLoading || propertyTypesLoading || regionsLoading || townshipsLoading;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!project) {
    return <ActionAlert error={{ show: true, message: 'Project not found' }} />;
  }

  return (
    <Box>
      <PageHeader
        title="Edit Project"
        subtitle={project.title_en}
        breadcrumbs={`Dashboard / Projects / ${project.title_en} / Edit`}
        actionButton={{
          text: 'Back to Project',
          icon: <ArrowBackIcon />,
          onClick: () => navigate(`/projects/${projectId}`),
        }}
      />

      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <ProjectModeSection
              isPlatformProject={formik.values.is_platform_project}
              onPlatformProjectChange={() => undefined}
              userId={formik.values.user_id}
              onUserIdChange={() => undefined}
              users={users?.data || []}
              usersLoading={usersLoading}
              disabled
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
                <MediaUpload
                  uploadedMedia={[...existingMedia, ...uploadedMedia]}
                  onMediaUpload={(media) => setUploadedMedia((prev) => [...prev, media])}
                  onMediaDelete={(mediaId) => {
                    if (existingMedia.find((m) => m.id === mediaId)) {
                      setExistingMedia((prev) => prev.filter((media) => media.id !== mediaId));
                    } else {
                      setUploadedMedia((prev) => prev.filter((media) => media.id !== mediaId));
                    }
                  }}
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
              onCancel={() => navigate(`/projects/${projectId}`)}
              submitText={
                uploadState.isUploading
                  ? `Uploading... (${uploadState.uploadedFiles}/${uploadState.totalFiles})`
                  : 'Update Project'
              }
              isSubmitting={updateProjectMutation.isPending}
              isDisabled={uploadState.isUploading}
            />
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default ProjectEditPage;
