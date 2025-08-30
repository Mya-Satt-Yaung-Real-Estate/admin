// Property-related constants extracted from PropertyCreatePage and PropertyEditPage

export const PROPERTY_CONDITIONS = [
  { value: 'ready', label: 'Ready Decoration' },
  { value: 'some', label: 'Some Decoration' },
  { value: 'no', label: 'No Decoration' },
] as const;

export const PROPERTY_FEATURES = [
  // Outdoor & Recreation
  { value: 'swimming_pool', label_en: 'Swimming Pool', label_mm: 'ရေကူးကန်' },
  { value: 'garden', label_en: 'Garden', label_mm: 'ဥယျာဉ်' },
  { value: 'balcony', label_en: 'Balcony', label_mm: 'ပြတင်းတံခါး' },
  { value: 'terrace', label_en: 'Terrace', label_mm: 'ထပ်ခိုး' },
  { value: 'playground', label_en: 'Playground', label_mm: 'ကစားကွင်း' },
  { value: 'gym', label_en: 'Gym', label_mm: 'အားကစားခန်း' },
  { value: 'tennis_court', label_en: 'Tennis Court', label_mm: 'တင်းနစ်ကွင်း' },
  { value: 'basketball_court', label_en: 'Basketball Court', label_mm: 'ဘတ်စကက်ဘောကွင်း' },
  { value: 'bbq_area', label_en: 'BBQ Area', label_mm: 'ဘာဘီကျူးနေရာ' },
  { value: 'picnic_area', label_en: 'Picnic Area', label_mm: 'ပျော်ပွဲစားနေရာ' },
  { value: 'pool_table', label_en: 'Pool Table', label_mm: 'ပိုးလ်စားပွဲ' },
  { value: 'billiards', label_en: 'Billiards', label_mm: 'ဘီလီယံ' },
  
  // Security & Access
  { value: 'parking', label_en: 'Parking', label_mm: 'ကားရပ်နားရန်' },
  { value: 'security_system', label_en: 'Security System', label_mm: 'လုံခြုံရေးစနစ်' },
  { value: 'cctv', label_en: 'CCTV', label_mm: 'စီစီတီဗွီ' },
  { value: 'guard', label_en: 'Guard', label_mm: 'အစောင့်' },
  { value: 'gated_community', label_en: 'Gated Community', label_mm: 'တံခါးပိတ်ရပ်ကွက်' },
  { value: 'elevator', label_en: 'Elevator', label_mm: 'ဓာတ်လှေကား' },
  { value: 'stairs', label_en: 'Stairs', label_mm: 'လှေကား' },
  { value: 'fire_escape', label_en: 'Fire Escape', label_mm: 'မီးဘေးလွတ်ရာ' },
  { value: 'fire_extinguisher', label_en: 'Fire Extinguisher', label_mm: 'မီးငြိမ်းသတ်စက်' },
  { value: 'smoke_detector', label_en: 'Smoke Detector', label_mm: 'အခိုးအနံ့အာရုံခံကိရိယာ' },
  { value: 'wheelchair_accessible', label_en: 'Wheelchair Accessible', label_mm: 'ဘီးတပ်ကုလားထိုင် ဝင်ရောက်နိုင်' },
  { value: 'ramp', label_en: 'Ramp', label_mm: 'စောင်းတန်း' },
  { value: 'handrails', label_en: 'Handrails', label_mm: 'လက်ကိုင်တန်း' },
  
  // Utilities & Comfort
  { value: 'air_conditioning', label_en: 'Air Conditioning', label_mm: 'လေအေးပေးစက်' },
  { value: 'heating', label_en: 'Heating', label_mm: 'အပူပေးစက်' },
  { value: 'hot_water', label_en: 'Hot Water', label_mm: 'ရေပူ' },
  { value: 'water_heater', label_en: 'Water Heater', label_mm: 'ရေပူပေးစက်' },
  { value: 'water_tank', label_en: 'Water Tank', label_mm: 'ရေကန်' },
  { value: 'water_purifier', label_en: 'Water Purifier', label_mm: 'ရေသန့်စက်' },
  { value: 'generator', label_en: 'Generator', label_mm: 'ဂျင်နရေတာ' },
  { value: 'internet', label_en: 'Internet', label_mm: 'အင်တာနက်' },
  { value: 'wifi', label_en: 'WiFi', label_mm: 'ဝိုင်ဖိုင်' },
  { value: 'cable_tv', label_en: 'Cable TV', label_mm: 'ကြေးနန်းရုပ်မြင်သံကြား' },
  { value: 'tv', label_en: 'TV', label_mm: 'ရုပ်မြင်သံကြား' },
  
  // Interior & Appliances
  { value: 'furnished', label_en: 'Furnished', label_mm: 'ပရိဘောဂပါ' },
  { value: 'kitchen_appliances', label_en: 'Kitchen Appliances', label_mm: 'မီးဖိုချောင်သုံးပစ္စည်း' },
  { value: 'dishwasher', label_en: 'Dishwasher', label_mm: 'ပန်းကန်ဆေးစက်' },
  { value: 'refrigerator', label_en: 'Refrigerator', label_mm: 'ရေခဲသေတ္တာ' },
  { value: 'washing_machine', label_en: 'Washing Machine', label_mm: 'အဝတ်လျှော်စက်' },
  { value: 'dryer', label_en: 'Dryer', label_mm: 'အဝတ်ခြောက်စက်' },
  
  // Storage & Space
  { value: 'storage', label_en: 'Storage', label_mm: 'သိုလှောင်ခန်း' },
  { value: 'office_space', label_en: 'Office Space', label_mm: 'ရုံးခန်း' },
  { value: 'meeting_room', label_en: 'Meeting Room', label_mm: 'အစည်းအဝေးခန်း' },
  { value: 'conference_room', label_en: 'Conference Room', label_mm: 'ညီလာခံခန်း' },
  { value: 'reception_area', label_en: 'Reception Area', label_mm: 'လက်ခံရေးနေရာ' },
  { value: 'library', label_en: 'Library', label_mm: 'စာကြည့်တိုက်' },
  { value: 'meditation_room', label_en: 'Meditation Room', label_mm: 'တရားထိုင်ခန်း' },
  
  // Wellness & Luxury
  { value: 'spa', label_en: 'Spa', label_mm: 'စပါ' },
  { value: 'sauna', label_en: 'Sauna', label_mm: 'ဆော်နာ' },
  { value: 'jacuzzi', label_en: 'Jacuzzi', label_mm: 'ဂျာကူဇီ' },
  
  // Other
  { value: 'pets_allowed', label_en: 'Pets Allowed', label_mm: 'အိမ်မွေးတိရစ္ဆာန်ခွင့်ပြု' },
] as const;

export const PROPERTY_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'sold', label: 'Sold' },
  { value: 'rented', label: 'Rented' },
] as const;

// Type exports for better TypeScript support
export type PropertyCondition = typeof PROPERTY_CONDITIONS[number]['value'];
export type PropertyFeature = typeof PROPERTY_FEATURES[number]['value'];
export type PropertyStatus = typeof PROPERTY_STATUSES[number]['value'];
