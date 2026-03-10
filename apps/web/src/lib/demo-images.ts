/**
 * @file demo-images.ts
 * @module lib
 * @description Central demo image URLs (Unsplash) for landing, search, and property detail
 * @author BharatERP
 * @created 2025-03-11
 */

const U = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80`;

/** Known-good Unsplash IDs (real estate, city, people) so demo always shows images */
export const DEMO_IMAGES = {
  cities: {
    Mumbai: U("1600596542815-ffad4c1539a9"),
    Bangalore: U("1600585154340-be6161a56a0c"),
    "Delhi NCR": U("1600566753190-17f0baa2a6a3"),
    Hyderabad: U("1600602642379-5bca7a0f2b19"),
    Pune: U("1600573472550-8098d35cbfb7"),
    Chennai: U("1600585152220-90363fe7e115"),
  },
  /** Testimonial avatar URLs (portrait style) */
  testimonials: [
    U("1494790108377-1cbc5b5e93d0", 120),
    U("1534524787306-8a7708e2c3cc", 120),
    U("1438761681033-6461fad0d8a0", 120),
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
