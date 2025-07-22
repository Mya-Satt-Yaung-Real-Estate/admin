import { Region } from '../types/location';

export const mockRegions: Region[] = [
  {
    id: 1,
    name: 'Yangon Region',
    status: 'active',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
    description: 'The largest and most populous region of Myanmar, home to the former capital Yangon with its rich colonial heritage and bustling commercial districts.',
    townships: [
      { 
        id: 1, 
        name: 'Downtown Township', 
        regionId: 1, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'The central business district of Yangon, featuring colonial architecture and modern developments.'
      },
      { 
        id: 2, 
        name: 'Golden Valley Township', 
        regionId: 1, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'A residential township in Yangon, known for its diplomatic missions and upscale neighborhoods.'
      },
      { 
        id: 3, 
        name: 'Bahan Township', 
        regionId: 1, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'A popular residential area in Yangon with good transportation links.'
      },
      { 
        id: 4, 
        name: 'Kyauktada Township', 
        regionId: 1, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'A township in Yangon known for its markets and residential areas.'
      },
    ]
  },
  {
    id: 2,
    name: 'Mandalay Region',
    status: 'active',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
    description: 'The second-largest region of Myanmar, centered around the historic royal city of Mandalay with its rich cultural heritage and traditional arts.',
    townships: [
      { 
        id: 5, 
        name: 'Mandalay Township', 
        regionId: 2, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'A township in Mandalay, part of the historic royal city.'
      },
      { 
        id: 6, 
        name: 'Amarapura Township', 
        regionId: 2, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'A township in Mandalay with historical significance.'
      },
      { 
        id: 7, 
        name: 'Sagaing Township', 
        regionId: 2, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'A township in Mandalay known for its cultural heritage.'
      },
      { 
        id: 8, 
        name: 'Mingun Township', 
        regionId: 2, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'A township in Mandalay with ancient pagodas and historical sites.'
      },
    ]
  },
  {
    id: 3,
    name: 'Naypyidaw Union Territory',
    status: 'active',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
    description: 'The capital territory of Myanmar, established in 2005 as a planned city with modern infrastructure and government institutions.',
    townships: [
      { 
        id: 9, 
        name: 'Zabuthiri Township', 
        regionId: 3, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'A township in Naypyidaw, the capital territory.'
      },
      { 
        id: 10, 
        name: 'Ottarathiri Township', 
        regionId: 3, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'A township in Naypyidaw with government offices.'
      },
      { 
        id: 11, 
        name: 'Pobbathiri Township', 
        regionId: 3, 
        status: 'inactive', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-10',
        description: 'A township in Naypyidaw featuring residential areas.'
      },
    ]
  },
  {
    id: 4,
    name: 'Sagaing Region',
    status: 'active',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
    description: 'A region in central Myanmar known for its historical significance and agricultural production.',
    townships: [
      { 
        id: 12, 
        name: 'Sagaing Township', 
        regionId: 4, 
        status: 'inactive', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-10',
        description: 'A township in Sagaing Region, known for its historical sites.'
      },
      { 
        id: 13, 
        name: 'Monywa Township', 
        regionId: 4, 
        status: 'inactive', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-10',
        description: 'A township in Sagaing Region, an important commercial center.'
      },
    ]
  },
  {
    id: 5,
    name: 'Bago Region',
    status: 'active',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
    description: 'A region in southern Myanmar with rich agricultural land and historical monuments.',
    townships: [
      { 
        id: 14, 
        name: 'Bago Township', 
        regionId: 5, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'The capital township of Bago Region with historical significance.'
      },
      { 
        id: 15, 
        name: 'Pyay Township', 
        regionId: 5, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'A major township in Bago Region with archaeological sites.'
      },
    ]
  },
  {
    id: 6,
    name: 'Ayeyarwady Region',
    status: 'active',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
    description: 'A delta region in southern Myanmar, known for its fertile agricultural land and fishing industry.',
    townships: [
      { 
        id: 16, 
        name: 'Pathein Township', 
        regionId: 6, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'The capital township of Ayeyarwady Region, known for its fishing industry.'
      },
      { 
        id: 17, 
        name: 'Hinthada Township', 
        regionId: 6, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'A major agricultural township in the delta region.'
      },
    ]
  },
  {
    id: 7,
    name: 'Magway Region',
    status: 'active',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
    description: 'A dry zone region in central Myanmar, known for oil production and agriculture.',
    townships: [
      { 
        id: 18, 
        name: 'Magway Township', 
        regionId: 7, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'The capital township of Magway Region with oil industry.'
      },
      { 
        id: 19, 
        name: 'Minbu Township', 
        regionId: 7, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'A township known for its agricultural production.'
      },
    ]
  },
  {
    id: 8,
    name: 'Tanintharyi Region',
    status: 'active',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
    description: 'A coastal region in southern Myanmar, known for its beautiful beaches and fishing industry.',
    townships: [
      { 
        id: 20, 
        name: 'Dawei Township', 
        regionId: 8, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'The capital township of Tanintharyi Region with port facilities.'
      },
      { 
        id: 21, 
        name: 'Myeik Township', 
        regionId: 8, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'A coastal township known for its fishing and pearl industry.'
      },
    ]
  },
  {
    id: 9,
    name: 'Kachin State',
    status: 'active',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
    description: 'A mountainous state in northern Myanmar, bordering China and India with rich natural resources.',
    townships: [
      { 
        id: 22, 
        name: 'Myitkyina Township', 
        regionId: 9, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'The capital township of Kachin State with strategic importance.'
      },
      { 
        id: 23, 
        name: 'Bhamo Township', 
        regionId: 9, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'A border township with trade connections to China.'
      },
    ]
  },
  {
    id: 10,
    name: 'Kayah State',
    status: 'active',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
    description: 'A small state in eastern Myanmar, known for its ethnic diversity and mountainous terrain.',
    townships: [
      { 
        id: 24, 
        name: 'Loikaw Township', 
        regionId: 10, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'The capital township of Kayah State with cultural heritage.'
      },
      { 
        id: 25, 
        name: 'Demoso Township', 
        regionId: 10, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'A township known for its traditional Kayah culture.'
      },
    ]
  },
  {
    id: 11,
    name: 'Kayin State',
    status: 'active',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
    description: 'A state in southeastern Myanmar, bordering Thailand with diverse ethnic communities.',
    townships: [
      { 
        id: 26, 
        name: 'Hpa-an Township', 
        regionId: 11, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'The capital township of Kayin State with natural beauty.'
      },
      { 
        id: 27, 
        name: 'Myawaddy Township', 
        regionId: 11, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'A border township with major trade route to Thailand.'
      },
      { 
        id: 28, 
        name: 'Kawkareik Township', 
        regionId: 11, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'Agricultural area with rice and rubber cultivation.'
      },
      { 
        id: 29, 
        name: 'Thandaunggyi Township', 
        regionId: 11, 
        status: 'inactive', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-10',
        description: 'Mountainous area with tea plantations and ethnic villages.'
      },
    ]
  },
  {
    id: 12,
    name: 'Chin State',
    status: 'active',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
    description: 'A mountainous state in western Myanmar, bordering India with unique cultural traditions.',
    townships: [
      { 
        id: 30, 
        name: 'Hakha Township', 
        regionId: 12, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'State capital in the mountains with traditional Chin culture'
      },
      { 
        id: 31, 
        name: 'Falam Township', 
        regionId: 12, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'Historical town with traditional Chin architecture'
      },
      { 
        id: 32, 
        name: 'Mindat Township', 
        regionId: 12, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'Mountain town known for traditional weaving and festivals'
      },
      { 
        id: 33, 
        name: 'Matupi Township', 
        regionId: 12, 
        status: 'inactive', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-10',
        description: 'Remote mountainous area with traditional agriculture'
      },
    ]
  },
  {
    id: 13,
    name: 'Mon State',
    status: 'active',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
    description: 'A state in southeastern Myanmar, known for its ancient history and coastal areas.',
    townships: [
      { 
        id: 34, 
        name: 'Mawlamyine Township', 
        regionId: 13, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'State capital with colonial architecture and cultural heritage'
      },
      { 
        id: 35, 
        name: 'Thaton Township', 
        regionId: 13, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'Ancient capital with historical pagodas and Mon culture'
      },
      { 
        id: 36, 
        name: 'Kyaikmaraw Township', 
        regionId: 13, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'Coastal area with fishing industry and traditional crafts'
      },
      { 
        id: 37, 
        name: 'Chaungzon Township', 
        regionId: 13, 
        status: 'inactive', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-10',
        description: 'Rural area with agriculture and traditional Mon villages'
      },
    ]
  },
  {
    id: 14,
    name: 'Rakhine State',
    status: 'active',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
    description: 'A coastal state in western Myanmar, known for its beautiful beaches and cultural heritage.',
    townships: [
      { 
        id: 38, 
        name: 'Sittwe Township', 
        regionId: 14, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'State capital with port facilities and cultural diversity'
      },
      { 
        id: 39, 
        name: 'Kyaukpyu Township', 
        regionId: 14, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'Coastal town with oil and gas infrastructure'
      },
      { 
        id: 40, 
        name: 'Thandwe Township', 
        regionId: 14, 
        status: 'active', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-15',
        description: 'Tourist destination with Ngapali Beach and cultural sites'
      },
      { 
        id: 41, 
        name: 'Maungdaw Township', 
        regionId: 14, 
        status: 'inactive', 
        createdAt: '2023-01-01',
        updatedAt: '2024-01-10',
        description: 'Border area with Bangladesh and traditional fishing'
      },
    ]
  },
];

// Helper functions
export const getAllTownships = () => mockRegions.flatMap(region => region.townships);

export const getActiveRegions = () => mockRegions.filter(region => region.status === 'active');

export const getActiveTownships = () => getAllTownships().filter(township => township.status === 'active');

export const getTownshipsByRegion = (regionId: number) => {
  const region = mockRegions.find(r => r.id === regionId);
  return region ? region.townships : [];
};

export const searchLocations = (searchTerm: string) => {
  const term = searchTerm.toLowerCase();
  return mockRegions.filter(region =>
    region.name.toLowerCase().includes(term) ||
    region.description.toLowerCase().includes(term) ||
    region.townships.some(township =>
      township.name.toLowerCase().includes(term) ||
      township.description.toLowerCase().includes(term)
    )
  );
}; 