export type RentalApplicationStatus =
  | 'submitted'
  | 'screening'
  | 'approved'
  | 'rejected'
  | 'withdrawn'
  | 'lease_created';

export type RentalApplicationScreeningStatus =
  | 'not_started'
  | 'pending'
  | 'passed'
  | 'failed'
  | 'manual_review';

export type RentalApplicationAppointmentStatus =
  | 'requested'
  | 'scheduled'
  | 'rescheduled'
  | 'cancelled'
  | 'completed';

export interface RentalApplicationUser {
  id: string;
  name?: string;
  email?: string;
}

export interface RentalApplicationListing {
  id: string;
  title?: string;
  listingType?: string;
  monthlyRent?: number;
  currency?: string;
  status?: string;
}

export interface RentalApplicationScreening {
  status?: RentalApplicationScreeningStatus;
  provider?: string;
  reference?: string;
  score?: number;
  completedAt?: string;
  notes?: string;
}

export interface RentalApplicationAppointment {
  status?: RentalApplicationAppointmentStatus;
  requestedAt?: string;
  scheduledFor?: string;
  locationNote?: string;
  note?: string;
}

export interface RentalApplicationLeaseRef {
  id: string;
}

export interface RentalApplication {
  id: string;
  listingId: string;
  listing?: RentalApplicationListing | string;
  tenantId?: string;
  tenant?: RentalApplicationUser | string;
  landlordId?: string;
  landlord?: RentalApplicationUser | string;
  desiredStartDate: string;
  desiredEndDate: string;
  occupants: number;
  monthlyIncome: number;
  employer?: string;
  message?: string;
  status: RentalApplicationStatus;
  screening?: RentalApplicationScreening;
  appointment?: RentalApplicationAppointment;
  lease?: RentalApplicationLeaseRef;
  reviewNote?: string;
  reviewedBy?: RentalApplicationUser | string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitRentalApplicationPayload {
  listingId: string;
  desiredStartDate: string;
  desiredEndDate: string;
  occupants: number;
  monthlyIncome: number;
  employer?: string;
  message?: string;
}

export interface ReviewApplicationPayload {
  status: 'screening' | 'approved' | 'rejected';
  note?: string;
}

export interface ScreeningUpdatePayload {
  status: RentalApplicationScreeningStatus;
  provider?: string;
  reference?: string;
  score?: number;
  notes?: string;
}

export interface AppointmentUpdatePayload {
  status: RentalApplicationAppointmentStatus;
  scheduledFor?: string;
  locationNote?: string;
  note?: string;
}

export interface CreateLeasePayload {
  monthlyRent: number;
  depositAmount: number;
  currency: string;
  startDate: string;
  endDate: string;
  terms?: string;
}
