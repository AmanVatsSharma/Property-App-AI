/**
 * @file page.tsx
 * @module app/property/[id]
 * @description Dynamic property detail page; fetches by id/slug
 * @author BharatERP
 * @created 2025-03-10
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPropertyById } from "@/lib/property-api";
import { PropertyImage } from "@/components/ui/PropertyImage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property) return { title: "Property — UrbanNest.ai" };
  return {
    title: `${property.title} — UrbanNest.ai`,
    description: `${property.address} · ${property.price}`,
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property) notFound();

  const locality = property.address.split(",")[0]?.trim() ?? "Search";

  return (
    <div className="page-wrap">
      <div className="detail-top-wrap" style={{ padding: "20px 52px 0", background: "var(--dark)", borderBottom: "1px solid var(--border)" }}>
        <div className="breadcrumb">
          <Link href="/">Home</Link><span>/</span>
          <Link href="/search">Buy in Gurgaon</Link><span>/</span>
          <Link href="/search">{locality}</Link><span>/</span>
          <span style={{ color: "var(--text-muted)" }}>{property.title.split("—")[0]?.trim() ?? property.title}</span>
        </div>
        <div className="gallery">
          <div className="gallery-main">
            <PropertyImage
              src={property.coverImage}
              alt={property.title}
              className="gallery-main-img"
              sizes="(max-width: 768px) 100vw, 66vw"
              placeholderGradient="linear-gradient(135deg,#132238,#1e3a5f,#0d1e3a)"
            />
            <div className="gallery-actions">
              <button type="button" className="gal-btn">📸 All Photos (24)</button>
              <button type="button" className="gal-btn">🎬 Video Tour</button>
            </div>
          </div>
          <div className="gallery-sub">
            <PropertyImage
              src={property.galleryImages?.[0]}
              alt={`${property.title} — view 2`}
              className="gallery-sub-img"
              sizes="(max-width: 768px) 50vw, 33vw"
              placeholderGradient="linear-gradient(135deg,#1a3020,#243a2a)"
            />
          </div>
          <div className="gallery-sub">
            <PropertyImage
              src={property.galleryImages?.[1]}
              alt={`${property.title} — view 3`}
              className="gallery-sub-img"
              sizes="(max-width: 768px) 50vw, 33vw"
              placeholderGradient="linear-gradient(135deg,#1a2030,#242a40)"
            />
          </div>
        </div>
      </div>
      <div className="detail-layout">
        <div>
          <div className="prop-header">
            <div className="prop-title-row">
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  {property.badges.map((b, i) => (
                    <span key={i} className={`badge ${b.variant}`}>{b.label}</span>
                  ))}
                </div>
                <div className="prop-main-title">{property.title}</div>
                <div className="prop-address">📍 {property.address}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="prop-price-big">{property.price}</div>
                <span className="prop-price-per">{property.pricePerSqft}</span>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button type="button" className="btn-ghost-sm">♡ Save</button>
                  <button type="button" className="btn-ghost-sm">⤴ Share</button>
                </div>
              </div>
            </div>
            <div className="prop-quick-specs">
              {property.quickSpecs.map((q) => (
                <div key={q.label} className="qs-item">
                  <div className="qs-icon">{q.icon}</div>
                  <div className="qs-val">{q.val}</div>
                  <div className="qs-label">{q.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="detail-tabs">
            <div className="dtab active">Overview</div>
            <div className="dtab">Amenities</div>
            <div className="dtab">Price History</div>
            <div className="dtab">Neighbourhood</div>
          </div>
          <div className="overview-grid">
            {property.overview.map((o) => (
              <div key={o.label} className="ov-item">
                <div className="ov-label">{o.label}</div>
                <div className="ov-val" style={o.green ? { color: "var(--green)" } : undefined}>{o.val}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="detail-sidebar">
          <div className="contact-card">
            <h4>Contact Owner</h4>
            <p>Get in touch for site visits and negotiations</p>
            <button type="button" className="call-btn" style={{ width: "100%", marginBottom: 8 }}>📞 Call Now</button>
            <button type="button" className="whatsapp-btn" style={{ width: "100%" }}>WhatsApp</button>
          </div>
          <div className="ai-score-card">
            <div className="big-score-row">
              <div className="score-circle">{property.aiScore}</div>
              <div><strong style={{ color: "var(--teal)" }}>AI Score: Excellent</strong><br /><span style={{ fontSize: 12, color: "var(--text-muted)" }}>{property.aiScoreLabel}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
