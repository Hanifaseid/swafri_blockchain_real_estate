// ─── Compliance Types ────────────────────────────────────────────────────────────
// Matches the API spec for compliance cases, screenings, and broker licenses

export type ComplianceCaseType =
  | 'kyc'
  | 'ownership_document'
  | 'listing'
  | 'offer'
  | 'lease'
  | 'title'
  | 'broker_license';

export type ComplianceCaseStatus = 'open' | 'under_review' | 'resolved' | 'dismissed';

export type ComplianceSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ScreeningStatus = 'clear' | 'potential_match' | 'confirmed_match';

export type ScreeningProvider = 'manual' | 'mock';

export type BrokerLicenseStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface ComplianceCase {
  id: string;
  type: ComplianceCaseType;
  status: ComplianceCaseStatus;
  severity: ComplianceSeverity;
  subjectUser?: string;
  assignedTo?: string;
  resolution?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateComplianceCaseInput {
  status?: ComplianceCaseStatus;
  severity?: ComplianceSeverity;
  assignedTo?: string;
  resolution?: string;
  note?: string;
}

export interface Screening {
  id: string;
  subjectUser: string;
  provider: ScreeningProvider;
  status: ScreeningStatus;
  categories: string[];
  reference?: string;
  rawResult?: Record<string, unknown>;
  createdAt: string;
}

export interface CreateScreeningInput {
  subjectUser: string;
  provider?: ScreeningProvider;
  status: ScreeningStatus;
  categories?: string[];
  reference?: string;
  rawResult?: Record<string, unknown>;
}

export interface BrokerLicense {
  id: string;
  owner: string;
  licenseNumber: string;
  jurisdiction: string;
  holderName: string;
  expiresAt?: string;
  documentPublicId?: string;
  documentHash?: string;
  status: BrokerLicenseStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitBrokerLicenseInput {
  licenseNumber: string;
  jurisdiction: string;
  holderName: string;
  expiresAt?: string;
  documentPublicId?: string;
  documentHash?: string;
}

export interface ReviewBrokerLicenseInput {
  decision: 'approve' | 'reject' | 'expire';
  note?: string;
}

export interface ComplianceCasesParams {
  status?: ComplianceCaseStatus;
  severity?: ComplianceSeverity;
  type?: ComplianceCaseType;
  subjectUser?: string;
  page?: number;
  limit?: number;
}

export interface BrokerLicensesParams {
  owner?: string;
  status?: BrokerLicenseStatus;
  page?: number;
  limit?: number;
}
