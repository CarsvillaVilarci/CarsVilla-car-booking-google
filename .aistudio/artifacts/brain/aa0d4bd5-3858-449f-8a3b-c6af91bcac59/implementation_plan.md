# RideFlow - Vehicle Booking & Real-Time Driver Partner Network

An Android mobility platform built with Jetpack Compose that combines customer vehicle booking with real-time driver dispatching, interactive live location tracking, and flexible Supabase REST backend integration.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were aligned based on your preferences:

- **Confirmed Decision 1: Hybrid Backend (Supabase REST + Room Fallback)**: Real-time and persistent syncing via Supabase REST API (with configurable Project URL and API Key in app settings), coupled with an on-device Room database that guarantees full functionality out-of-the-box even without an active internet connection or before credentials are entered.
- **Confirmed Decision 2: Seamless Dual-Role Mode Toggle**: A prominent top-bar toggle lets users effortlessly switch between **Rider Mode** (booking rides & filtering vehicles) and **Driver Partner Mode** (receiving live trip requests, accepting dispatches, and managing trips).
- **Confirmed Decision 3: Interactive Live Map & Animated Dispatch**: High-fidelity custom Jetpack Compose Canvas vector map showing route paths, live pickup/drop-off pins, animated car movement along route vectors, and realistic dispatch state transitions (Searching -> Driver Assigned -> En Route to Pickup -> In Transit -> Completed).

---

## 1. Overview & Core Concept

**RideFlow** serves two interconnected user personas within a unified, intuitive Android application:

1. **Riders / Customers**:
   - Browse an extensive fleet of vehicles (Sedans, SUVs, Electric, Luxury, Economy).
   - Filter vehicles by category, price per kilometer/hour, seating capacity, rating, and transmission.
   - Enter pickup and destination addresses, view real-time fare estimates, and request an immediate ride.
   - Watch the driver accept, navigate to pickup, and complete the journey on an animated interactive map.

2. **Drivers / Partners**:
   - Go Online/Offline with a single tap.
   - Receive incoming trip request popups with a countdown timer, estimated fare, passenger info, and route distance.
   - Accept or decline dispatches in real time.
   - Control trip progression: *Navigate to Pickup* &rarr; *Arrived at Pickup* &rarr; *Start Trip* &rarr; *Complete Ride*, with live driver location and heading simulated smoothly on the route.

3. **Supabase Integration & Config**:
   - Dedicated Settings sheet where users can paste their Supabase URL and Anon Key.
   - Tables mapped: `vehicles`, `rides`, and `driver_profiles` with automated synchronization and local offline caching.

---

## 2. User Experience & Visual Design

### Key User Flows

```
[Rider Flow]
Vehicle List & Filters ──> Choose Vehicle & Set Route ──> Fare Preview ──> Request Ride ──> Live Map Tracking ──> Trip Receipt & Rating

[Driver Flow]
Toggle Driver Mode ──> Go Online ──> Receive Live Dispatch Request ──> Accept ──> Navigate to Pickup ──> In Transit ──> Trip Completed
```

1. **Rider Experience**:
   - **Hero Fleet Browser**: Filter chips for vehicle types (All, Sedan, SUV, EV, Luxury), sort by price/rating, seat count slider, and vehicle detail cards with specs (range, luggage, passengers).
   - **Booking Bottom Sheet**: Pickup & Dropoff location selector with popular destinations (Airport, Tech Hub, Downtown, Mall), estimated distance, time, and calculated price.
   - **Live Trip Screen**: Dynamic vector map with route polyline, vehicle sprite rotating along trajectory, ETA pill, driver contact card (driver photo, vehicle model, license plate, phone button), and cancel/help actions.

2. **Driver Experience**:
   - **Partner Dashboard**: Shift earnings tracker, completed rides counter, rating breakdown, and an online status switch.
   - **Dispatch Radar Alert**: Sound/vibration effect, 15-second radial timer indicator, passenger pickup marker, estimated payout, and prominent Accept / Decline buttons.
   - **Driver Navigation Console**: Turn-by-turn guidance bar, progress slider, speed indicator, and trip stage action buttons (*"Arrive at Pickup"*, *"Start Trip"*, *"End Trip"*).

3. **Supabase & Settings Flow**:
   - Connection status badge (Connected to Supabase / Local Offline Mode).
   - Dialog to update credentials and sync remote data.

### Visual Identity & Theme

- **Aesthetic Direction**: Urban Tech & High-Precision Mobility. Dark-mode first with high-contrast neon accents, reminiscent of premier transit applications.
- **Color Palette**:
  - `Background`: Deep Charcoal / Obsidian (`#0F141C`)
  - `Surface`: Elevated Dark Slate (`#1A222E`) & Card Surface (`#222D3D`)
  - `Primary Accent`: Electric Cyan (`#00D2FF`) for primary calls to action, route polylines, and active vehicle pins
  - `Secondary Accent`: Neon Amber (`#FFB300`) for driver dispatch alerts, ratings, and vehicle badges
  - `Success`: Emerald Green (`#00E676`) for "Online" status, trip completion, and accepted bookings
  - `Text`: Crisp Glacier White (`#F0F6FC`) and Subdued Steel Gray (`#90A4AE`)
- **Typography**: Clean modern sans-serif typography with strict hierarchy: bold monospace metrics for distance/fares, medium headers for vehicle models, and legible body copy.
- **Motion & Micro-interactions**:
  - Pulse radar animation during ride matching.
  - Smooth 60fps interpolation of driver coordinates along waypoint polylines.
  - Bottom sheet expandable states for quick inspection while keeping the map visible.

---

## 3. Key Product Decisions & Trade-Offs

| Decision | Chosen Approach | Rationale | Alternatives Considered |
| :--- | :--- | :--- | :--- |
| **App Architecture** | Single App with Role Toggle | Provides an immediate, end-to-end testable loop where the user can request a ride as a rider and accept it as a driver on the same device without multiple app installs. | Split apps (Rider APK & Driver APK) - would prevent easy emulator demonstration. |
| **Backend & DB** | Supabase REST with Room Offline Cache | Fully satisfies your Supabase tech stack requirement while ensuring the app works instantly without requiring immediate API key entry. | Supabase-only (app would fail on first launch without valid credentials). |
| **Map Rendering** | Custom Compose Vector Map Engine | Canvas-based vector map with street grids, landmarks, route polylines, and animated vehicle pins. Runs reliably without requiring external Google Maps API billing or keys. | Google Maps SDK (requires Google Cloud billing, restricted keys, and often fails in emulators). |
| **Real-time Dispatch** | Event-Driven State Engine with Coroutine Simulation | Coordinates between rider dispatch and driver acceptance, simulating live driving telemetry and GPS breadcrumbs smoothly along the road. | Static fake screenshots (inferior user experience). |

---

## 4. Technical Architecture & Data Strategy

### System Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Jetpack Compose UI Layer                        │
├───────────────────────────────────┬────────────────────────────────────┤
│            Rider Mode             │            Driver Mode             │
│  - Vehicle List & Filter Bar      │  - Shift Stats & Online Toggle     │
│  - Destination & Fare Calculator  │  - Dispatch Alert Dialog (15s)     │
│  - Interactive Live Tracking Map  │  - Driver Turn-by-Turn Navigator   │
└─────────────────┬─────────────────┴──────────────────┬─────────────────┘
                  │                                    │
                  ▼                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   ViewModels & State Flow Controllers                  │
│       [RideFlowViewModel / DriverViewModel / SupabaseViewModel]        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                            Repository Layer                            │
│                     [RideFlowDataRepository]                           │
├───────────────────────────────────┬────────────────────────────────────┤
│         Local Persistence         │        Remote Supabase REST        │
│          (Room Database)          │          (Ktor/OkHttp Client)      │
│  - VehicleEntity & Dao            │  - GET /rest/v1/vehicles           │
│  - RideRequestEntity & Dao        │  - POST/PATCH /rest/v1/rides       │
│  - DriverProfileEntity & Dao      │  - Supabase Headers & Anon Key     │
└───────────────────────────────────┴────────────────────────────────────┘
```

### Core Data Models

- **Vehicle**: `id`, `name`, `brand`, `category` (Sedan, SUV, EV, Luxury, Economy), `pricePerKm`, `baseFare`, `seatingCapacity`, `rating`, `transmission`, `imageUrl`, `available`.
- **RideRequest**: `id`, `riderName`, `riderPhone`, `pickupAddress`, `dropoffAddress`, `pickupLocation`, `dropoffLocation`, `vehicleId`, `estimatedFare`, `distanceKm`, `status` (`REQUESTED`, `ACCEPTED`, `DRIVER_ARRIVED`, `IN_TRANSIT`, `COMPLETED`, `CANCELLED`), `driverId`, `createdAt`.
- **DriverProfile**: `id`, `name`, `vehicleModel`, `vehiclePlate`, `rating`, `totalTrips`, `todayEarnings`, `isOnline`, `currentLocation`.
- **GeoLocation**: `latitude`, `longitude`, `bearing`.

---

## Plan Verification

- **Vehicle Catalog & Filtering**: Verify filtering by category, seats, price, and instant search.
- **Booking Flow**: Verify address selection, fare calculation, and ride submission.
- **Driver Dispatch**: Verify incoming request alert, 15-second countdown timer, accept/reject actions.
- **Live Animated Tracking**: Verify vehicle pin movement along waypoints on the interactive map canvas.
- **Supabase Integration**: Verify configuration sheet, test connection button, and local Room fallback.
