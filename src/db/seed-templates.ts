import type { AdditionalCharges, ItemUnit } from "@/types";
import { EMPTY_CHARGES } from "@/types";
import { computeItemAmount, generateId } from "@/utils";

/** Shorthand item definition used only for seeding. */
interface SeedItem {
  name: string;
  description?: string;
  quantity: number;
  unit?: ItemUnit;
  price?: number;
}

interface SeedTemplate {
  name: string;
  category: string;
  description: string;
  items: SeedItem[];
  charges?: Partial<AdditionalCharges>;
  gstPercent?: number;
}

/**
 * Built-in example templates. Prices are sensible defaults the user edits later.
 * Loading a template fills items, quantities, descriptions and charges so only
 * prices/quantities need adjusting.
 */
export const SEED_TEMPLATES: SeedTemplate[] = [
  {
    name: "Gaming PC Build",
    category: "New Build",
    description: "High-performance gaming desktop assembly",
    items: [
      { name: "Processor (CPU)", description: "Gaming-grade multi-core CPU", quantity: 1, unit: "Nos", price: 22000 },
      { name: "Motherboard", description: "Gaming motherboard with PCIe support", quantity: 1, unit: "Nos", price: 14000 },
      { name: "Graphics Card (GPU)", description: "Dedicated gaming GPU", quantity: 1, unit: "Nos", price: 35000 },
      { name: "RAM", description: "16GB DDR4/DDR5 module", quantity: 2, unit: "Nos", price: 3500 },
      { name: "SSD", description: "1TB NVMe SSD", quantity: 1, unit: "Nos", price: 6000 },
      { name: "Power Supply (SMPS)", description: "650W 80+ certified PSU", quantity: 1, unit: "Nos", price: 5000 },
      { name: "Cabinet", description: "Gaming cabinet with RGB fans", quantity: 1, unit: "Nos", price: 4500 },
      { name: "CPU Cooler", description: "Air / liquid cooling", quantity: 1, unit: "Nos", price: 3000 },
      { name: "Assembly & Testing", description: "Build, cable management, OS install, stress test", quantity: 1, unit: "Service", price: 1500 },
    ],
    charges: { serviceCharge: 1500 },
    gstPercent: 18,
  },
  {
    name: "Office PC Build",
    category: "New Build",
    description: "Reliable desktop for office / business use",
    items: [
      { name: "Processor (CPU)", description: "Mid-range office CPU", quantity: 1, unit: "Nos", price: 9000 },
      { name: "Motherboard", description: "Business-class motherboard", quantity: 1, unit: "Nos", price: 6500 },
      { name: "RAM", description: "8GB DDR4 module", quantity: 1, unit: "Nos", price: 1800 },
      { name: "SSD", description: "512GB SATA SSD", quantity: 1, unit: "Nos", price: 2800 },
      { name: "Power Supply (SMPS)", description: "450W PSU", quantity: 1, unit: "Nos", price: 2200 },
      { name: "Cabinet", description: "Standard ATX cabinet", quantity: 1, unit: "Nos", price: 1800 },
      { name: "Assembly & OS Install", description: "Build, OS & driver installation", quantity: 1, unit: "Service", price: 800 },
    ],
    charges: { serviceCharge: 800 },
    gstPercent: 18,
  },
  {
    name: "Laptop Repair",
    category: "Repair",
    description: "Standard laptop diagnosis and repair",
    items: [
      { name: "Diagnosis", description: "Full hardware & software diagnosis", quantity: 1, unit: "Service", price: 300 },
      { name: "Keyboard Replacement", description: "Replace faulty keyboard", quantity: 1, unit: "Nos", price: 1500 },
      { name: "Thermal Paste & Cleaning", description: "Re-paste CPU/GPU and internal cleaning", quantity: 1, unit: "Service", price: 600 },
      { name: "Labour Charge", description: "Disassembly and reassembly", quantity: 1, unit: "Service", price: 500 },
    ],
    charges: { serviceCharge: 300 },
    gstPercent: 18,
  },
  {
    name: "Desktop Repair",
    category: "Repair",
    description: "Desktop troubleshooting and component repair",
    items: [
      { name: "Diagnosis", description: "Hardware & software diagnosis", quantity: 1, unit: "Service", price: 250 },
      { name: "SMPS Replacement", description: "Replace power supply unit", quantity: 1, unit: "Nos", price: 2200 },
      { name: "OS Reinstallation", description: "Fresh OS install with drivers", quantity: 1, unit: "Service", price: 500 },
      { name: "Internal Cleaning", description: "Dust cleaning and reassembly", quantity: 1, unit: "Service", price: 400 },
    ],
    charges: { serviceCharge: 250 },
    gstPercent: 18,
  },
  {
    name: "Networking",
    category: "Networking",
    description: "Office / home wired network setup",
    items: [
      { name: "Network Switch", description: "8/16 port gigabit switch", quantity: 1, unit: "Nos", price: 2500 },
      { name: "CAT6 Cable", description: "CAT6 ethernet cabling", quantity: 50, unit: "Meter", price: 30 },
      { name: "RJ45 Connectors", description: "Crimping connectors", quantity: 20, unit: "Pcs", price: 10 },
      { name: "Router Configuration", description: "Router setup & VLAN config", quantity: 1, unit: "Service", price: 1000 },
      { name: "Cabling & Crimping Labour", description: "Cable laying and termination", quantity: 1, unit: "Service", price: 1500 },
    ],
    charges: { installationCharge: 1000, visitingCharge: 300 },
    gstPercent: 18,
  },
  {
    name: "CCTV Installation",
    category: "CCTV",
    description: "CCTV surveillance system installation",
    items: [
      { name: "CCTV Camera (Dome/Bullet)", description: "2MP/5MP HD camera", quantity: 4, unit: "Nos", price: 1500 },
      { name: "DVR / NVR", description: "4/8 channel recorder", quantity: 1, unit: "Nos", price: 4500 },
      { name: "Hard Disk", description: "1TB surveillance HDD", quantity: 1, unit: "Nos", price: 3500 },
      { name: "Camera Cable", description: "3+1 / CAT6 cable", quantity: 90, unit: "Meter", price: 25 },
      { name: "Power Supply", description: "CCTV power supply unit", quantity: 1, unit: "Nos", price: 800 },
      { name: "Installation & Configuration", description: "Mounting, wiring, mobile view setup", quantity: 1, unit: "Service", price: 2000 },
    ],
    charges: { installationCharge: 2000, visitingCharge: 300, transportationCharge: 200 },
    gstPercent: 18,
  },
  {
    name: "WiFi Setup",
    category: "Networking",
    description: "WiFi network installation and configuration",
    items: [
      { name: "WiFi Router", description: "Dual-band WiFi router", quantity: 1, unit: "Nos", price: 2200 },
      { name: "Access Point", description: "Ceiling-mount access point", quantity: 1, unit: "Nos", price: 3000 },
      { name: "Configuration", description: "SSID, security & coverage setup", quantity: 1, unit: "Service", price: 800 },
    ],
    charges: { installationCharge: 800, visitingCharge: 300 },
    gstPercent: 18,
  },
  {
    name: "Printer Installation",
    category: "Peripherals",
    description: "Printer setup and configuration",
    items: [
      { name: "Printer", description: "Inkjet / laser printer", quantity: 1, unit: "Nos", price: 8000 },
      { name: "Driver Installation", description: "Driver & software setup", quantity: 1, unit: "Service", price: 300 },
      { name: "Network Sharing Setup", description: "Share printer over network", quantity: 1, unit: "Service", price: 400 },
    ],
    charges: { visitingCharge: 200 },
    gstPercent: 18,
  },
];

/** Materializes a seed template into full QuotationItem records with ids and amounts. */
export function buildSeedTemplateRecords() {
  const now = new Date().toISOString();
  return SEED_TEMPLATES.map((tpl) => ({
    id: generateId(),
    name: tpl.name,
    category: tpl.category,
    description: tpl.description,
    isSeed: true,
    gstPercent: tpl.gstPercent ?? 18,
    charges: { ...EMPTY_CHARGES, ...tpl.charges },
    items: tpl.items.map((it) => {
      const quantity = it.quantity;
      const price = it.price ?? 0;
      return {
        id: generateId(),
        name: it.name,
        description: it.description ?? "",
        quantity,
        unit: it.unit ?? ("Nos" as ItemUnit),
        price,
        amount: computeItemAmount(quantity, price),
      };
    }),
    createdAt: now,
    updatedAt: now,
  }));
}
