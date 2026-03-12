/**
 * @file PropertyMap.tsx
 * @module search
 * @description Map view for property listings; displays markers for properties with lat/lng using Leaflet/OSM.
 * @author BharatERP
 * @created 2025-03-13
 */

"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const INDIA_CENTER: [number, number] = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

export interface PropertyMapItem {
  id: string;
  title: string;
  location: string;
  price: number;
  latitude: number;
  longitude: number;
}

function FitBounds({ items }: { items: PropertyMapItem[] }) {
  const map = useMap();
  const bounds = useMemo(() => {
    if (items.length === 0) return null;
    return L.latLngBounds(items.map((p) => [p.latitude, p.longitude]));
  }, [items]);
  useEffect(() => {
    if (bounds && items.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [map, bounds, items.length]);
  return null;
}

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface PropertyMapProps {
  properties: PropertyMapItem[];
  className?: string;
}

export function PropertyMap({ properties, className = "" }: PropertyMapProps) {
  const withCoords = useMemo(
    () =>
      properties.filter(
        (p): p is PropertyMapItem =>
          p.latitude != null && p.longitude != null && Number.isFinite(p.latitude) && Number.isFinite(p.longitude)
      ),
    [properties]
  );

  if (withCoords.length === 0) {
    return (
      <div
        className={className}
        style={{
          minHeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-subtle, #1a1a2e)",
          borderRadius: 12,
          color: "var(--text-muted)",
        }}
      >
        No properties with location data to show on map. Add coordinates when posting or enable geocoding.
      </div>
    );
  }

  const priceStr = (p: PropertyMapItem) =>
    p.price >= 1_00_00_000
      ? `₹${(p.price / 1_00_00_000).toFixed(2)} Cr`
      : `₹${(p.price / 1_00_000).toFixed(0)} L`;

  return (
    <div className={className} style={{ minHeight: 450, borderRadius: 12, overflow: "hidden" }}>
      <MapContainer
        center={INDIA_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: "100%", minHeight: 450 }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds items={withCoords} />
        {withCoords.map((p) => (
          <Marker
            key={p.id}
            position={[p.latitude, p.longitude]}
            icon={markerIcon}
          >
            <Popup>
              <div style={{ minWidth: 180 }}>
                <Link
                  href={`/property/${p.id}`}
                  style={{ fontWeight: 600, color: "var(--teal)", textDecoration: "none" }}
                >
                  {p.title}
                </Link>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                  {p.location}
                </div>
                <div style={{ marginTop: 4, fontWeight: 600 }}>{priceStr(p)}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
