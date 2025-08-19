// Points React Query hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pointsAPI } from '../api/points';
import { 
  CreatePointPackageData, 
  UpdatePointPackageData, 
  CreatePointPurchaseRequestData, 
  UpdatePointPurchaseRequestData,
  ApproveRejectRequestData
} from '../../types/point';


// Query keys
export const pointKeys = {
  all: ['points'] as const,
  packages: () => [...pointKeys.all, 'packages'] as const,
  package: (slug: string) => [...pointKeys.packages(), slug] as const,
  purchaseRequests: () => [...pointKeys.all, 'purchase-requests'] as const,
  purchaseRequest: (id: number) => [...pointKeys.purchaseRequests(), id] as const,
};

// Point Package hooks
export const usePointPackages = () => {
  return useQuery({
    queryKey: pointKeys.packages(),
    queryFn: () => pointsAPI.getPointPackages(),
  });
};

export const usePointPackage = (slug: string) => {
  return useQuery({
    queryKey: pointKeys.package(slug),
    queryFn: () => pointsAPI.getPointPackage(slug),
    enabled: !!slug,
  });
};

export const useCreatePointPackage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePointPackageData) => pointsAPI.createPointPackage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pointKeys.packages() });
    },
  });
};

export const useUpdatePointPackage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdatePointPackageData }) =>
      pointsAPI.updatePointPackage(slug, data),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: pointKeys.packages() });
      queryClient.invalidateQueries({ queryKey: pointKeys.package(slug) });
    },
  });
};

export const useDeletePointPackage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ slug, deletion_reason }: { slug: string; deletion_reason?: string }) =>
      pointsAPI.deletePointPackage(slug, deletion_reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pointKeys.packages() });
    },
  });
};

export const useRestorePointPackage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (slug: string) => pointsAPI.restorePointPackage(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pointKeys.packages() });
    },
  });
};

export const useForceDeletePointPackage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (slug: string) => pointsAPI.forceDeletePointPackage(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pointKeys.packages() });
    },
  });
};

export const useTogglePointPackageStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (slug: string) => pointsAPI.togglePointPackageStatus(slug),
    onSuccess: (_, slug) => {
      queryClient.invalidateQueries({ queryKey: pointKeys.packages() });
      queryClient.invalidateQueries({ queryKey: pointKeys.package(slug) });
    },
  });
};

// Point Purchase Request hooks
export const usePointPurchaseRequests = () => {
  return useQuery({
    queryKey: pointKeys.purchaseRequests(),
    queryFn: () => pointsAPI.getPointPurchaseRequests(),
  });
};

export const usePointPurchaseRequest = (id: number) => {
  return useQuery({
    queryKey: pointKeys.purchaseRequest(id),
    queryFn: () => pointsAPI.getPointPurchaseRequest(id),
    enabled: !!id,
  });
};

export const useCreatePointPurchaseRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePointPurchaseRequestData) => pointsAPI.createPointPurchaseRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pointKeys.purchaseRequests() });
    },
  });
};

export const useUpdatePointPurchaseRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePointPurchaseRequestData }) =>
      pointsAPI.updatePointPurchaseRequest(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: pointKeys.purchaseRequests() });
      queryClient.invalidateQueries({ queryKey: pointKeys.purchaseRequest(id) });
    },
  });
};

export const useDeletePointPurchaseRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => pointsAPI.deletePointPurchaseRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pointKeys.purchaseRequests() });
    },
  });
};

export const useApproveRejectPointPurchaseRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ApproveRejectRequestData }) =>
      pointsAPI.approveRejectPointPurchaseRequest(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: pointKeys.purchaseRequests() });
      queryClient.invalidateQueries({ queryKey: pointKeys.purchaseRequest(id) });
    },
  });
};
