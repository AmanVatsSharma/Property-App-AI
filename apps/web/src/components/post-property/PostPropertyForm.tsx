/**
 * @file PostPropertyForm.tsx
 * @module post-property
 * @description Post property form with react-hook-form and Zod validation
 * @author BharatERP
 * @created 2025-03-10
 */

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { apiPost } from "@/lib/api-client";
import { logger } from "@/lib/logger";

const postPropertySchema = z.object({
  listingFor: z.enum(["sell", "rent"], { required_error: "Select listing type" }),
  propertyType: z.enum(["apartment", "villa", "plot", "builder-floor", "office"], { required_error: "Select property type" }),
  address: z.string().min(5, "Address must be at least 5 characters").max(500, "Address too long"),
});

export type PostPropertyFormValues = z.infer<typeof postPropertySchema>;

export default function PostPropertyForm() {
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostPropertyFormValues>({
    resolver: zodResolver(postPropertySchema),
    defaultValues: { listingFor: "sell", propertyType: "apartment", address: "" },
  });

  const onSubmit = async (data: PostPropertyFormValues) => {
    setSubmitStatus("loading");
    setErrorMessage("");
    logger.debug("PostPropertyForm:submit", data);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (baseUrl) {
        await apiPost("/listings", data);
        logger.info("PostPropertyForm:submit success");
        setSubmitStatus("success");
      } else {
        logger.debug("PostPropertyForm:submit mock success (no API URL)");
        setSubmitStatus("success");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong. Please try again.";
      setErrorMessage(message);
      setSubmitStatus("error");
      logger.error("PostPropertyForm:submit error", e);
    }
  };

  if (submitStatus === "success") {
    return (
      <div className="form-section reveal" style={{ textAlign: "center", padding: 48 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h3 className="h3" style={{ marginBottom: 12 }}>Listing submitted</h3>
        <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
          {process.env.NEXT_PUBLIC_API_URL
            ? "Your property has been submitted. We will review and publish shortly."
            : "Form validated. Connect NEXT_PUBLIC_API_URL to submit to the backend."}
        </p>
      </div>
    );
  }

  return (
    <div className="form-section reveal">
      <h3>🏠 Step 1 — Basic Details</h3>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-grid-2" style={{ marginBottom: 16 }}>
          <div className="form-field">
            <label className="label" htmlFor="listingFor">
              Listing For
            </label>
            <select
              id="listingFor"
              className="select"
              aria-invalid={!!errors.listingFor}
              aria-describedby={errors.listingFor ? "listingFor-error" : undefined}
              {...register("listingFor")}
            >
              <option value="sell">Sell</option>
              <option value="rent">Rent / Lease</option>
            </select>
            {errors.listingFor && (
              <span id="listingFor-error" style={{ fontSize: 12, color: "var(--coral)", marginTop: 4, display: "block" }}>
                {errors.listingFor.message}
              </span>
            )}
          </div>
          <div className="form-field">
            <label className="label" htmlFor="propertyType">
              Property Type
            </label>
            <select
              id="propertyType"
              className="select"
              aria-invalid={!!errors.propertyType}
              aria-describedby={errors.propertyType ? "propertyType-error" : undefined}
              {...register("propertyType")}
            >
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="plot">Plot</option>
              <option value="builder-floor">Builder Floor</option>
              <option value="office">Office</option>
            </select>
            {errors.propertyType && (
              <span id="propertyType-error" style={{ fontSize: 12, color: "var(--coral)", marginTop: 4, display: "block" }}>
                {errors.propertyType.message}
              </span>
            )}
          </div>
        </div>
        <div className="form-field" style={{ marginBottom: 20 }}>
          <label className="label" htmlFor="address">
            Address
          </label>
          <input
            id="address"
            type="text"
            className="input"
            placeholder="City, locality, project name"
            aria-invalid={!!errors.address}
            aria-describedby={errors.address ? "address-error" : undefined}
            {...register("address")}
          />
          {errors.address && (
            <span id="address-error" style={{ fontSize: 12, color: "var(--coral)", marginTop: 4, display: "block" }}>
              {errors.address.message}
            </span>
          )}
        </div>
        {errorMessage && (
          <p style={{ fontSize: 13, color: "var(--coral)", marginBottom: 16 }} role="alert">
            {errorMessage}
          </p>
        )}
        <button type="submit" className="btn-primary" style={{ padding: 13, borderRadius: 12 }} disabled={submitStatus === "loading"}>
          {submitStatus === "loading" ? "Submitting…" : "Submit listing"}
        </button>
      </form>
    </div>
  );
}
