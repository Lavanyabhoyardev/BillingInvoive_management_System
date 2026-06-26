/** App-wide constants. */

/** Services offered by the hardware business (used for quick-add suggestions). */
export const BUSINESS_SERVICES = [
  "Desktop Repair",
  "Laptop Repair",
  "New Computer Build",
  "Computer Assembly",
  "Hardware Upgrade",
  "SSD Installation",
  "RAM Upgrade",
  "CCTV Installation",
  "WiFi Installation",
  "Networking",
  "Printer Repair",
  "Server Installation",
  "Annual Maintenance",
  "Other Computer Services",
] as const;

export const APP_NAME = "QuoteDesk";
export const APP_TAGLINE = "Offline Quotation Manager";

/** Navigation routes. */
export const ROUTES = {
  dashboard: "/",
  newQuotation: "/quotations/new",
  quotations: "/quotations",
  drafts: "/drafts",
  invoices: "/invoices",
  newInvoice: "/invoices/new",
  estimates: "/estimates",
  newEstimate: "/estimates/new",
  customers: "/customers",
  templates: "/templates",
  settings: "/settings",
} as const;
