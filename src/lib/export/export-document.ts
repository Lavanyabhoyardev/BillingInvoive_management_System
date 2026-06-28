import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import { downloadBlob, slugify } from "@/utils";

/**
 * Rendering & export helpers for the printable A4 documents.
 *
 * Keeps html2canvas + jsPDF. The critical detail for correct output on EVERY
 * device (desktop, Chrome Android, Samsung Internet, Safari iOS):
 *
 *   The on-screen preview wraps the document in a CSS `transform: scale(...)`
 *   (DocumentPreview) so it fits small screens. Capturing that live, scaled,
 *   viewport-dependent node makes html2canvas mis-measure on mobile — producing
 *   overlapping/duplicated/broken layouts.
 *
 *   Root-cause fix: we never capture the live preview node. Instead we clone it
 *   into an OFF-SCREEN, TRANSFORM-FREE, FIXED 794px container and capture that,
 *   with an explicit window size and a fixed pixel scale (ignoring the device
 *   pixel ratio). The result is byte-for-byte identical regardless of screen.
 */

const A4_MM = { width: 210, height: 297 };
const A4_WIDTH_PX = 794; // A4 width @ 96dpi (matches the document component)

/** Resolves once web fonts are ready (so text isn't captured in a fallback font). */
async function waitForFonts(): Promise<void> {
  try {
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts?.ready) await fonts.ready;
  } catch {
    /* fonts API unavailable — ignore */
  }
}

/** Resolves once every <img> inside the element has finished loading/decoding. */
async function waitForImages(element: HTMLElement): Promise<void> {
  const images = Array.from(element.querySelectorAll("img"));
  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth > 0) {
        return img.decode?.().catch(() => undefined) ?? Promise.resolve();
      }
      return new Promise<void>((resolve) => {
        img.addEventListener("load", () => resolve(), { once: true });
        img.addEventListener("error", () => resolve(), { once: true });
      });
    })
  );
}

/** Waits two animation frames so layout & paint are fully committed. */
function nextFrame(): Promise<void> {
  return new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );
}

/**
 * Captures a printable element to a canvas at a FIXED A4 width, independent of
 * the current screen size, scaling or scroll position.
 *
 * @param element the live document node (may be inside a scaled preview)
 * @param scale   fixed output pixel ratio (NOT the device pixel ratio)
 */
async function captureCanvas(
  element: HTMLElement,
  scale = 2
): Promise<HTMLCanvasElement> {
  await waitForFonts();

  // 1. Clone the document so we never touch the scaled/visible preview.
  const clone = element.cloneNode(true) as HTMLElement;
  clone.removeAttribute("id"); // avoid duplicate #print-area
  clone.style.transform = "none";
  clone.style.margin = "0";
  clone.style.width = `${A4_WIDTH_PX}px`;
  clone.style.maxWidth = "none";
  clone.style.minHeight = "0";

  // 2. Park it off-screen at full size, transform-free, on a white backdrop.
  const holder = document.createElement("div");
  holder.setAttribute("aria-hidden", "true");
  Object.assign(holder.style, {
    position: "fixed",
    top: "0",
    left: "-10000px",
    width: `${A4_WIDTH_PX}px`,
    background: "#ffffff",
    transform: "none",
    zIndex: "-1",
    pointerEvents: "none",
  });
  holder.appendChild(clone);
  document.body.appendChild(holder);

  try {
    // 3. Wait for images + layout/paint before capturing.
    await waitForImages(clone);
    await nextFrame();

    const captureHeight = Math.ceil(clone.scrollHeight);

    // 4. Capture at a fixed window size + fixed scale (DPR-independent).
    return await html2canvas(clone, {
      scale,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: A4_WIDTH_PX,
      height: captureHeight,
      windowWidth: A4_WIDTH_PX,
      windowHeight: captureHeight,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
    });
  } finally {
    document.body.removeChild(holder);
  }
}

/** Exports the element as a multi-page A4 PDF and triggers download. */
export async function exportToPdf(
  element: HTMLElement,
  filename: string
): Promise<void> {
  const canvas = await captureCanvas(element, 2);
  const imgData = canvas.toDataURL("image/jpeg", 0.95);

  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const imgWidth = A4_MM.width;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
  heightLeft -= A4_MM.height;

  // Add extra pages if the content overflows one A4 page.
  while (heightLeft > 0) {
    position -= A4_MM.height;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= A4_MM.height;
  }

  pdf.save(`${slugify(filename) || "document"}.pdf`);
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
  downloadBlob(dataUrl, `${slugify(filename) || "document"}.${ext}`);
}

/** Opens the browser print dialog. Print CSS isolates #print-area. */
export function printDocument(): void {
  window.print();
}
