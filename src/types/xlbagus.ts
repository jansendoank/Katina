export type VoucherStatus = 'Available' | 'Redeemed' | 'Processing' | 'Expired' | 'Invalid';

export interface PinInquiryData {
  success: boolean;
  pinNumber: string;
  responseCode: string;
  status: VoucherStatus;
  description: string;
  productName: string | null;
  denomination: string | null;
  country: string | null;
  transactionId: string | null;
  usedDate: string | null;
  usedBy: string | null;
  source: 'live' | 'sandbox';
  timestamp?: number;
}

export interface StatusTrackingData {
  success: boolean;
  serialNumber: string | null;
  pinNumber: string | null;
  hasResult: boolean;
  country: string | null;
  pinStatus: string | null;
  transactionStatus: string | null;
  product: string | null;
  transactionId: string | null;
  usedDate: string | null;
  usedBy: string | null;
  source: 'live' | 'sandbox';
}

export interface TelcoProductItem {
  name: string;
  telcoCode: string;
  denomination?: string;
}

export interface SystemInfoData {
  platform: string;
  url: string;
  supportedLanguages: string[];
  alternativeAccessNumbers: string[];
  rechargeIntervalRules: Array<{ duration: string; product: string }>;
  source: 'live' | 'sandbox';
}
