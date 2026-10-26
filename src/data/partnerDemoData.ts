export type ListingTransmission = 'Manual' | 'Automatic';
export type ListingFuelType = 'Petrol' | 'Diesel' | 'CNG';
export type ListingCategory = 'SUV' | 'Sedan' | 'Hatchback' | 'MUV';

export interface PartnerVehicleListing {
  id: string;
  title: string;
  category: ListingCategory;
  pricePerDay: number;
  seats: number;
  transmission: ListingTransmission;
  fuelType: ListingFuelType;
  image: string | null;
  isActive: boolean;
}

export const INITIAL_PARTNER_VEHICLES: PartnerVehicleListing[] = [
  {
    id: 'pv-1',
    title: 'Tata Nexon XM (2022)',
    category: 'SUV',
    pricePerDay: 1800,
    seats: 5,
    transmission: 'Manual',
    fuelType: 'Petrol',
    image: 'https://webpic.carsvilla.org/cars/tata-nexon-xm-2022/5c5950af-3176-4894-bc8f-80ad38e6c0c6.png',
    isActive: true,
  },
  {
    id: 'pv-2',
    title: 'Maruti Suzuki Swift ZXI (2019)',
    category: 'Hatchback',
    pricePerDay: 1300,
    seats: 5,
    transmission: 'Manual',
    fuelType: 'Petrol',
    image: 'https://webpic.carsvilla.org/cars/maruti-suzuki-swift-zxi-2019/daff63a8-eb5e-427c-81fa-18a04b3dd084.png',
    isActive: false,
  },
];

export type RequestStatus = 'pending' | 'accepted' | 'declined';

export interface PartnerIncomingRequest {
  id: string;
  riderName: string;
  riderPhone: string;
  vehicleTitle: string;
  message: string;
  status: RequestStatus;
  createdAt: number;
}

export const INITIAL_PARTNER_REQUESTS: PartnerIncomingRequest[] = [
  {
    id: 'req-1',
    riderName: 'Ananya Sen',
    riderPhone: '+919830001234',
    vehicleTitle: 'Tata Nexon XM (2022)',
    message: 'Hi, is this available this weekend for a trip to Digha?',
    status: 'pending',
    createdAt: Date.now() - 1000 * 60 * 25,
  },
  {
    id: 'req-2',
    riderName: 'Rahul Dey',
    riderPhone: '+919830005678',
    vehicleTitle: 'Maruti Suzuki Swift ZXI (2019)',
    message: 'Need it for 3 days starting tomorrow. Can you do a discount?',
    status: 'pending',
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
  },
  {
    id: 'req-3',
    riderName: 'Priyanka Ghosh',
    riderPhone: '+919830009876',
    vehicleTitle: 'Tata Nexon XM (2022)',
    message: 'Looking to rent for a day trip on Sunday.',
    status: 'accepted',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
  },
];
