export type ListingStackParamList = {
  VehicleList: undefined;
  VehicleDetail: { vehicleId: string };
  Chat: { vehicleId: string };
};

export type LiveBookingStackParamList = {
  LiveBooking: undefined;
};

export type CarHelpStackParamList = {
  CarHelp: undefined;
  HelpRequestForm: { categoryKey: string };
  HelpTracking: { requestId: string };
  HelpHistory: undefined;
};

export type ProfileStackParamList = {
  AuthGate: undefined;
  Phone: undefined;
  Otp: { phone: string };
  Name: undefined;
  Profile: undefined;
};

export type TabParamList = {
  Listing: undefined;
  LiveBooking: undefined;
  CarHelp: undefined;
  Profile: undefined;
};

export type PartnerDashboardStackParamList = {
  PartnerDashboard: undefined;
};

export type PartnerVehiclesStackParamList = {
  PartnerVehicles: undefined;
  AddVehicle: undefined;
};

export type PartnerRequestsStackParamList = {
  PartnerRequests: undefined;
  RequestDetail: { requestId: string };
};

export type PartnerProfileStackParamList = {
  PartnerProfile: undefined;
};

export type PartnerTabParamList = {
  Dashboard: undefined;
  Vehicles: undefined;
  Requests: undefined;
  Profile: undefined;
};
