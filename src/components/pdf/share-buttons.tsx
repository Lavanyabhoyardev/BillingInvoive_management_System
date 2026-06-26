"use client";

import { Mail, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  buildShareMessage,
  shareViaEmail,
  shareViaWhatsApp,
} from "@/lib/share";

interface ShareButtonsProps {
  docLabel: string;
  number: string;
  customerName?: string;
  customerPhone?: string;
  companyName?: string;
  grandTotal: number;
  currencySymbol?: string;
}

/** WhatsApp + Email share buttons for a document. */
export function ShareButtons({
  docLabel,
  number,
  customerName,
  customerPhone,
  companyName,
  grandTotal,
  currencySymbol,
}: ShareButtonsProps) {
  const message = buildShareMessage({
    docLabel,
    number,
    customerName,
    companyName,
    grandTotal,
    currencySymbol,
  });

  return (
    <>
      <Button
        variant="outline"
        onClick={() => shareViaWhatsApp(message, customerPhone)}
      >
        <MessageCircle className="h-4 w-4 text-green-600" />
        WhatsApp
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          shareViaEmail(`${docLabel} ${number}`, message)
        }
      >
        <Mail className="h-4 w-4" />
        Email
      </Button>
    </>
  );
}
