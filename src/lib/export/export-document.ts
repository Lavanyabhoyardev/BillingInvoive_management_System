import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import { downloadBlob, slugify } from "@/utils";

/**
 * Rendering & export helpers for the printable quotation document.
 *
 * The source element must be a fixed-width A4-proportioned node (see
 * QuotationDocument). We rasterize it with html2canvas at high scale, then
 * either save a PDF (paginated) or an image.
 */

const A4 = { width: 210, height: 297 }; // mm

/** Captures an element to a high-resolution canvas. */
async function captureCanvas(
  element: HTMLElement,
  scale = 2
): Promise<HTMLCanvasElement> {
  return html2canvas(element, {
    scale,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
    windowWidth: element.scrollWidth,
  });
}

/** Exports the element as a multi-page A4 PDF and triggers download. */
export async function exportToPdf(
  element: HTMLElement,
  filename: string
): Promise<void> {
  const canvas = await captureCanvas(element, 2);
  const imgData = canvas.toDataURL("image/jpeg", 0.95);

  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const imgWidth = A4.width;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
  heightLeft -= A4.height;

  // Add extra pages if the content overflows one A4 page.
  while (heightLeft > 0) {
    position -= A4.height;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= A4.height;
  }

  pdf.save(`${slugify(filename) || "quotation"}.pdf`);
}

/** Exports the element as a PNG or JPEG image and triggers download. */
export async function exportToImage(
  element: HTMLElement,
  filename: string,
  format: "png" | "jpeg" = "png"
): Promise<void> {
  const canvas = await captureCanvas(element, 3);
  const mime = format === "png" ? "image/png" : "image/jpeg";
  const quality = format === "png" ? undefined : 0.95;
  const dataUrl = canvas.toDataURL(mime, quality);
  const ext = format === "png" ? "png" : "jpg";
  downloadBlob(dataUrl, `${slugify(filename) || "quotation"}.${ext}`);
}

/** Opens the browser print dialog. Print CSS isolates #print-area. */
export function printDocument(): void {
  window.print();
}
