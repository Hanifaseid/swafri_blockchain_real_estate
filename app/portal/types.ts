export interface Property {
  id: string;
  name: string;
  location: string;
  tokenPrice: number;
  tokensAvailable: number;
  totalTokens: number;
  apy: number;
  category: 'Investing' | 'Building' | 'Advisory';
  image: string;
  description?: string;
  purpose: 'FOR_RENT' | 'FOR_SALE' | 'FOR_RENT_AND_SALE';
  type: 'Apartment' | 'House' | 'Land' | 'Commercial Space';
  bedrooms?: number;
  bathrooms?: number;
  sizeSqFt?: number;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'PUBLISHED' | 'REJECTED' | 'SUSPENDED' | 'ARCHIVED' | 'SOLD';
  ownerId: string;
  ownerName: string;
  documentName?: string;
  blockchainHash?: string;
  certificateId?: string;
  rejectionReason?: string;
  adminTag?: string;
  additionalImages?: string[];
}

export interface Inquiry {
  id: string;
  propertyId: string;
  propertyName: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone?: string;
  message: string;
  type: 'RENT' | 'BUY';
  status: 'NEW' | 'RESPONDED' | 'CLOSED';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  user: string;
  email: string;
  action: string;
  timestamp: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'PROPERTY_OWNER' | 'TENANT';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BLOCKED' | 'REJECTED';
  kycStatus: 'NOT_STARTED' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  walletStatus: 'NOT_LINKED' | 'LINKED' | 'VERIFIED' | 'REVOKED';
  createdAt: string;
  linkedWalletAddress?: string;
}
