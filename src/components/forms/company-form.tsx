"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Save, Building2, Phone, FileText, Landmark } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "./form-field";
import { ImageUpload } from "./image-upload";
import {
  companySchema,
  type CompanyFormValues,
} from "@/lib/validation/company-schema";
import { companyService } from "@/services";
import type { CompanyProfile } from "@/types";

interface CompanyFormProps {
  initial?: CompanyProfile;
}

function toFormValues(profile?: CompanyProfile): CompanyFormValues {
  return {
    logo: profile?.logo,
    companyName: profile?.companyName ?? "",
    ownerName: profile?.ownerName ?? "",
    phone: profile?.phone ?? "",
    alternatePhone: profile?.alternatePhone ?? "",
    email: profile?.email ?? "",
    website: profile?.website ?? "",
    address: profile?.address ?? "",
    termsAndConditions: profile?.termsAndConditions ?? "",
    bankDetails: profile?.bankDetails ?? "",
    upiQr: profile?.upiQr,
    signature: profile?.signature,
  };
}

/** The full company-profile form. Persists to IndexedDB on submit. */
export function CompanyForm({ initial }: CompanyFormProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: toFormValues(initial),
  });

  // Re-sync when the persisted profile loads/changes.
  React.useEffect(() => {
    if (initial) reset(toFormValues(initial));
  }, [initial, reset]);

  async function onSubmit(values: CompanyFormValues) {
    await companyService.save({
      logo: values.logo,
      companyName: values.companyName.trim(),
      ownerName: values.ownerName?.trim() ?? "",
      phone: values.phone.trim(),
      alternatePhone: values.alternatePhone?.trim() || undefined,
      email: values.email?.trim() || undefined,
      website: values.website?.trim() || undefined,
      address: values.address.trim(),
      termsAndConditions: values.termsAndConditions?.trim() || undefined,
      bankDetails: values.bankDetails?.trim() || undefined,
      upiQr: values.upiQr,
      signature: values.signature,
    });
    reset(values);
    toast.success("Company profile saved.");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Identity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-primary" />
            Business Identity
          </CardTitle>
          <CardDescription>
            Shown at the top of every quotation and PDF.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <FormField label="Company Logo">
            <Controller
              control={control}
              name="logo"
              render={({ field }) => (
                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  label="Upload logo"
                  variant="logo"
                />
              )}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Company Name"
              htmlFor="companyName"
              required
              error={errors.companyName?.message}
            >
              <Input
                id="companyName"
                placeholder="e.g. TechFix Computer Services"
                {...register("companyName")}
              />
            </FormField>
            <FormField
              label="Owner Name"
              htmlFor="ownerName"
              error={errors.ownerName?.message}
            >
              <Input
                id="ownerName"
                placeholder="e.g. Rahul Sharma"
                {...register("ownerName")}
              />
            </FormField>
          </div>

          <FormField
            label="Address"
            htmlFor="address"
            required
            error={errors.address?.message}
          >
            <Textarea
              id="address"
              rows={2}
              placeholder="Shop / building, street, city, state, PIN"
              {...register("address")}
            />
          </FormField>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="h-4 w-4 text-primary" />
            Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Phone Number"
            htmlFor="phone"
            required
            error={errors.phone?.message}
          >
            <Input id="phone" placeholder="Primary contact" {...register("phone")} />
          </FormField>
          <FormField label="Alternate Phone" htmlFor="alternatePhone">
            <Input
              id="alternatePhone"
              placeholder="Optional"
              {...register("alternatePhone")}
            />
          </FormField>
          <FormField
            label="Email"
            htmlFor="email"
            error={errors.email?.message}
          >
            <Input
              id="email"
              type="email"
              placeholder="business@email.com"
              {...register("email")}
            />
          </FormField>
          <FormField label="Website" htmlFor="website">
            <Input
              id="website"
              placeholder="www.example.com"
              {...register("website")}
            />
          </FormField>
        </CardContent>
      </Card>

      {/* Terms & banking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            Terms & Notes
          </CardTitle>
          <CardDescription>
            Default terms printed on every quotation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Terms & Conditions" htmlFor="termsAndConditions">
            <Textarea
              id="termsAndConditions"
              rows={4}
              placeholder={
                "1. Prices are valid for the quotation period.\n2. 50% advance required.\n3. Warranty as per manufacturer."
              }
              {...register("termsAndConditions")}
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Landmark className="h-4 w-4 text-primary" />
            Payment & Signature
          </CardTitle>
          <CardDescription>
            Bank details, UPI QR and your authorized signature.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <FormField label="Bank Details" htmlFor="bankDetails">
            <Textarea
              id="bankDetails"
              rows={3}
              placeholder={"A/C Name:\nA/C No:\nIFSC:\nBank & Branch:"}
              {...register("bankDetails")}
            />
          </FormField>

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="UPI QR Image">
              <Controller
                control={control}
                name="upiQr"
                render={({ field }) => (
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    label="Upload QR"
                    variant="square"
                  />
                )}
              />
            </FormField>
            <FormField label="Authorized Signature">
              <Controller
                control={control}
                name="signature"
                render={({ field }) => (
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    label="Upload signature"
                    variant="wide"
                  />
                )}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* Sticky save bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky bottom-4 z-10 flex items-center justify-end gap-3 rounded-xl border bg-card/90 p-3 shadow-lg backdrop-blur"
      >
        <span className="mr-auto pl-2 text-sm text-muted-foreground">
          {isDirty ? "You have unsaved changes" : "All changes saved"}
        </span>
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          <Save className="h-4 w-4" />
          {isSubmitting ? "Saving…" : "Save Profile"}
        </Button>
      </motion.div>
    </form>
  );
}
