/**
 * @file PostPropertyForm.tsx
 * @module post-property
 * @description Post property form with react-hook-form and Zod validation; submits via GraphQL createProperty.
 * @author BharatERP
 * @created 2025-03-10
 */

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useRef } from "react";
import { gqlCreateProperty } from "@/lib/graphql-client";
import { uploadImage } from "@/lib/upload-api";
import { logger } from "@/lib/logger";
import { useAuth } from "@/components/providers/AuthProvider";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const postPropertySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title too long"),
  listingFor: z.enum(["sell", "rent"], { required_error: "Select listing type" }),
  propertyType: z.enum(["apartment", "villa", "plot", "builder-floor", "office"], { required_error: "Select property type" }),
  address: z.string().min(5, "Address must be at least 5 characters").max(500, "Address too long"),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
});

export type PostPropertyFormValues = z.infer<typeof postPropertySchema>;

export default function PostPropertyForm() {
  const { token, setOpenLoginModal } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imageError, setImageError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostPropertyFormValues>({
    resolver: zodResolver(postPropertySchema),
    defaultValues: { title: "", listingFor: "sell", propertyType: "apartment", address: "", price: 0 },
  });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError("");
    const files = Array.from(e.target.files ?? []);
    const invalid = files.find(
      (f) => !ALLOWED_TYPES.includes(f.type) || f.size > MAX_SIZE_BYTES
    );
    if (invalid) {
      setImageError(`Only JPEG, PNG, WebP up to ${MAX_SIZE_MB} MB each.`);
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setSelectedFiles(files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const graphqlUrl = typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_GRAPHQL_HTTP ?? (process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/graphql` : ""))
    : "";

  const onSubmit = async (data: PostPropertyFormValues) => {
    if (!graphqlUrl) {
      setErrorMessage("Backend not configured. Set NEXT_PUBLIC_GRAPHQL_HTTP or NEXT_PUBLIC_API_URL to submit listings.");
      setSubmitStatus("error");
      return;
    }
    setSubmitStatus("loading");
    setErrorMessage("");
    setImageError("");
    logger.debug("PostPropertyForm:submit", data);

    try {
      let coverImageUrl: string | undefined;
      let imageUrls: string[] | undefined;
      if (selectedFiles.length > 0 && process.env.NEXT_PUBLIC_API_URL) {
        const urls: string[] = [];
        for (const file of selectedFiles) {
          const { url } = await uploadImage(file);
          urls.push(url);
        }
        coverImageUrl = urls[0];
        if (urls.length > 1) imageUrls = urls;
      }
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const result = await gqlCreateProperty(
        {
          title: data.title,
          location: data.address,
          price: Number(data.price),
          type: data.propertyType,
          listingFor: data.listingFor,
          coverImageUrl,
          imageUrls: imageUrls ?? (coverImageUrl ? [coverImageUrl] : undefined),
        },
        headers,
      );
      setCreatedId(result.id);
      logger.info("PostPropertyForm:submit success", { id: result.id });
      setSubmitStatus("success");
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Something went wrong. Please try again.";
      const isAuthError = /Unauthorized|401|authorization|invalid.*token/i.test(raw);
      setErrorMessage(isAuthError ? "Sign in to post a listing." : raw);
      if (isAuthError) setOpenLoginModal(true);
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
          Your property has been created. You can view it in search.
        </p>
      </div>
    );
  }

  return (
    <div className="form-section reveal">
      {!graphqlUrl && (
        <div style={{ padding: 12, marginBottom: 16, background: "var(--coral)", color: "var(--night)", borderRadius: 8 }}>
          Backend not configured. Set NEXT_PUBLIC_GRAPHQL_HTTP or NEXT_PUBLIC_API_URL to submit listings.
        </div>
      )}
      <h3>🏠 Step 1 — Basic Details</h3>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-field" style={{ marginBottom: 16 }}>
          <label className="label" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            type="text"
            className="input"
            placeholder="e.g. 2BHK Apartment in Koramangala"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? "title-error" : undefined}
            {...register("title")}
          />
          {errors.title && (
            <span id="title-error" style={{ fontSize: 12, color: "var(--coral)", marginTop: 4, display: "block" }}>
              {errors.title.message}
            </span>
          )}
        </div>
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
        <div className="form-field" style={{ marginBottom: 16 }}>
          <label className="label" htmlFor="address">
            Address / Location
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
        <div className="form-field" style={{ marginBottom: 20 }}>
          <label className="label" htmlFor="price">
            Price (₹)
          </label>
          <input
            id="price"
            type="number"
            min={0}
            step={1000}
            className="input"
            placeholder="0"
            aria-invalid={!!errors.price}
            aria-describedby={errors.price ? "price-error" : undefined}
            {...register("price")}
          />
          {errors.price && (
            <span id="price-error" style={{ fontSize: 12, color: "var(--coral)", marginTop: 4, display: "block" }}>
              {errors.price.message}
            </span>
          )}
        </div>
        <div className="form-field" style={{ marginBottom: 20 }}>
          <label className="label">Images (optional)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            multiple
            onChange={onFileChange}
            style={{ display: "block", marginTop: 6, fontSize: 14 }}
            aria-describedby={imageError ? "image-error" : undefined}
          />
          {imageError && (
            <span id="image-error" style={{ fontSize: 12, color: "var(--coral)", marginTop: 4, display: "block" }}>
              {imageError}
            </span>
          )}
          {selectedFiles.length > 0 && (
            <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {selectedFiles.map((f, i) => (
                <span key={i} style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {f.name} ({(f.size / 1024).toFixed(1)} KB){" "}
                  <button type="button" onClick={() => removeFile(i)} style={{ marginLeft: 4, cursor: "pointer" }} aria-label="Remove">×</button>
                </span>
              ))}
            </div>
          )}
        </div>
        {errorMessage && (
          <p style={{ fontSize: 13, color: "var(--coral)", marginBottom: 16 }} role="alert">
            {errorMessage}
          </p>
        )}
        <button type="submit" className="btn-primary" style={{ padding: 13, borderRadius: 12 }} disabled={submitStatus === "loading" || !graphqlUrl} aria-disabled={submitStatus === "loading" || !graphqlUrl}>
          {submitStatus === "loading" ? "Submitting…" : !graphqlUrl ? "Backend not configured" : "Submit listing"}
        </button>
      </form>
    </div>
  );
}
