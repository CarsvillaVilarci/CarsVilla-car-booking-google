import React, { createContext, useContext, useState } from 'react';
import { INITIAL_PARTNER_VEHICLES, type PartnerVehicleListing } from '../data/partnerDemoData';

interface PartnerVehiclesState {
  vehicles: PartnerVehicleListing[];
  addVehicle: (vehicle: Omit<PartnerVehicleListing, 'id' | 'isActive' | 'image'>) => void;
  toggleActive: (id: string) => void;
  removeVehicle: (id: string) => void;
}

const PartnerVehiclesContext = createContext<PartnerVehiclesState | undefined>(undefined);

let localIdCounter = 0;

export function PartnerVehiclesProvider({ children }: { children: React.ReactNode }) {
  const [vehicles, setVehicles] = useState<PartnerVehicleListing[]>(INITIAL_PARTNER_VEHICLES);

  function addVehicle(vehicle: Omit<PartnerVehicleListing, 'id' | 'isActive' | 'image'>) {
    localIdCounter += 1;
    setVehicles((prev) => [{ ...vehicle, id: `pv-new-${localIdCounter}`, isActive: true, image: null }, ...prev]);
  }

  function toggleActive(id: string) {
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, isActive: !v.isActive } : v)));
  }

  function removeVehicle(id: string) {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  }

  return (
    <PartnerVehiclesContext.Provider value={{ vehicles, addVehicle, toggleActive, removeVehicle }}>
      {children}
    </PartnerVehiclesContext.Provider>
  );
}

export function usePartnerVehicles() {
  const ctx = useContext(PartnerVehiclesContext);
  if (!ctx) throw new Error('usePartnerVehicles must be used within PartnerVehiclesProvider');
  return ctx;
}
