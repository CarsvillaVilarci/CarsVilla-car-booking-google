import type { Ionicons } from '@expo/vector-icons';

export interface HelpCategory {
  key: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  serviceLabel: string;
  etaText: string;
}

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    key: 'accident',
    title: 'Accident / Crash',
    subtitle: 'Mid-way collision or crash, need urgent help',
    icon: 'warning-outline',
    serviceLabel: 'Emergency Response Van',
    etaText: 'Priority response',
  },
  {
    key: 'fuel',
    title: 'Fuel Delivery',
    subtitle: 'Ran out of petrol or diesel',
    icon: 'water-outline',
    serviceLabel: 'Fuel Delivery Van',
    etaText: '~20 min away',
  },
  {
    key: 'flat-tyre',
    title: 'Flat Tyre',
    subtitle: 'Puncture or tyre change needed',
    icon: 'ellipse-outline',
    serviceLabel: 'Tyre Technician',
    etaText: '~15 min away',
  },
  {
    key: 'battery',
    title: 'Battery Jumpstart',
    subtitle: "Car won't start, battery issue",
    icon: 'flash-outline',
    serviceLabel: 'Jumpstart Technician',
    etaText: '~18 min away',
  },
  {
    key: 'towing',
    title: 'Towing Service',
    subtitle: 'Vehicle breakdown, needs towing',
    icon: 'construct-outline',
    serviceLabel: 'Tow Truck',
    etaText: '~30 min away',
  },
  {
    key: 'other',
    title: 'Other Issue',
    subtitle: 'Something else went wrong',
    icon: 'help-circle-outline',
    serviceLabel: 'Support Agent',
    etaText: "We'll call you back",
  },
];

export const SOS_CATEGORY: HelpCategory = {
  key: 'sos',
  title: 'Emergency SOS',
  subtitle: '24/7 roadside emergency support',
  icon: 'alert-circle-outline',
  serviceLabel: 'Emergency Response Van',
  etaText: 'Priority response',
};

const DEMO_PARTNER_NAMES = ['Suresh Yadav', 'Amit Barik', 'Ravi Teja', 'Dinesh Oraon', 'Prakash Mahto'];

export interface DemoHelpPartner {
  name: string;
  service: string;
  phone: string;
  etaMinutes: number;
  distanceKm: number;
  rating: number;
}

export function getCategory(categoryKey: string): HelpCategory {
  if (categoryKey === 'sos') return SOS_CATEGORY;
  return HELP_CATEGORIES.find((c) => c.key === categoryKey) ?? HELP_CATEGORIES[HELP_CATEGORIES.length - 1];
}

export function generateDemoPartner(categoryKey: string): DemoHelpPartner {
  const category = getCategory(categoryKey);
  const nameIndex = Math.abs(categoryKey.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0)) % DEMO_PARTNER_NAMES.length;
  return {
    name: DEMO_PARTNER_NAMES[nameIndex],
    service: category.serviceLabel,
    phone: '+911234500000',
    etaMinutes: categoryKey === 'sos' ? 6 : 12 + (nameIndex * 3),
    distanceKm: categoryKey === 'sos' ? 2.1 : 3.5 + nameIndex,
    rating: 4.5 + (nameIndex % 5) * 0.1,
  };
}
