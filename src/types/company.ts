import type { BaseEntity } from "./common";

/**
 * Company / business profile. A single record is kept (id = COMPANY_PROFILE_ID).
 * These values are injected automatically into every quotation and PDF.
 *
 * Image fields store base64 data URLs so they remain available fully offline.
 */
export interface CompanyProfile extends BaseEntity {
  logo?: string; // base64 data URL
  companyName: string;
  ownerName: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  website?: string;
  address: string;
  termsAndConditions?: string;
  bankDetails?: string;
  upiQr?: string; // base64 data URL
  signature?: string; // base64 data URL of authorized signature
}

export const COMPANY_PROFILE_ID = "company-profile";
