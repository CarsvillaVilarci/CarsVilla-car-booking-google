import React, { createContext, useContext, useState } from 'react';
import { INITIAL_PARTNER_REQUESTS, type PartnerIncomingRequest } from '../data/partnerDemoData';

interface PartnerRequestsState {
  requests: PartnerIncomingRequest[];
  acceptRequest: (id: string) => void;
  declineRequest: (id: string) => void;
  getRequest: (id: string) => PartnerIncomingRequest | undefined;
}

const PartnerRequestsContext = createContext<PartnerRequestsState | undefined>(undefined);

export function PartnerRequestsProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<PartnerIncomingRequest[]>(INITIAL_PARTNER_REQUESTS);

  function acceptRequest(id: string) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'accepted' } : r)));
  }

  function declineRequest(id: string) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'declined' } : r)));
  }

  function getRequest(id: string) {
    return requests.find((r) => r.id === id);
  }

  return (
    <PartnerRequestsContext.Provider value={{ requests, acceptRequest, declineRequest, getRequest }}>
      {children}
    </PartnerRequestsContext.Provider>
  );
}

export function usePartnerRequests() {
  const ctx = useContext(PartnerRequestsContext);
  if (!ctx) throw new Error('usePartnerRequests must be used within PartnerRequestsProvider');
  return ctx;
}
