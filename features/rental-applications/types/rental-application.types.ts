export type RentalApplicationStatus = 
  | 'PENDING'
  | 'SCREENING'
  | 'APPOINTMENT_REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface RentalApplication {
  id: string;
  listingId: string;
  tenantId: string;
  ownerId: string;
  desiredStartDate: string;
  desiredEndDate: string;
  occupants: number;
  monthlyIncome: number;
  employer?: string;
  message?: string;
  status: RentalApplicationStatus;
  
  screeningScore?: number;
  screeningProvider?: string;
  screeningReference?: string;
  
  appointmentDate?: string;
  appointmentLocationNote?: string;

  adminNote?: string;
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
  status: 'pending' | 'approved' | 'rejected';
  provider: string;
  reference?: string;
  score?: number;
  notes?: string;
}

export interface AppointmentUpdatePayload {
  status: 'requested' | 'scheduled' | 'completed';
  scheduledFor: string;
  locationNote?: string;
  note?: string;
}

export interface CreateLeasePayload {
  monthlyRent: number;
  depositAmount: number;
  currency: string;
  startDate: string;
  endDate: string;
  terms: string;
}
