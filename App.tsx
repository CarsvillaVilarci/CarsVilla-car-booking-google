import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  computeDistanceKm,
  INITIAL_COMPLETED_RIDE,
  INITIAL_VEHICLES,
  PRESET_LOCATIONS,
} from './src/data';
import { COLORS, styles } from './src/styles';
import {
  fetchFleetAndRides,
  isSupabaseConfigured,
  upsertRideInSupabase,
} from './src/supabaseClient';
import {
  AppRole,
  LiveTelemetry,
  PresetLocation,
  RideRequest,
  SortOption,
  TripStatus,
  Vehicle,
  VehicleCategory,
} from './src/types';

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
            {/* Interactive Live Telemetry Map View */}
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

              {/* Animated Visual Route Progress Track */}
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

            {/* Driver Mode Online Toggle & Incoming Ride Dispatch Card */}
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

            {/* Active Ride Control Card */}
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
                  ? 'Connected to Supabase (@supabase/supabase-js)'
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
