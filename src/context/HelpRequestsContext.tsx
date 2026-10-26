import React, { createContext, useContext, useState } from 'react';
import { generateDemoPartner, type DemoHelpPartner } from '../data/helpCategories';

export type HelpRequestStatus = 'searching' | 'assigned' | 'completed' | 'cancelled';

export interface HelpRequest {
  id: string;
  categoryKey: string;
  description: string;
  priority: boolean;
  status: HelpRequestStatus;
  createdAt: number;
  partner?: DemoHelpPartner;
}

interface HelpRequestsState {
  requests: HelpRequest[];
  activeRequest: HelpRequest | undefined;
  createRequest: (categoryKey: string, description: string, priority?: boolean) => string;
  assignPartner: (id: string) => void;
  completeRequest: (id: string) => void;
  cancelRequest: (id: string) => void;
  getRequest: (id: string) => HelpRequest | undefined;
}

const HelpRequestsContext = createContext<HelpRequestsState | undefined>(undefined);

let localIdCounter = 0;

export function HelpRequestsProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<HelpRequest[]>([]);

  function createRequest(categoryKey: string, description: string, priority = false) {
    localIdCounter += 1;
    const id = `help-${localIdCounter}`;
    const newRequest: HelpRequest = {
      id,
      categoryKey,
      description,
      priority,
      status: 'searching',
      createdAt: Date.now(),
    };
    setRequests((prev) => [newRequest, ...prev]);
    return id;
  }

  function assignPartner(id: string) {
    setRequests((prev) =>
      prev.map((r) => (r.id === id && r.status === 'searching' ? { ...r, status: 'assigned', partner: generateDemoPartner(r.categoryKey) } : r)),
    );
  }

  function completeRequest(id: string) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'completed' } : r)));
  }

  function cancelRequest(id: string) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r)));
  }

  function getRequest(id: string) {
    return requests.find((r) => r.id === id);
  }

  const activeRequest = requests.find((r) => r.status === 'searching' || r.status === 'assigned');

  return (
    <HelpRequestsContext.Provider
      value={{ requests, activeRequest, createRequest, assignPartner, completeRequest, cancelRequest, getRequest }}
    >
      {children}
    </HelpRequestsContext.Provider>
  );
}

export function useHelpRequests() {
  const ctx = useContext(HelpRequestsContext);
  if (!ctx) throw new Error('useHelpRequests must be used within HelpRequestsProvider');
  return ctx;
}
