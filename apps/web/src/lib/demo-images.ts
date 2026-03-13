/**
 * @file demo-images.ts
 * @module lib
 * @description Image URLs for marketing/landing and fallback when a real property has no image. Not used to drive listing data.
 * @author BharatERP
 * @created 2025-03-11
 */

const U = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80`;

/** Marketing/landing and fallback only. Use defaultPropertyCover when API returns a property with no cover image. */
export const DEMO_IMAGES = {
  /** Fallback when a real property has no coverImageUrl (no mock listing data). */
  defaultPropertyCover: U("1600596542815-ffad4c1539a9"),
  cities: {
    Mumbai: U("1600596542815-ffad4c1539a9"),
    Bangalore: U("1600585154340-be6161a56a0c"),
    "Delhi NCR": U("1600566753190-17f0baa2a6a3"),
    Hyderabad: U("1600602642379-5bca7a0f2b19"),
    Pune: U("1600573472550-8098d35cbfb7"),
    Chennai: U("1600585152220-90363fe7e115"),
  },
  /** Testimonial avatar URLs (reuse property thumbs so demo always loads) */
  testimonials: [
    U("1600596542815-ffad4c1539a9", 120),
    U("1600566753190-17f0baa2a6a3", 120),
    U("1600585154340-be6161a56a0c", 120),
  ],
  properties: {
    "sobha-city-vista": {
      cover: U("1600596542815-ffad4c1539a9"),
      gallery: [
        U("1600585154340-be6161a56a0c"),
        U("1600602642379-5bca7a0f2b19"),
      ],
    },
    "dlf-mypad": {
      cover: U("1600566753190-17f0baa2a6a3"),
      gallery: [
        U("1600573472550-8098d35cbfb7"),
        U("1600585154520-5d685b793eec"),
      ],
    },
    "m3m-golf-hills": {
      cover: U("1600585154340-be6161a56a0c"),
      gallery: [
        U("1600566753086-00f18fb6b3ea"),
        U("1600585152220-90363fe7e115"),
      ],
    },
    "prestige-sunrise-park": {
      cover: U("1600602642379-5bca7a0f2b19"),
      gallery: [
        U("1600573472550-8098d35cbfb7"),
        U("1600566753190-17f0baa2a6a3"),
      ],
    },
    "brigade-cornerstone-utopia": {
      cover: U("1600566753086-00f18fb6b3ea"),
      gallery: [
        U("1600585154520-5d685b793eec"),
        U("1600596542815-ffad4c1539a9"),
      ],
    },
    "godrej-meridian": {
      cover: U("1600585152220-90363fe7e115"),
      gallery: [
        U("1600596542815-ffad4c1539a9"),
        U("1600585154340-be6161a56a0c"),
      ],
    },
  },
} as const;

export type CityName = keyof typeof DEMO_IMAGES.cities;
export type PropertyId = keyof typeof DEMO_IMAGES.properties;
