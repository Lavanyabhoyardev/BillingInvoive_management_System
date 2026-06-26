"use client";

import * as React from "react";

import type { CompanyProfile, Invoice } from "@/types";
import { effectivePaidAmount, invoiceBalance, PAYMENT_STATUSES } from "@/types";
import { formatCurrency, formatDate } from "@/utils";

interface InvoiceDocumentProps {
  invoice: Invoice;
  company?: CompanyProfile;
  currencySymbol?: string;
}

const STATUS_COLORS: Record<string, string> = {
  paid: "#16a34a",
  unpaid: "#dc2626",
  partial: "#d97706",
  cancelled: "#64748b",
};

/** Pixel-accurate, print/PDF-ready A4 invoice / bill. */
export const InvoiceDocument = React.forwardRef<
  HTMLDivElement,
  InvoiceDocumentProps
>(({ invoice, company, currencySymbol = "₹" }, ref) => {
  const { customer, items, totals } = invoice;
  const sym = currencySymbol;
  const statusLabel =
    PAYMENT_STATUSES.find((s) => s.value === invoice.paymentStatus)?.label ??
    invoice.paymentStatus;
  const statusColor = STATUS_COLORS[invoice.paymentStatus] ?? "#64748b";
  const paid = effectivePaidAmount(invoice);
  const balance = invoiceBalance(invoice);

  return (
    <div
      ref={ref}
      id="print-area"
      className="mx-auto w-[794px] bg-white font-sans text-slate-800"
      style={{ minHeight: "1123px" }}
    >
      <div className="flex flex-col p-10">
        {/* Header */}
        <header className="flex items-start justify-between gap-6 border-b-2 border-blue-600 pb-6">
          <div className="flex items-center gap-4">
            {company?.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={company.logo}
                alt="Logo"
                className="h-16 w-16 rounded-lg object-contain"
              />
            ) : null}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {company?.companyName || "Your Company Name"}
              </h1>
              {company?.ownerName ? (
                <p className="text-sm text-slate-500">{company.ownerName}</p>
              ) : null}
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
                {company?.address}
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500">
            {company?.phone ? <p>Phone: {company.phone}</p> : null}
            {company?.alternatePhone ? <p>Alt: {company.alternatePhone}</p> : null}
            {company?.email ? <p>{company.email}</p> : null}
            {company?.website ? <p>{company.website}</p> : null}
          </div>
        </header>

        {/* Title band */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-blue-700">
              INVOICE
            </h2>
            <span
              className="rounded-full px-3 py-1 text-xs font-bold uppercase text-white"
              style={{ backgroundColor: statusColor }}
            >
              {statusLabel}
            </span>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold text-slate-900">
              {invoice.invoiceNumber}
            </p>
            <p className="text-slate-500">Date: {formatDate(invoice.date)}</p>
            {invoice.dueDate ? (
              <p className="text-slate-500">
                Due: {formatDate(invoice.dueDate)}
              </p>
            ) : null}
          </div>
        </div>

        {/* Bill To */}
        <section className="mt-6 rounded-lg bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Bill To
          </p>
          <p className="mt-1 text-base font-semibold text-slate-900">
            {customer.name || "—"}
          </p>
          {customer.phone ? (
            <p className="text-sm text-slate-600">{customer.phone}</p>
          ) : null}
          {customer.address ? (
            <p className="text-sm text-slate-600">{customer.address}</p>
          ) : null}
          {customer.gstNumber ? (
            <p className="text-sm text-slate-600">GSTIN: {customer.gstNumber}</p>
          ) : null}
        </section>

        {/* Items */}
        <section className="mt-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-blue-600 text-left text-white">
                <th className="w-8 rounded-l-md px-2 py-2.5 text-center font-semibold">
                  #
                </th>
                <th className="px-3 py-2.5 font-semibold">Item & Description</th>
                <th className="w-14 px-2 py-2.5 text-right font-semibold">Qty</th>
                <th className="w-16 px-2 py-2.5 font-semibold">Unit</th>
                <th className="w-24 px-3 py-2.5 text-right font-semibold">Price</th>
                <th className="w-28 rounded-r-md px-3 py-2.5 text-right font-semibold">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="border-b border-slate-100 align-top">
                  <td className="px-2 py-2.5 text-center text-slate-400">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    {item.description ? (
                      <p className="mt-0.5 text-xs text-slate-500">
                        {item.description}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-2 py-2.5 text-right tabular-nums">
                    {item.quantity}
                  </td>
                  <td className="px-2 py-2.5 text-slate-600">{item.unit}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {formatCurrency(item.price, sym)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                    {formatCurrency(item.amount, sym)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Totals */}
        <section className="mt-6 flex justify-end">
          <div className="w-72 space-y-1.5 text-sm">
            <Row label="Subtotal" value={formatCurrency(totals.subtotal, sym)} />
            {totals.chargesTotal > 0 ? (
              <Row
                label="Additional Charges"
                value={formatCurrency(totals.chargesTotal, sym)}
              />
            ) : null}
            {totals.discount > 0 ? (
              <Row
                label="Discount"
                value={`- ${formatCurrency(totals.discount, sym)}`}
              />
            ) : null}
            <Row
              label={`GST (${invoice.gstPercent}%)`}
              value={formatCurrency(totals.gstAmount, sym)}
            />
            <div className="mt-2 flex items-center justify-between rounded-md bg-blue-600 px-3 py-2.5 text-white">
              <span className="font-semibold">Grand Total</span>
              <span className="text-lg font-bold tabular-nums">
                {formatCurrency(totals.grandTotal, sym)}
              </span>
            </div>
            {invoice.paymentStatus === "partial" ? (
              <>
                <Row label="Paid" value={formatCurrency(paid, sym)} />
                <div className="flex items-center justify-between px-3 font-semibold text-red-600">
                  <span>Balance Due</span>
                  <span className="tabular-nums">
                    {formatCurrency(balance, sym)}
                  </span>
                </div>
              </>
            ) : null}
          </div>
        </section>

        {/* Amount in words */}
        <section className="mt-4 rounded-md border border-slate-200 px-4 py-2.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Amount in words:{" "}
          </span>
          <span className="text-sm font-medium text-slate-700">
            {totals.grandTotalInWords}
          </span>
        </section>

        {/* Notes */}
        {invoice.notes ? (
          <section className="mt-5">
            <h3 className="text-sm font-semibold text-slate-900">Notes</h3>
            <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-slate-600">
              {invoice.notes}
            </p>
          </section>
        ) : null}

        {/* Terms + Payment */}
        <section className="mt-6 grid grid-cols-2 gap-6">
          <div>
            {company?.termsAndConditions ? (
              <>
                <h3 className="text-sm font-semibold text-slate-900">
                  Terms & Conditions
                </h3>
                <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-slate-500">
                  {company.termsAndConditions}
                </p>
              </>
            ) : null}
            {company?.bankDetails ? (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  Bank Details
                </h3>
                <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-slate-500">
                  {company.bankDetails}
                </p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col items-end justify-between gap-4">
            {company?.upiQr ? (
              <div className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={company.upiQr}
                  alt="UPI QR"
                  className="h-24 w-24 object-contain"
                />
                <p className="mt-1 text-[10px] text-slate-400">Scan to pay</p>
              </div>
            ) : null}

            <div className="mt-auto w-40 text-center">
              {company?.signature ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={company.signature}
                  alt="Signature"
                  className="mx-auto h-12 object-contain"
                />
              ) : (
                <div className="h-12" />
              )}
              <div className="mt-1 border-t border-slate-300 pt-1 text-xs font-medium text-slate-600">
                Authorized Signature
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 border-t border-slate-200 pt-4 text-center">
          <p className="text-sm font-semibold text-blue-700">
            Thank you for your business!
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            {company?.companyName}
            {company?.phone ? ` · ${company.phone}` : ""}
            {company?.email ? ` · ${company.email}` : ""}
          </p>
        </footer>
      </div>
    </div>
  );
});
InvoiceDocument.displayName = "InvoiceDocument";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-3">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium tabular-nums text-slate-800">{value}</span>
    </div>
  );
}
