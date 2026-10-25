import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { INITIAL_COMPLETED_RIDE, INITIAL_VEHICLES } from './data';
import { RideRequest, TripStatus, Vehicle } from './types';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured =
  SUPABASE_URL.startsWith('https://') &&
  SUPABASE_URL.includes('.supabase.co') &&
  SUPABASE_ANON_KEY.length > 10 &&
  SUPABASE_ANON_KEY !== 'your-supabase-anon-key';

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export async function fetchFleetAndRides(): Promise<{
  vehicles: Vehicle[];
  rides: RideRequest[];
  connected: boolean;
}> {
  if (!supabase) {
    return {
      vehicles: INITIAL_VEHICLES,
      rides: [INITIAL_COMPLETED_RIDE],
      connected: false,
    };
  }

  try {
    const [{ data: vData }, { data: rData }] = await Promise.all([
      supabase.from('vehicles').select('*'),
      supabase.from('rides').select('*').order('created_at', { ascending: false }).limit(50),
    ]);

    const vehicles: Vehicle[] =
      vData && vData.length > 0
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
      rData && rData.length > 0
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

export async function upsertRideInSupabase(ride: RideRequest): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('rides').upsert({
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
    });
  } catch {
    // Graceful local fallback
  }
}
