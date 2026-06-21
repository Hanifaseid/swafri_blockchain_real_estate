export type CommissionType = 'percentage' | 'flat';

export interface SystemSettings {
  id: string;
  platformName: string;
  platformEmail: string;
  supportEmail: string;

  commissionRate: number;
  commissionType: CommissionType;
  flatCommissionAmount: number;
  commissionCurrency: string;

  minTransactionAmount: number;
  maxTransactionAmount: number;

  escrowEnabled: boolean;
  autoApproveListings: boolean;
  maintenanceMode: boolean;
  allowGuestBrowsing: boolean;

  updatedBy?: string;
  updatedAt: string;
  createdAt: string;
}

export type UpdateSettingsPayload = Partial<
  Omit<SystemSettings, 'id' | 'updatedBy' | 'updatedAt' | 'createdAt'>
>;
