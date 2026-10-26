import type { DemoVehicle } from './demoVehicles';

export interface ChatMessage {
  id: string;
  sender: 'owner' | 'me';
  text: string;
  time: string;
}

// Seed conversation so the chat doesn't open empty. Local to the
// screen/session only — no backend/persistence yet (see PIPELINE.md).
export function getInitialMessages(vehicle: DemoVehicle): ChatMessage[] {
  return [
    {
      id: 'seed-1',
      sender: 'owner',
      text: `Hi! Thanks for checking out my ${vehicle.title}. Happy to answer any questions — when are you looking to travel?`,
      time: '10:02 AM',
    },
  ];
}
