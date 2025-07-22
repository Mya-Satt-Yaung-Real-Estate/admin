import { Region } from '../types/location';

export const mockRegions: Region[] = [
  {
    id: 1,
    name: 'Yangon Region',
    status: 'active',
    createdAt: '2023-01-01',
    description: 'The largest and most populous region of Myanmar, including the former capital city with over 7 million residents.',
    townships: [
      { 
        id: 1, 
        name: 'Downtown Yangon', 
        regionId: 1, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Historic downtown area with colonial architecture and major business districts'
      },
      { 
        id: 2, 
        name: 'Bahan Township', 
        regionId: 1, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Residential area known for Shwedagon Pagoda and diplomatic missions'
      },
      { 
        id: 3, 
        name: 'Sanchaung Township', 
        regionId: 1, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Popular residential area with shopping centers and restaurants'
      },
      { 
        id: 4, 
        name: 'Tamwe Township', 
        regionId: 1, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Residential township with markets and local businesses'
      },
      { 
        id: 5, 
        name: 'Thingangyun Township', 
        regionId: 1, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Industrial and residential area with manufacturing facilities'
      },
      { 
        id: 6, 
        name: 'Hlaing Township', 
        regionId: 1, 
        status: 'inactive', 
        createdAt: '2023-01-01',
        description: 'Industrial zone with factories and warehouses'
      },
    ]
  },
  {
    id: 2,
    name: 'Mandalay Region',
    status: 'active',
    createdAt: '2023-01-01',
    description: 'The second largest region, known for its cultural heritage and royal history with ancient palaces.',
    townships: [
      { 
        id: 7, 
        name: 'Chanayethazan Township', 
        regionId: 2, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Historic township with Mandalay Palace and royal heritage sites'
      },
      { 
        id: 8, 
        name: 'Mahaaungmye Township', 
        regionId: 2, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Cultural center with traditional markets and handicrafts'
      },
      { 
        id: 9, 
        name: 'Pyigyidagun Township', 
        regionId: 2, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Residential area with modern developments and shopping centers'
      },
      { 
        id: 10, 
        name: 'Amarapura Township', 
        regionId: 2, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Ancient capital known for U Bein Bridge and silk weaving'
      },
      { 
        id: 11, 
        name: 'Sagaing Township', 
        regionId: 2, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Religious center with numerous pagodas and monasteries'
      },
    ]
  },
  {
    id: 3,
    name: 'Naypyidaw Union Territory',
    status: 'active',
    createdAt: '2023-01-01',
    description: 'The capital territory of Myanmar, established in 2005 as the new administrative capital.',
    townships: [
      { 
        id: 12, 
        name: 'Ottarathiri Township', 
        regionId: 3, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Government administrative center with ministries and offices'
      },
      { 
        id: 13, 
        name: 'Pobbathiri Township', 
        regionId: 3, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Residential area for government employees and families'
      },
      { 
        id: 14, 
        name: 'Zabuthiri Township', 
        regionId: 3, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Commercial district with shopping centers and hotels'
      },
      { 
        id: 15, 
        name: 'Dekkhinathiri Township', 
        regionId: 3, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Diplomatic zone with embassies and international organizations'
      },
    ]
  },
  {
    id: 4,
    name: 'Sagaing Region',
    status: 'inactive',
    createdAt: '2023-01-01',
    description: 'A region in northwestern Myanmar, known for its historical sites and traditional crafts.',
    townships: [
      { 
        id: 16, 
        name: 'Sagaing Township', 
        regionId: 4, 
        status: 'inactive', 
        createdAt: '2023-01-01',
        description: 'Ancient capital with historic pagodas and monasteries'
      },
      { 
        id: 17, 
        name: 'Monywa Township', 
        regionId: 4, 
        status: 'inactive', 
        createdAt: '2023-01-01',
        description: 'Commercial center with copper mining and agriculture'
      },
      { 
        id: 18, 
        name: 'Shwebo Township', 
        regionId: 4, 
        status: 'inactive', 
        createdAt: '2023-01-01',
        description: 'Historical town known for rice cultivation and traditional crafts'
      },
    ]
  },
  {
    id: 5,
    name: 'Bago Region',
    status: 'active',
    createdAt: '2023-01-01',
    description: 'A region in southern Myanmar, known for its agricultural production and historical significance.',
    townships: [
      { 
        id: 19, 
        name: 'Bago Township', 
        regionId: 5, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Ancient capital with Shwemawdaw Pagoda and historical sites'
      },
      { 
        id: 20, 
        name: 'Pyay Township', 
        regionId: 5, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'River port city with archaeological sites and cultural heritage'
      },
      { 
        id: 21, 
        name: 'Taungoo Township', 
        regionId: 5, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Historical town known for its strategic location and agriculture'
      },
      { 
        id: 22, 
        name: 'Tharrawaddy Township', 
        regionId: 5, 
        status: 'inactive', 
        createdAt: '2023-01-01',
        description: 'Agricultural area with rice and sugarcane cultivation'
      },
    ]
  },
  {
    id: 6,
    name: 'Magway Region',
    status: 'active',
    createdAt: '2023-01-01',
    description: 'A region in central Myanmar, known for its oil fields and agricultural production.',
    townships: [
      { 
        id: 23, 
        name: 'Magway Township', 
        regionId: 6, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Regional capital with oil refineries and agricultural markets'
      },
      { 
        id: 24, 
        name: 'Pakokku Township', 
        regionId: 6, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'River port city with tobacco production and traditional crafts'
      },
      { 
        id: 25, 
        name: 'Minbu Township', 
        regionId: 6, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Agricultural center with oil fields and natural gas production'
      },
      { 
        id: 26, 
        name: 'Gangaw Township', 
        regionId: 6, 
        status: 'inactive', 
        createdAt: '2023-01-01',
        description: 'Mountainous area with traditional weaving and handicrafts'
      },
    ]
  },
  {
    id: 7,
    name: 'Tanintharyi Region',
    status: 'active',
    createdAt: '2023-01-01',
    description: 'The southernmost region of Myanmar, bordering Thailand with beautiful coastal areas.',
    townships: [
      { 
        id: 27, 
        name: 'Dawei Township', 
        regionId: 7, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Coastal city with deep-sea port and industrial development'
      },
      { 
        id: 28, 
        name: 'Myeik Township', 
        regionId: 7, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Island city known for pearl farming and fishing industry'
      },
      { 
        id: 29, 
        name: 'Kawthaung Township', 
        regionId: 7, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Southernmost town with border trade and tourism'
      },
      { 
        id: 30, 
        name: 'Thayetchaung Township', 
        regionId: 7, 
        status: 'inactive', 
        createdAt: '2023-01-01',
        description: 'Rural area with rubber plantations and agriculture'
      },
    ]
  },
  {
    id: 8,
    name: 'Ayeyarwady Region',
    status: 'active',
    createdAt: '2023-01-01',
    description: 'A region in the Irrawaddy Delta, known for rice cultivation and fishing industry.',
    townships: [
      { 
        id: 31, 
        name: 'Pathein Township', 
        regionId: 8, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Regional capital known for rice production and traditional umbrellas'
      },
      { 
        id: 32, 
        name: 'Hinthada Township', 
        regionId: 8, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Agricultural center with rice mills and fishing industry'
      },
      { 
        id: 33, 
        name: 'Myaungmya Township', 
        regionId: 8, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Delta town with traditional fishing and agriculture'
      },
      { 
        id: 34, 
        name: 'Pyapon Township', 
        regionId: 8, 
        status: 'inactive', 
        createdAt: '2023-01-01',
        description: 'Coastal area with mangrove forests and fishing villages'
      },
    ]
  },
  {
    id: 9,
    name: 'Kachin State',
    status: 'active',
    createdAt: '2023-01-01',
    description: 'The northernmost state of Myanmar, bordering China and India with mountainous terrain.',
    townships: [
      { 
        id: 35, 
        name: 'Myitkyina Township', 
        regionId: 9, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'State capital with jade mining and border trade'
      },
      { 
        id: 36, 
        name: 'Bhamo Township', 
        regionId: 9, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'River port city with trade routes to China'
      },
      { 
        id: 37, 
        name: 'Putao Township', 
        regionId: 9, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Northernmost town with snow-capped mountains and trekking'
      },
      { 
        id: 38, 
        name: 'Mohnyin Township', 
        regionId: 9, 
        status: 'inactive', 
        createdAt: '2023-01-01',
        description: 'Historical town with traditional agriculture and forestry'
      },
    ]
  },
  {
    id: 10,
    name: 'Kayah State',
    status: 'active',
    createdAt: '2023-01-01',
    description: 'A small state in eastern Myanmar, known for its ethnic diversity and mountainous landscape.',
    townships: [
      { 
        id: 39, 
        name: 'Loikaw Township', 
        regionId: 10, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'State capital with ethnic diversity and cultural heritage'
      },
      { 
        id: 40, 
        name: 'Demoso Township', 
        regionId: 10, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Mountainous area with traditional villages and agriculture'
      },
      { 
        id: 41, 
        name: 'Hpruso Township', 
        regionId: 10, 
        status: 'inactive', 
        createdAt: '2023-01-01',
        description: 'Rural area with traditional farming and handicrafts'
      },
    ]
  },
  {
    id: 11,
    name: 'Kayin State',
    status: 'active',
    createdAt: '2023-01-01',
    description: 'A state in southeastern Myanmar, bordering Thailand with diverse ethnic communities.',
    townships: [
      { 
        id: 42, 
        name: 'Hpa-an Township', 
        regionId: 11, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'State capital with limestone caves and cultural sites'
      },
      { 
        id: 43, 
        name: 'Myawaddy Township', 
        regionId: 11, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Border town with major trade route to Thailand'
      },
      { 
        id: 44, 
        name: 'Kawkareik Township', 
        regionId: 11, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Agricultural area with rice and rubber cultivation'
      },
      { 
        id: 45, 
        name: 'Thandaunggyi Township', 
        regionId: 11, 
        status: 'inactive', 
        createdAt: '2023-01-01',
        description: 'Mountainous area with tea plantations and ethnic villages'
      },
    ]
  },
  {
    id: 12,
    name: 'Chin State',
    status: 'active',
    createdAt: '2023-01-01',
    description: 'A mountainous state in western Myanmar, bordering India with unique cultural traditions.',
    townships: [
      { 
        id: 46, 
        name: 'Hakha Township', 
        regionId: 12, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'State capital in the mountains with traditional Chin culture'
      },
      { 
        id: 47, 
        name: 'Falam Township', 
        regionId: 12, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Historical town with traditional Chin architecture'
      },
      { 
        id: 48, 
        name: 'Mindat Township', 
        regionId: 12, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Mountain town known for traditional weaving and festivals'
      },
      { 
        id: 49, 
        name: 'Matupi Township', 
        regionId: 12, 
        status: 'inactive', 
        createdAt: '2023-01-01',
        description: 'Remote mountainous area with traditional agriculture'
      },
    ]
  },
  {
    id: 13,
    name: 'Mon State',
    status: 'active',
    createdAt: '2023-01-01',
    description: 'A state in southeastern Myanmar, known for its ancient history and coastal areas.',
    townships: [
      { 
        id: 50, 
        name: 'Mawlamyine Township', 
        regionId: 13, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'State capital with colonial architecture and cultural heritage'
      },
      { 
        id: 51, 
        name: 'Thaton Township', 
        regionId: 13, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Ancient capital with historical pagodas and Mon culture'
      },
      { 
        id: 52, 
        name: 'Kyaikmaraw Township', 
        regionId: 13, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Coastal area with fishing industry and traditional crafts'
      },
      { 
        id: 53, 
        name: 'Chaungzon Township', 
        regionId: 13, 
        status: 'inactive', 
        createdAt: '2023-01-01',
        description: 'Rural area with agriculture and traditional Mon villages'
      },
    ]
  },
  {
    id: 14,
    name: 'Rakhine State',
    status: 'active',
    createdAt: '2023-01-01',
    description: 'A state in western Myanmar, bordering Bangladesh with rich cultural heritage.',
    townships: [
      { 
        id: 54, 
        name: 'Sittwe Township', 
        regionId: 14, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'State capital with port facilities and cultural diversity'
      },
      { 
        id: 55, 
        name: 'Kyaukpyu Township', 
        regionId: 14, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Coastal town with oil and gas infrastructure'
      },
      { 
        id: 56, 
        name: 'Thandwe Township', 
        regionId: 14, 
        status: 'active', 
        createdAt: '2023-01-01',
        description: 'Tourist destination with Ngapali Beach and cultural sites'
      },
      { 
        id: 57, 
        name: 'Maungdaw Township', 
        regionId: 14, 
        status: 'inactive', 
        createdAt: '2023-01-01',
        description: 'Border area with Bangladesh and traditional fishing'
      },
    ]
  }
];

// Helper function to get all townships from all regions
export const getAllTownships = () => mockRegions.flatMap(region => region.townships);

// Helper function to get active regions only
export const getActiveRegions = () => mockRegions.filter(region => region.status === 'active');

// Helper function to get active townships only
export const getActiveTownships = () => getAllTownships().filter(township => township.status === 'active');

// Helper function to get townships by region
export const getTownshipsByRegion = (regionId: number) => {
  const region = mockRegions.find(r => r.id === regionId);
  return region ? region.townships : [];
};

// Helper function to search locations
export const searchLocations = (searchTerm: string) => {
  const term = searchTerm.toLowerCase();
  const results = {
    regions: mockRegions.filter(region => 
      region.name.toLowerCase().includes(term) || 
      region.description?.toLowerCase().includes(term)
    ),
    townships: getAllTownships().filter(township => 
      township.name.toLowerCase().includes(term) || 
      township.description?.toLowerCase().includes(term)
    )
  };
  return results;
}; 