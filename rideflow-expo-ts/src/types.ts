export type AppRole = 'RIDER' | 'DRIVER';

export type VehicleCategory = 'ALL' | 'SEDAN' | 'SUV' | 'ELECTRIC' | 'LUXURY' | 'ECONOMY';

export type SortOption = 'RECOMMENDED' | 'PRICE_LOW_TO_HIGH' | 'HIGHEST_RATED' | 'FASTEST_ETA';

export type TripStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'ARRIVED_AT_PICKUP'
  | 'IN_TRANSIT'
  | 'COMPLETED'
  | 'CANCELLED';

export interface PresetLocation {
  id: string;
  name: string;
  address: string;
  zone: string;
  lat: number;
  lng: number;
}

export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  category: Exclude<VehicleCategory, 'ALL'>;
  pricePerKm: number;
  baseFare: number;
  seats: number;
  luggage: number;
  rating: number;
  tripsCount: number;
  transmission: string;
  rangeOrFuel: string;
  licensePlate: string;
  driverName: string;
  driverRating: number;
  driverPhone: string;
  isAvailable: boolean;
  etaMinutes: number;
  accentColor: string;
  features: string[];
}

export interface RideRequest {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehicleCategory: string;
  licensePlate: string;
  driverName: string;
  driverRating: number;
  driverPhone: string;
  riderName: string;
  riderPhone: string;
  pickupName: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffName: string;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  distanceKm: number;
  durationMinutes: number;
  baseFare: number;
  distanceFare: number;
  serviceFee: number;
  totalFare: number;
  status: TripStatus;
  paymentMethod: string;
  userRating: number;
  createdAt: number;
}

export interface LiveTelemetry {
  driverLat: number;
  driverLng: number;
  bearingDegrees: number;
  speedKmh: number;
  progressFraction: number;
  remainingKm: number;
  remainingMinutes: number;
  statusMessage: string;
}
