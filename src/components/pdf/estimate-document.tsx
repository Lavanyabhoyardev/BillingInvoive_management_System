"use client";

import * as React from "react";

import type { CompanyProfile, Estimate } from "@/types";
import { formatCurrency, formatDate } from "@/utils";

interface EstimateDocumentProps {
  estimate: Estimate;
  company?: CompanyProfile;
  currencySymbol?: string;
}

/** Pixel-accurate, print/PDF-ready A4 cost estimate. */
export const EstimateDocument = React.forwardRef<
  HTMLDivElement,
  EstimateDocumentProps
>(({ estimate, company, currencySymbol = "₹" }, ref) => {
  const { items, totals } = estimate;
  const sym = currencySymbol;

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
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
                {company?.address}
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            {company?.phone ? <p>Phone: {company.phone}</p> : null}
            {company?.email ? <p>{company.email}</p> : null}
            {company?.website ? <p>{company.website}</p> : null}
          </div>
        </header>

        {/* Title */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-blue-700">
              ESTIMATE
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-700">
              {estimate.title}
            </p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold text-slate-900">
              {estimate.estimateNumber}
            </p>
            <p className="text-slate-500">Date: {formatDate(estimate.date)}</p>
            {estimate.forName ? (
              <p className="text-slate-500">For: {estimate.forName}</p>
            ) : null}
          </div>
        </div>

        {/* Items */}
        <section className="mt-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-blue-600 text-left text-white">
                <th className="w-8 rounded-l-md px-2 py-2 text-center font-semibold">
                  #
                </th>
                <th className="px-3 py-2 font-semibold">Item & Description</th>
                <th className="w-14 px-2 py-2 text-right font-semibold">Qty</th>
                <th className="w-16 px-2 py-2 font-semibold">Unit</th>
                <th className="w-24 px-3 py-2 text-right font-semibold">Price</th>
                <th className="w-28 rounded-r-md px-3 py-2 text-right font-semibold">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="border-b border-slate-100 align-top">
                  <td className="px-2 py-2 text-center text-slate-400">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    {item.description ? (
                      <p className="mt-0.5 text-xs text-slate-500">
                        {item.description}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums">
                    {item.quantity}
                  </td>
                  <td className="px-2 py-2 text-slate-600">{item.unit}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatCurrency(item.price, sym)}
                  </td>
                  <td className="px-3 py-2 text-right font-medium tabular-nums">
                    {formatCurrency(item.amount, sym)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Totals */}
        <section className="mt-4 flex justify-end">
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
            {estimate.gstPercent > 0 ? (
              <Row
                label={`GST (${estimate.gstPercent}%)`}
                value={formatCurrency(totals.gstAmount, sym)}
              />
            ) : null}
            <div className="mt-2 flex items-center justify-between rounded-md bg-blue-600 px-3 py-2 text-white">
              <span className="font-semibold">Estimated Total</span>
              <span className="text-lg font-bold tabular-nums">
                {formatCurrency(totals.grandTotal, sym)}
              </span>
            </div>
          </div>
        </section>

        {/* Amount in words */}
        <section className="mt-4 rounded-md border border-slate-200 px-4 py-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Amount in words:{" "}
          </span>
          <span className="text-sm font-medium text-slate-700">
            {totals.grandTotalInWords}
          </span>
        </section>

        {/* Notes */}
        {estimate.notes ? (
          <section className="mt-5">
            <h3 className="text-sm font-semibold text-slate-900">Notes</h3>
            <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-slate-600">
              {estimate.notes}
            </p>
          </section>
        ) : null}

        {/* Disclaimer */}
        <section className="mt-5 rounded-md bg-amber-50 px-4 py-2 text-xs text-amber-700">
          This is an estimate only. Actual prices may vary based on availability
          and final requirements.
        </section>

        {/* Footer */}
        <footer className="mt-auto border-t border-slate-200 pt-4 text-center">
          <p className="text-sm font-semibold text-blue-700">
            Thank you for considering us!
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            {company?.companyName}
            {company?.phone ? ` · ${company.phone}` : ""}
          </p>
        </footer>
      </div>
    </div>
  );
});
EstimateDocument.displayName = "EstimateDocument";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-3">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium tabular-nums text-slate-800">{value}</span>
    </div>
  );
}
