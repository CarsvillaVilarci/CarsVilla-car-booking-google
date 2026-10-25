import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================
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

// ==========================================
// 2. SEED DATA & DISTANCE CALCULATOR
// ==========================================
const PRESET_LOCATIONS: PresetLocation[] = [
  {
    id: 'loc_downtown',
    name: 'Metropolis Grand Central',
    address: '100 Market St, Financial District',
    zone: 'Downtown Core',
    lat: 37.7936,
    lng: -122.3958,
  },
  {
    id: 'loc_airport',
    name: 'International Terminal T2',
    address: 'Airport Access Rd, Gate B4',
    zone: 'Airport Zone',
    lat: 37.6213,
    lng: -122.379,
  },
  {
    id: 'loc_tech_park',
    name: 'Silicon Harbor Innovation Hub',
    address: '450 Mission Bay Blvd',
    zone: 'Tech District',
    lat: 37.7705,
    lng: -122.3892,
  },
  {
    id: 'loc_marina',
    name: 'Bayfront Marina & Pier 39',
    address: '2100 Embarcadero Promenade',
    zone: 'Waterfront',
    lat: 37.8087,
    lng: -122.4098,
  },
  {
    id: 'loc_medical',
    name: 'Parnassus Medical Center',
    address: '505 Parnassus Ave, Heights',
    zone: 'West Medical',
    lat: 37.7631,
    lng: -122.4586,
  },
];

const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh_01',
    name: 'Model S Plaid',
    brand: 'Tesla',
    category: 'ELECTRIC',
    pricePerKm: 2.4,
    baseFare: 6.5,
    seats: 4,
    luggage: 3,
    rating: 4.97,
    tripsCount: 412,
    transmission: 'EV Direct',
    rangeOrFuel: '637 km Range',
    licensePlate: 'EV-904X',
    driverName: 'Marcus Vance',
    driverRating: 4.96,
    driverPhone: '+1 (555) 234-8910',
    isAvailable: true,
    etaMinutes: 2,
    accentColor: '#00D2FF',
    features: ['Autopilot Glass Roof', 'Ultra-Fast Wi-Fi', 'Heated Seats'],
  },
  {
    id: 'veh_02',
    name: 'Escalade IQ Executive',
    brand: 'Cadillac',
    category: 'SUV',
    pricePerKm: 3.2,
    baseFare: 9.0,
    seats: 7,
    luggage: 6,
    rating: 4.94,
    tripsCount: 289,
    transmission: 'Automatic',
    rangeOrFuel: '720 km EV',
    licensePlate: 'SUV-771K',
    driverName: 'Elena Rostova',
    driverRating: 4.93,
    driverPhone: '+1 (555) 390-1122',
    isAvailable: true,
    etaMinutes: 4,
    accentColor: '#FFB300',
    features: ['7 Captain Seats', 'XXL Cargo Hold', 'Rear Climate Zone'],
  },
  {
    id: 'veh_03',
    name: 'EQS 580 Pinnacle',
    brand: 'Mercedes-Benz',
    category: 'LUXURY',
    pricePerKm: 3.85,
    baseFare: 12.0,
    seats: 4,
    luggage: 3,
    rating: 4.99,
    tripsCount: 198,
    transmission: 'EV Direct',
    rangeOrFuel: '560 km Range',
    licensePlate: 'VIP-001M',
    driverName: 'Julian Sterling',
    driverRating: 4.99,
    driverPhone: '+1 (555) 881-4401',
    isAvailable: true,
    etaMinutes: 5,
    accentColor: '#B388FF',
    features: ['Executive Rear Lounge', 'Massage Seats', 'Chauffeur Service'],
  },
  {
    id: 'veh_04',
    name: 'Camry Hybrid XSE',
    brand: 'Toyota',
    category: 'SEDAN',
    pricePerKm: 1.65,
    baseFare: 4.0,
    seats: 4,
    luggage: 2,
    rating: 4.89,
    tripsCount: 845,
    transmission: 'Automatic',
    rangeOrFuel: '22 km/L Hybrid',
    licensePlate: 'CAB-408T',
    driverName: 'David Chen',
    driverRating: 4.91,
    driverPhone: '+1 (555) 612-7734',
    isAvailable: true,
    etaMinutes: 1,
    accentColor: '#00E676',
    features: ['USB-C Fast Charge', 'Fuel Saver', 'Spacious Legroom'],
  },
  {
    id: 'veh_05',
    name: 'IONIQ 5 N-Line',
    brand: 'Hyundai',
    category: 'ELECTRIC',
    pricePerKm: 2.05,
    baseFare: 5.0,
    seats: 5,
    luggage: 3,
    rating: 4.92,
    tripsCount: 360,
    transmission: 'EV Direct',
    rangeOrFuel: '488 km Range',
    licensePlate: 'EV-512H',
    driverName: 'Sophia Patel',
    driverRating: 4.95,
    driverPhone: '+1 (555) 901-3345',
    isAvailable: true,
    etaMinutes: 3,
    accentColor: '#00D2FF',
    features: ['V2L Power Outlet', 'Reclining Lounge', 'Zero Emissions'],
  },
  {
    id: 'veh_06',
    name: 'Prius Prime Eco',
    brand: 'Toyota',
    category: 'ECONOMY',
    pricePerKm: 1.25,
    baseFare: 3.0,
    seats: 4,
    luggage: 2,
    rating: 4.86,
    tripsCount: 1120,
    transmission: 'Automatic',
    rangeOrFuel: '26 km/L PHEV',
    licensePlate: 'ECO-209P',
    driverName: 'Mateo Silva',
    driverRating: 4.88,
    driverPhone: '+1 (555) 443-9087',
    isAvailable: true,
    etaMinutes: 2,
    accentColor: '#00E676',
    features: ['Budget Friendly', 'Commuter Express', 'Clean Interior'],
  },
];

const INITIAL_COMPLETED_RIDE: RideRequest = {
  id: 'ride_seed_101',
  vehicleId: 'veh_01',
  vehicleName: 'Tesla Model S Plaid',
  vehicleCategory: 'ELECTRIC',
  licensePlate: 'EV-904X',
  driverName: 'Marcus Vance',
  driverRating: 4.96,
  driverPhone: '+1 (555) 234-8910',
  riderName: 'Alex Rivera',
  riderPhone: '+1 (555) 019-2834',
  pickupName: 'Silicon Harbor Innovation Hub',
  pickupAddress: '450 Mission Bay Blvd',
  pickupLat: 37.7705,
  pickupLng: -122.3892,
  dropoffName: 'Metropolis Grand Central',
  dropoffAddress: '100 Market St, Financial District',
  dropoffLat: 37.7936,
  dropoffLng: -122.3958,
  distanceKm: 4.8,
  durationMinutes: 12,
  baseFare: 6.5,
  distanceFare: 11.52,
  serviceFee: 1.98,
  totalFare: 20.0,
  status: 'COMPLETED',
  paymentMethod: 'Supabase Pay •••• 4242',
  userRating: 5,
  createdAt: Date.now() - 3600000 * 3,
};

function computeDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(1.8, Number((R * c * 1.32).toFixed(1)));
}

// ==========================================
// 3. SUPABASE REST CLIENT (ZERO EXTERNAL DEPS)
// ==========================================
const SUPABASE_URL = (process.env.EXPO_PUBLIC_SUPABASE_URL || '').trim().replace(/\/$/, '');
const SUPABASE_ANON_KEY = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '').trim();

const isSupabaseConfigured =
  SUPABASE_URL.startsWith('https://') &&
  SUPABASE_URL.includes('.supabase.co') &&
  SUPABASE_ANON_KEY.length > 10 &&
  SUPABASE_ANON_KEY !== 'your-supabase-anon-key';

async function fetchFleetAndRides(): Promise<{
  vehicles: Vehicle[];
  rides: RideRequest[];
  connected: boolean;
}> {
  if (!isSupabaseConfigured) {
    return {
      vehicles: INITIAL_VEHICLES,
      rides: [INITIAL_COMPLETED_RIDE],
      connected: false,
    };
  }

  try {
    const headers = {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    };

    const [vRes, rRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/vehicles?select=*`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/rides?select=*&order=created_at.desc&limit=50`, { headers }),
    ]);

    const vData = vRes.ok ? await vRes.json() : [];
    const rData = rRes.ok ? await rRes.json() : [];

    const vehicles: Vehicle[] =
      Array.isArray(vData) && vData.length > 0
        ? vData.map((row: any) => ({
            id: row.id,
            name: row.name,
            brand: row.brand,
            category: row.category || 'SEDAN',
            pricePerKm: row.price_per_km ?? 2.0,
            baseFare: row.base_fare ?? 5.0,
            seats: row.seats ?? 4,
            luggage: row.luggage ?? 2,
            rating: row.rating ?? 4.9,
            tripsCount: row.trips_count ?? 100,
            transmission: row.transmission ?? 'Automatic',
            rangeOrFuel: row.range_or_fuel ?? '500 km Range',
            licensePlate: row.license_plate ?? 'RF-101',
            driverName: row.driver_name ?? 'Partner Driver',
            driverRating: row.driver_rating ?? 4.95,
            driverPhone: row.driver_phone ?? '+1 555-234-8910',
            isAvailable: row.is_available ?? true,
            etaMinutes: row.eta_minutes ?? 3,
            accentColor: '#00D2FF',
            features: (row.features_csv || 'AC,Fast Charge,GPS').split(','),
          }))
        : INITIAL_VEHICLES;

    const rides: RideRequest[] =
      Array.isArray(rData) && rData.length > 0
        ? rData.map((row: any) => ({
            id: row.id,
            vehicleId: row.vehicle_id,
            vehicleName: row.vehicle_name,
            vehicleCategory: row.vehicle_category,
            licensePlate: row.license_plate,
            driverName: row.driver_name,
            driverRating: row.driver_rating,
            driverPhone: row.driver_phone,
            riderName: row.rider_name,
            riderPhone: row.rider_phone,
            pickupName: row.pickup_name,
            pickupAddress: row.pickup_address,
            pickupLat: row.pickup_lat,
            pickupLng: row.pickup_lng,
            dropoffName: row.dropoff_name,
            dropoffAddress: row.dropoff_address,
            dropoffLat: row.dropoff_lat,
            dropoffLng: row.dropoff_lng,
            distanceKm: row.distance_km,
            durationMinutes: row.duration_minutes,
            baseFare: row.base_fare,
            distanceFare: row.distance_fare,
            serviceFee: row.service_fee,
            totalFare: row.total_fare,
            status: row.status as TripStatus,
            paymentMethod: row.payment_method,
            userRating: row.user_rating,
            createdAt: row.created_at,
          }))
        : [INITIAL_COMPLETED_RIDE];

    return { vehicles, rides, connected: true };
  } catch {
    return {
      vehicles: INITIAL_VEHICLES,
      rides: [INITIAL_COMPLETED_RIDE],
      connected: false,
    };
  }
}

async function upsertRideInSupabase(ride: RideRequest): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/rides`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        id: ride.id,
        vehicle_id: ride.vehicleId,
        vehicle_name: ride.vehicleName,
        vehicle_category: ride.vehicleCategory,
        license_plate: ride.licensePlate,
        driver_name: ride.driverName,
        driver_rating: ride.driverRating,
        driver_phone: ride.driverPhone,
        rider_name: ride.riderName,
        rider_phone: ride.riderPhone,
        pickup_name: ride.pickupName,
        pickup_address: ride.pickupAddress,
        pickup_lat: ride.pickupLat,
        pickup_lng: ride.pickupLng,
        dropoff_name: ride.dropoffName,
        dropoff_address: ride.dropoffAddress,
        dropoff_lat: ride.dropoffLat,
        dropoff_lng: ride.dropoffLng,
        distance_km: ride.distanceKm,
        duration_minutes: ride.durationMinutes,
        base_fare: ride.baseFare,
        distance_fare: ride.distanceFare,
        service_fee: ride.serviceFee,
        total_fare: ride.totalFare,
        status: ride.status,
        payment_method: ride.paymentMethod,
        user_rating: ride.userRating,
        created_at: ride.createdAt,
      }),
    });
  } catch {
    // Graceful local fallback
  }
}

// ==========================================
// 4. MAIN APPLICATION COMPONENT
// ==========================================
export default function App() {
  const [role, setRole] = useState<AppRole>('RIDER');
  const [activeTab, setActiveTab] = useState<number>(0);

  // Fleet & Rides State
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [rides, setRides] = useState<RideRequest[]>([INITIAL_COMPLETED_RIDE]);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory>('ALL');
  const [minSeats, setMinSeats] = useState<number>(0);
  const [sortOption, setSortOption] = useState<SortOption>('RECOMMENDED');

  // Booking Selection State
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [pickup, setPickup] = useState<PresetLocation>(PRESET_LOCATIONS[0]);
  const [dropoff, setDropoff] = useState<PresetLocation>(PRESET_LOCATIONS[2]);
  const [destinationNote, setDestinationNote] = useState<string>('');

  // Driver Shift & Telemetry State
  const [driverOnline, setDriverOnline] = useState<boolean>(true);
  const [todayEarnings, setTodayEarnings] = useState<number>(184.5);
  const [todayTrips, setTodayTrips] = useState<number>(7);
  const [countdownSec, setCountdownSec] = useState<number>(15);
  const [telemetry, setTelemetry] = useState<LiveTelemetry>({
    driverLat: 37.781,
    driverLng: -122.411,
    bearingDegrees: 45,
    speedKmh: 0,
    progressFraction: 0,
    remainingKm: 0,
    remainingMinutes: 0,
    statusMessage: 'Ready for dispatch',
  });

  useEffect(() => {
    fetchFleetAndRides().then((res) => {
      setVehicles(res.vehicles);
      setRides(res.rides);
      setSupabaseConnected(res.connected);
    });
  }, []);

  const activeRide = useMemo(
    () =>
      rides.find((r) =>
        ['REQUESTED', 'ACCEPTED', 'ARRIVED_AT_PICKUP', 'IN_TRANSIT'].includes(r.status)
      ) || null,
    [rides]
  );

  // Live Telemetry & Countdown Effect
  useEffect(() => {
    if (!activeRide) {
      setTelemetry((prev) => ({
        ...prev,
        speedKmh: 0,
        progressFraction: 0,
        statusMessage: driverOnline
          ? 'GPS Radar Active • Scanning for nearby ride requests'
          : 'Driver Offline',
      }));
      return;
    }

    if (activeRide.status === 'REQUESTED') {
      setCountdownSec(15);
      const timer = setInterval(() => {
        setCountdownSec((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }

    if (activeRide.status === 'ACCEPTED' || activeRide.status === 'IN_TRANSIT') {
      let step = 0;
      const totalSteps = 40;
      const interval = setInterval(() => {
        step += 1;
        const fraction = Math.min(1, step / totalSteps);
        const lat =
          activeRide.pickupLat + (activeRide.dropoffLat - activeRide.pickupLat) * fraction;
        const lng =
          activeRide.pickupLng + (activeRide.dropoffLng - activeRide.pickupLng) * fraction;
        setTelemetry({
          driverLat: lat,
          driverLng: lng,
          bearingDegrees: 45,
          speedKmh: fraction < 1 ? 52 : 0,
          progressFraction: fraction,
          remainingKm: Number((activeRide.distanceKm * (1 - fraction)).toFixed(1)),
          remainingMinutes: Math.max(1, Math.round(activeRide.durationMinutes * (1 - fraction))),
          statusMessage:
            activeRide.status === 'ACCEPTED'
              ? `${activeRide.driverName} approaching pickup (${Math.round(fraction * 100)}%)`
              : `In transit to ${activeRide.dropoffName} (${Math.round(fraction * 100)}%)`,
        });

        if (step >= totalSteps) {
          clearInterval(interval);
        }
      }, 350);
      return () => clearInterval(interval);
    }
  }, [activeRide?.id, activeRide?.status, driverOnline]);

  // Filtered Fleet List
  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter((v) => {
        const matchesSearch =
          !searchQuery.trim() ||
          v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.brand.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = selectedCategory === 'ALL' || v.category === selectedCategory;
        const matchesSeats = v.seats >= minSeats;
        return matchesSearch && matchesCat && matchesSeats;
      })
      .sort((a, b) => {
        if (sortOption === 'PRICE_LOW_TO_HIGH') return a.pricePerKm - b.pricePerKm;
        if (sortOption === 'HIGHEST_RATED') return b.rating - a.rating;
        if (sortOption === 'FASTEST_ETA') return a.etaMinutes - b.etaMinutes;
        return b.rating * 10 - a.etaMinutes - (a.rating * 10 - b.etaMinutes);
      });
  }, [vehicles, searchQuery, selectedCategory, minSeats, sortOption]);

  // Actions
  const handleBookRide = (switchToDriver: boolean) => {
    const v = selectedVehicle || vehicles[0];
    const dist = computeDistanceKm(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
    const dur = Math.max(5, Math.round(dist * 2.4));
    const base = v.baseFare;
    const distFare = Number((dist * v.pricePerKm).toFixed(2));
    const fee = Number(((base + distFare) * 0.1).toFixed(2));
    const total = Number((base + distFare + fee).toFixed(2));

    const newRide: RideRequest = {
      id: `ride_${Date.now()}`,
      vehicleId: v.id,
      vehicleName: `${v.brand} ${v.name}`,
      vehicleCategory: v.category,
      licensePlate: v.licensePlate,
      driverName: v.driverName,
      driverRating: v.driverRating,
      driverPhone: v.driverPhone,
      riderName: 'Alex Rivera',
      riderPhone: '+1 (555) 019-2834',
      pickupName: pickup.name,
      pickupAddress: pickup.address,
      pickupLat: pickup.lat,
      pickupLng: pickup.lng,
      dropoffName: destinationNote.trim()
        ? `${dropoff.name} (${destinationNote.trim()})`
        : dropoff.name,
      dropoffAddress: dropoff.address,
      dropoffLat: dropoff.lat,
      dropoffLng: dropoff.lng,
      distanceKm: dist,
      durationMinutes: dur,
      baseFare: base,
      distanceFare: distFare,
      serviceFee: fee,
      totalFare: total,
      status: 'REQUESTED',
      paymentMethod: 'Supabase Pay •••• 4242',
      userRating: 0,
      createdAt: Date.now(),
    };

    setRides((prev) => [newRide, ...prev]);
    upsertRideInSupabase(newRide);
    setSelectedVehicle(null);
    setDestinationNote('');

    if (switchToDriver) {
      setRole('DRIVER');
      setActiveTab(0);
    } else {
      setRole('RIDER');
      setActiveTab(1);
    }
  };

  const updateActiveRideStatus = (nextStatus: TripStatus) => {
    if (!activeRide) return;
    const updated: RideRequest = { ...activeRide, status: nextStatus };
    setRides((prev) => prev.map((r) => (r.id === activeRide.id ? updated : r)));
    upsertRideInSupabase(updated);

    if (nextStatus === 'COMPLETED') {
      setTodayEarnings((prev) => Number((prev + activeRide.totalFare).toFixed(2)));
      setTodayTrips((prev) => prev + 1);
    }
  };

  const simulateIncomingDriverRequest = () => {
    const v = vehicles[0];
    const p = PRESET_LOCATIONS[0];
    const d = PRESET_LOCATIONS[1];
    const dist = computeDistanceKm(p.lat, p.lng, d.lat, d.lng);
    const total = Number((v.baseFare + dist * v.pricePerKm * 1.1).toFixed(2));

    const simRide: RideRequest = {
      id: `ride_${Date.now()}`,
      vehicleId: v.id,
      vehicleName: `${v.brand} ${v.name}`,
      vehicleCategory: v.category,
      licensePlate: v.licensePlate,
      driverName: v.driverName,
      driverRating: v.driverRating,
      driverPhone: v.driverPhone,
      riderName: 'Sophia Martinez',
      riderPhone: '+1 (555) 839-4410',
      pickupName: p.name,
      pickupAddress: p.address,
      pickupLat: p.lat,
      pickupLng: p.lng,
      dropoffName: d.name,
      dropoffAddress: d.address,
      dropoffLat: d.lat,
      dropoffLng: d.lng,
      distanceKm: dist,
      durationMinutes: Math.round(dist * 2.3),
      baseFare: v.baseFare,
      distanceFare: Number((dist * v.pricePerKm).toFixed(2)),
      serviceFee: 2.5,
      totalFare: total,
      status: 'REQUESTED',
      paymentMethod: 'Supabase Instant Pay',
      userRating: 0,
      createdAt: Date.now(),
    };

    setRides((prev) => [simRide, ...prev]);
    upsertRideInSupabase(simRide);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.slateSurface} />

      {/* Top Header with Seamless Role Toggle */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTitle}>RideFlow</Text>
          <Text style={styles.brandSub}>
            {role === 'RIDER' ? 'Fleet & Destination Booking' : 'Uber-Style Driver Dispatch'}
          </Text>
        </View>

        <View style={styles.roleToggleContainer}>
          <TouchableOpacity
            style={[styles.rolePill, role === 'RIDER' && styles.rolePillActiveRider]}
            onPress={() => {
              setRole('RIDER');
              setActiveTab(0);
            }}
          >
            <Text style={[styles.roleText, role === 'RIDER' && styles.roleTextActive]}>Rider</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.rolePill, role === 'DRIVER' && styles.rolePillActiveDriver]}
            onPress={() => {
              setRole('DRIVER');
              setActiveTab(0);
            }}
          >
            <Text style={[styles.roleText, role === 'DRIVER' && styles.roleTextActive]}>
              Driver {activeRide?.status === 'REQUESTED' ? '●' : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* RIDER MODE: TAB 0 (FLEET & BOOKING) */}
        {role === 'RIDER' && activeTab === 0 && (
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>
                  {vehicles.length} VEHICLES NEARBY •{' '}
                  {supabaseConnected ? 'SUPABASE CONNECTED' : 'LOCAL FALLBACK READY'}
                </Text>
              </View>
              <Text style={styles.heroTitle}>Book Your Ride or Rent a Fleet</Text>
              <Text style={styles.heroSubtitle}>
                Filter vehicles by category or seats, set your destination, and track your driver
                in real time.
              </Text>
            </View>

            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search Tesla, SUV, Luxury, 7 seats..."
              placeholderTextColor={COLORS.gray}
              style={styles.searchInput}
            />

            {/* Category Filter Chips */}
            <View style={styles.chipRow}>
              {(['ALL', 'SEDAN', 'SUV', 'ELECTRIC', 'LUXURY', 'ECONOMY'] as VehicleCategory[]).map(
                (cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, selectedCategory === cat && styles.chipSelected]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedCategory === cat && styles.chipTextSelected,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            {/* Seat & Sort Chips */}
            <View style={styles.chipRow}>
              {[
                { label: 'Any Seats', val: 0 },
                { label: '4+ Seats', val: 4 },
                { label: '7 XL Seats', val: 7 },
              ].map((s) => (
                <TouchableOpacity
                  key={s.label}
                  style={[styles.chip, minSeats === s.val && styles.chipSelected]}
                  onPress={() => setMinSeats(s.val)}
                >
                  <Text style={[styles.chipText, minSeats === s.val && styles.chipTextSelected]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.chip}
                onPress={() =>
                  setSortOption((prev) =>
                    prev === 'RECOMMENDED' ? 'PRICE_LOW_TO_HIGH' : 'RECOMMENDED'
                  )
                }
              >
                <Text style={styles.chipText}>
                  Sort: {sortOption === 'PRICE_LOW_TO_HIGH' ? 'Lowest Price' : 'Recommended'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Booking Configurator Modal Card when a Vehicle is Selected */}
            {selectedVehicle && (
              <View
                style={[
                  styles.vehicleCard,
                  { borderColor: COLORS.cyan, borderWidth: 2, backgroundColor: '#132032' },
                ]}
              >
                <Text style={{ color: COLORS.cyan, fontWeight: '800', fontSize: 12 }}>
                  CONFIGURE DESTINATION & FARE
                </Text>
                <Text style={styles.vehicleTitle}>
                  {selectedVehicle.brand} {selectedVehicle.name}
                </Text>

                <Text style={styles.metaText}>Select Pickup Hub:</Text>
                <View style={styles.chipRow}>
                  {PRESET_LOCATIONS.map((loc) => (
                    <TouchableOpacity
                      key={`p_${loc.id}`}
                      style={[styles.chip, pickup.id === loc.id && styles.chipSelected]}
                      onPress={() => setPickup(loc)}
                    >
                      <Text
                        style={[styles.chipText, pickup.id === loc.id && styles.chipTextSelected]}
                      >
                        {loc.zone}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.metaText}>Select Destination Hub:</Text>
                <View style={styles.chipRow}>
                  {PRESET_LOCATIONS.map((loc) => (
                    <TouchableOpacity
                      key={`d_${loc.id}`}
                      style={[
                        styles.chip,
                        dropoff.id === loc.id && {
                          backgroundColor: COLORS.amber,
                          borderColor: COLORS.amber,
                        },
                      ]}
                      onPress={() => setDropoff(loc)}
                    >
                      <Text
                        style={[styles.chipText, dropoff.id === loc.id && styles.chipTextSelected]}
                      >
                        {loc.zone}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  value={destinationNote}
                  onChangeText={setDestinationNote}
                  placeholder="Optional building or gate note..."
                  placeholderTextColor={COLORS.gray}
                  style={styles.searchInput}
                />

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                  <TouchableOpacity
                    style={[styles.primaryButton, { flex: 1 }]}
                    onPress={() => handleBookRide(false)}
                  >
                    <Text style={styles.primaryButtonText}>Request Ride Now</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.amberButton, { flex: 1 }]}
                    onPress={() => handleBookRide(true)}
                  >
                    <Text style={styles.primaryButtonText}>Request & Accept as Driver</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Vehicle Fleet List */}
            {filteredVehicles.map((v) => (
              <View key={v.id} style={styles.vehicleCard}>
                <View style={styles.rowBetween}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{v.category}</Text>
                  </View>
                  <Text style={{ color: COLORS.emerald, fontSize: 12, fontWeight: '700' }}>
                    ETA {v.etaMinutes} min
                  </Text>
                </View>

                <Text style={styles.vehicleTitle}>
                  {v.brand} {v.name}
                </Text>
                <Text style={styles.metaText}>
                  ★ {v.rating} ({v.tripsCount} trips) • Driver: {v.driverName} • Plate{' '}
                  {v.licensePlate}
                </Text>

                <View style={styles.specsBar}>
                  <Text style={styles.specText}>{v.seats} Seats</Text>
                  <Text style={styles.specText}>{v.luggage} Bags</Text>
                  <Text style={styles.specText}>{v.transmission}</Text>
                  <Text style={styles.specText}>{v.rangeOrFuel}</Text>
                </View>

                <View style={styles.rowBetween}>
                  <View>
                    <Text style={styles.priceLarge}>${v.pricePerKm.toFixed(2)} / km</Text>
                    <Text style={styles.metaText}>+ ${v.baseFare.toFixed(2)} base fare</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => setSelectedVehicle(v)}
                  >
                    <Text style={styles.primaryButtonText}>Select & Book</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* LIVE TRIP TRACKING OR DRIVER PARTNER CONSOLE */}
        {((role === 'RIDER' && activeTab === 1) || (role === 'DRIVER' && activeTab === 0)) && (
          <>
            <View style={styles.mapContainer}>
              <View style={styles.rowBetween}>
                <View
                  style={{
                    backgroundColor: 'rgba(11, 15, 23, 0.88)',
                    padding: 10,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ color: COLORS.cyan, fontSize: 12, fontWeight: '700' }}>
                    {telemetry.speedKmh} km/h • GPS {telemetry.driverLat.toFixed(4)},{' '}
                    {telemetry.driverLng.toFixed(4)}
                  </Text>
                  <Text style={{ color: COLORS.white, fontSize: 13, marginTop: 2 }}>
                    {telemetry.statusMessage}
                  </Text>
                </View>
              </View>

              <View style={{ marginVertical: 20 }}>
                <View
                  style={{
                    height: 8,
                    backgroundColor: COLORS.slateCard,
                    borderRadius: 999,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      width: `${Math.max(8, Math.round(telemetry.progressFraction * 100))}%`,
                      height: '100%',
                      backgroundColor: COLORS.cyan,
                    }}
                  />
                </View>
                <View style={[styles.rowBetween, { marginTop: 8 }]}>
                  <Text style={{ color: COLORS.emerald, fontSize: 12, fontWeight: '700' }}>
                    ● Pickup: {activeRide ? activeRide.pickupName : 'Standby'}
                  </Text>
                  <Text style={{ color: COLORS.amber, fontSize: 12, fontWeight: '700' }}>
                    ◉ Dropoff: {activeRide ? activeRide.dropoffName : 'Awaiting Request'}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  backgroundColor: COLORS.slateCard,
                  padding: 10,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: COLORS.white, fontSize: 12, fontWeight: '700' }}>
                  {activeRide
                    ? `Active Status: ${activeRide.status} • Est. Fare $${activeRide.totalFare.toFixed(2)}`
                    : `Driver Shift Earnings: $${todayEarnings.toFixed(2)} (${todayTrips} Completed Trips)`}
                </Text>
              </View>
            </View>

            {role === 'DRIVER' && (
              <View style={styles.vehicleCard}>
                <View style={styles.rowBetween}>
                  <View>
                    <Text
                      style={{
                        color: driverOnline ? COLORS.emerald : COLORS.coral,
                        fontWeight: '800',
                        fontSize: 14,
                      }}
                    >
                      {driverOnline ? '● ONLINE - RECEIVING REQUESTS' : '○ OFFLINE'}
                    </Text>
                    <Text style={styles.metaText}>
                      Today Earnings: ${todayEarnings.toFixed(2)} • {todayTrips} Rides
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.outlineButton}
                    onPress={() => setDriverOnline(!driverOnline)}
                  >
                    <Text style={{ color: COLORS.white, fontWeight: '700' }}>
                      {driverOnline ? 'Go Offline' : 'Go Online'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {!activeRide && (
                  <TouchableOpacity
                    style={styles.amberButton}
                    onPress={simulateIncomingDriverRequest}
                  >
                    <Text style={styles.primaryButtonText}>
                      Simulate Incoming Ride Request Now
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {activeRide && (
              <View
                style={[
                  styles.vehicleCard,
                  { borderColor: COLORS.amber, borderWidth: 1.5 },
                ]}
              >
                <View style={styles.rowBetween}>
                  <Text style={styles.vehicleTitle}>{activeRide.vehicleName}</Text>
                  <Text style={{ color: COLORS.emerald, fontSize: 20, fontWeight: '800' }}>
                    ${activeRide.totalFare.toFixed(2)}
                  </Text>
                </View>

                <Text style={styles.metaText}>
                  Passenger: {activeRide.riderName} • Driver: {activeRide.driverName} (
                  {activeRide.licensePlate})
                </Text>
                <Text style={{ color: COLORS.white, fontSize: 13 }}>
                  {activeRide.pickupName} → {activeRide.dropoffName} ({activeRide.distanceKm} km)
                </Text>

                {activeRide.status === 'REQUESTED' ? (
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                    <TouchableOpacity
                      style={[styles.emeraldButton, { flex: 1 }]}
                      onPress={() => updateActiveRideStatus('ACCEPTED')}
                    >
                      <Text style={styles.primaryButtonText}>
                        Accept Dispatch ({countdownSec}s)
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.outlineButton}
                      onPress={() => updateActiveRideStatus('CANCELLED')}
                    >
                      <Text style={{ color: COLORS.coral, fontWeight: '700' }}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                    <TouchableOpacity
                      style={[styles.primaryButton, { flex: 1 }]}
                      onPress={() => {
                        const next: TripStatus =
                          activeRide.status === 'ACCEPTED'
                            ? 'ARRIVED_AT_PICKUP'
                            : activeRide.status === 'ARRIVED_AT_PICKUP'
                            ? 'IN_TRANSIT'
                            : 'COMPLETED';
                        updateActiveRideStatus(next);
                      }}
                    >
                      <Text style={styles.primaryButtonText}>
                        {activeRide.status === 'ACCEPTED'
                          ? 'Confirm Arrived at Pickup'
                          : activeRide.status === 'ARRIVED_AT_PICKUP'
                          ? 'Start Passenger Trip'
                          : 'Complete Ride & Collect Fare'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </>
        )}

        {/* TRIPS & SUPABASE DATABASE TAB */}
        {((role === 'RIDER' && activeTab === 2) || (role === 'DRIVER' && activeTab === 1)) && (
          <>
            <View style={styles.vehicleCard}>
              <Text style={styles.vehicleTitle}>Supabase Backend Status</Text>
              <Text style={styles.metaText}>
                {isSupabaseConfigured
                  ? 'Connected to Supabase REST API'
                  : 'Running with Local Fallback State. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env'}
              </Text>
            </View>

            {rides.map((r) => (
              <View key={r.id} style={styles.vehicleCard}>
                <View style={styles.rowBetween}>
                  <Text style={styles.vehicleTitle}>{r.vehicleName}</Text>
                  <Text style={{ color: COLORS.emerald, fontWeight: '800', fontSize: 16 }}>
                    ${r.totalFare.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.metaText}>
                  {r.pickupName} → {r.dropoffName} ({r.distanceKm} km)
                </Text>
                <Text style={{ color: COLORS.cyan, fontSize: 12, fontWeight: '700' }}>
                  Status: {r.status} • {r.paymentMethod}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        {role === 'RIDER' ? (
          <>
            <TouchableOpacity
              style={[styles.navItem, activeTab === 0 && styles.navItemActive]}
              onPress={() => setActiveTab(0)}
            >
              <Text style={[styles.navText, activeTab === 0 && styles.navTextActive]}>
                Vehicles
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navItem, activeTab === 1 && styles.navItemActive]}
              onPress={() => setActiveTab(1)}
            >
              <Text style={[styles.navText, activeTab === 1 && styles.navTextActive]}>
                Live Trip {activeRide ? '●' : ''}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navItem, activeTab === 2 && styles.navItemActive]}
              onPress={() => setActiveTab(2)}
            >
              <Text style={[styles.navText, activeTab === 2 && styles.navTextActive]}>
                Trips & Supabase
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.navItem, activeTab === 0 && styles.navItemActive]}
              onPress={() => setActiveTab(0)}
            >
              <Text style={[styles.navText, activeTab === 0 && styles.navTextActive]}>
                Driver Dispatch
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navItem, activeTab === 1 && styles.navItemActive]}
              onPress={() => setActiveTab(1)}
            >
              <Text style={[styles.navText, activeTab === 1 && styles.navTextActive]}>
                Earnings & DB
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

// ==========================================
// 5. STYLES
// ==========================================
const COLORS = {
  obsidian: '#0B0F17',
  slateSurface: '#151C28',
  slateCard: '#1E293B',
  slateElevated: '#283548',
  border: '#334155',
  cyan: '#00D2FF',
  amber: '#FFB300',
  emerald: '#00E676',
  coral: '#FF5252',
  white: '#F1F5F9',
  gray: '#94A3B8',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.obsidian,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.slateSurface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  brandTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
  },
  brandSub: {
    color: COLORS.cyan,
    fontSize: 12,
    fontWeight: '600',
  },
  roleToggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.slateCard,
    borderRadius: 999,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rolePill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  rolePillActiveRider: {
    backgroundColor: COLORS.cyan,
  },
  rolePillActiveDriver: {
    backgroundColor: COLORS.amber,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray,
  },
  roleTextActive: {
    color: COLORS.obsidian,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 14,
  },
  heroCard: {
    backgroundColor: '#0E2238',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.cyan,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 210, 255, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 10,
  },
  heroBadgeText: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: '700',
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroSubtitle: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 19,
  },
  searchInput: {
    backgroundColor: COLORS.slateSurface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.white,
    fontSize: 14,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.slateSurface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.cyan,
    borderColor: COLORS.cyan,
  },
  chipText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: COLORS.obsidian,
    fontWeight: '800',
  },
  vehicleCard: {
    backgroundColor: COLORS.slateSurface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: 'rgba(0, 210, 255, 0.16)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: '700',
  },
  vehicleTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
  },
  metaText: {
    color: COLORS.gray,
    fontSize: 13,
  },
  specsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.slateCard,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  specText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  priceLarge: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
  },
  primaryButton: {
    backgroundColor: COLORS.cyan,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: COLORS.obsidian,
    fontSize: 15,
    fontWeight: '800',
  },
  amberButton: {
    backgroundColor: COLORS.amber,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emeraldButton: {
    backgroundColor: COLORS.emerald,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: {
    height: 250,
    backgroundColor: '#08121E',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.slateSurface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: 'rgba(0, 210, 255, 0.16)',
  },
  navText: {
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '700',
  },
  navTextActive: {
    color: COLORS.cyan,
  },
});
