import { Region } from '../types/location';

export const mockRegions: Region[] = [
  {
    id: 1,
    name: 'Yangon Region',
    status: 'active',
    createdAt: '2023-01-01',
    description: 'The largest and most populous region of Myanmar, including the former capital city.',
    townships: [
      { id: 1, name: 'Downtown Yangon', regionId: 1, status: 'active', createdAt: '2023-01-01' },
      { id: 2, name: 'Bahan Township', regionId: 1, status: 'active', createdAt: '2023-01-01' },
      { id: 3, name: 'Sanchaung Township', regionId: 1, status: 'active', createdAt: '2023-01-01' },
      { id: 4, name: 'Tamwe Township', regionId: 1, status: 'active', createdAt: '2023-01-01' },
    ]
  },
  {
    id: 2,
    name: 'Mandalay Region',
    status: 'active',
    createdAt: '2023-01-01',
    description: 'The second largest region, known for its cultural heritage and royal history.',
    townships: [
      { id: 5, name: 'Chanayethazan Township', regionId: 2, status: 'active', createdAt: '2023-01-01' },
      { id: 6, name: 'Mahaaungmye Township', regionId: 2, status: 'active', createdAt: '2023-01-01' },
      { id: 7, name: 'Pyigyidagun Township', regionId: 2, status: 'active', createdAt: '2023-01-01' },
    ]
  },
  {
    id: 3,
    name: 'Naypyidaw Union Territory',
    status: 'active',
    createdAt: '2023-01-01',
    description: 'The capital territory of Myanmar, established in 2005.',
    townships: [
      { id: 8, name: 'Ottarathiri Township', regionId: 3, status: 'active', createdAt: '2023-01-01' },
      { id: 9, name: 'Pobbathiri Township', regionId: 3, status: 'active', createdAt: '2023-01-01' },
      { id: 10, name: 'Zabuthiri Township', regionId: 3, status: 'active', createdAt: '2023-01-01' },
    ]
  },
  {
    id: 4,
    name: 'Sagaing Region',
    status: 'inactive',
    createdAt: '2023-01-01',
    description: 'A region in northwestern Myanmar, known for its historical sites.',
    townships: [
      { id: 11, name: 'Sagaing Township', regionId: 4, status: 'inactive', createdAt: '2023-01-01' },
      { id: 12, name: 'Monywa Township', regionId: 4, status: 'inactive', createdAt: '2023-01-01' },
    ]
  },
  {
    id: 5,
    name: 'Bago Region',
    status: 'active',
    createdAt: '2023-01-01',
    description: 'A region in southern Myanmar, known for its agricultural production.',
    townships: [
      { id: 13, name: 'Bago Township', regionId: 5, status: 'active', createdAt: '2023-01-01' },
      { id: 14, name: 'Pyay Township', regionId: 5, status: 'active', createdAt: '2023-01-01' },
    ]
  },
  {
    id: 6,
    name: 'Magway Region',
    status: 'active',
    createdAt: '2023-01-01',
    description: 'A region in central Myanmar, known for its oil fields.',
    townships: [
      { id: 15, name: 'Magway Township', regionId: 6, status: 'active', createdAt: '2023-01-01' },
      { id: 16, name: 'Pakokku Township', regionId: 6, status: 'active', createdAt: '2023-01-01' },
    ]
  },
  {
    id: 7,
    name: 'Tanintharyi Region',
    status: 'active',
    createdAt: '2023-01-01',
    description: 'The southernmost region of Myanmar, bordering Thailand.',
    townships: [
      { id: 17, name: 'Dawei Township', regionId: 7, status: 'active', createdAt: '2023-01-01' },
      { id: 18, name: 'Myeik Township', regionId: 7, status: 'active', createdAt: '2023-01-01' },
    ]
  },
  {
    id: 8,
    name: 'Ayeyarwady Region',
    status: 'active',
    createdAt: '2023-01-01',
    description: 'A region in the Irrawaddy Delta, known for rice cultivation.',
    townships: [
      { id: 19, name: 'Pathein Township', regionId: 8, status: 'active', createdAt: '2023-01-01' },
      { id: 20, name: 'Hinthada Township', regionId: 8, status: 'active', createdAt: '2023-01-01' },
    ]
  },
  {
    id: 9,
    name: 'Kachin State',
    status: 'active',
    createdAt: '2023-01-01',
    description: 'The northernmost state of Myanmar, bordering China and India.',
    townships: [
      { id: 21, name: 'Myitkyina Township', regionId: 9, status: 'active', createdAt: '2023-01-01' },
      { id: 22, name: 'Bhamo Township', regionId: 9, status: 'active', createdAt: '2023-01-01' },
    ]
  },
  {
    id: 10,
    name: 'Kayah State',
    status: 'active',
    createdAt: '2023-01-01',
    description: 'A small state in eastern Myanmar, known for its ethnic diversity.',
    townships: [
      { id: 23, name: 'Loikaw Township', regionId: 10, status: 'active', createdAt: '2023-01-01' },
      { id: 24, name: 'Demoso Township', regionId: 10, status: 'active', createdAt: '2023-01-01' },
    ]
  },
  {
    id: 11,
    name: 'Kayin State',
    status: 'active',
    createdAt: '2023-01-01',
    description: 'A state in southeastern Myanmar, bordering Thailand.',
    townships: [
      { id: 25, name: 'Hpa-an Township', regionId: 11, status: 'active', createdAt: '2023-01-01' },
      { id: 26, name: 'Myawaddy Township', regionId: 11, status: 'active', createdAt: '2023-01-01' },
    ]
  },
  {
    id: 12,
    name: 'Chin State',
    status: 'active',
    createdAt: '2023-01-01',
    description: 'A mountainous state in western Myanmar, bordering India.',
    townships: [
      { id: 27, name: 'Hakha Township', regionId: 12, status: 'active', createdAt: '2023-01-01' },
      { id: 28, name: 'Falam Township', regionId: 12, status: 'active', createdAt: '2023-01-01' },
    ]
  },
  {
    id: 13,
    name: 'Mon State',
    status: 'active',
    createdAt: '2023-01-01',
    description: 'A state in southeastern Myanmar, known for its ancient history.',
    townships: [
      { id: 29, name: 'Mawlamyine Township', regionId: 13, status: 'active', createdAt: '2023-01-01' },
      { id: 30, name: 'Thaton Township', regionId: 13, status: 'active', createdAt: '2023-01-01' },
    ]
  },
  {
    id: 14,
    name: 'Rakhine State',
    status: 'active',
    createdAt: '2023-01-01',
    description: 'A state in western Myanmar, bordering Bangladesh.',
    townships: [
      { id: 31, name: 'Sittwe Township', regionId: 14, status: 'active', createdAt: '2023-01-01' },
      { id: 32, name: 'Kyaukpyu Township', regionId: 14, status: 'active', createdAt: '2023-01-01' },
    ]
  }
];

// Helper function to get all townships from all regions
export const getAllTownships = () => mockRegions.flatMap(region => region.townships);

// Helper function to get active regions only
export const getActiveRegions = () => mockRegions.filter(region => region.status === 'active'); 