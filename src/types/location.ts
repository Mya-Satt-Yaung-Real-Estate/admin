export interface Township {
  id: number;
  name: string;
  regionId: number;
  status: 'active' | 'inactive';
  createdAt: string;
  description?: string;
}

export interface Region {
  id: number;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
  description?: string;
  townships: Township[];
}

export interface RegionFormData {
  name: string;
  status: 'active' | 'inactive';
  description: string;
}

export interface TownshipFormData {
  name: string;
  regionId: number;
  status: 'active' | 'inactive';
  description: string;
}

export interface LocationFilters {
  searchTerm: string;
  statusFilter: string;
} 