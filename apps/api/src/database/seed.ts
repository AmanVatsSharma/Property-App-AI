/**
 * File:        apps/api/src/database/seed.ts
 * Module:      database · Dev Seed
 * Purpose:     Populates the dev SQLite (or Postgres) database with realistic Indian
 *              real-estate data — users, areas, properties, favorites, enquiries, and
 *              notifications — so every web UI flow can be exercised without live data.
 *
 * Exports:     none (runnable script via ts-node)
 *
 * Depends on:
 *   - typeorm           — DataSource, entity repositories
 *   - jsonwebtoken      — sign dev JWT tokens (same format as NestJS JwtService)
 *   - uuid              — UUID v4 generation
 *   - better-sqlite3    — SQLite driver (used when DB_TYPE=sqlite)
 *   - pg                — PostgreSQL driver (used when DB_TYPE=postgres)
 *
 * Side-effects:
 *   - Writes rows to the dev database (idempotent: skips if rows already exist)
 *   - Prints credentials and JWT tokens to stdout on success
 *
 * Key invariants:
 *   - Reads DB_TYPE / DB_PATH / DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME from env
 *   - JWT_SECRET defaults to 'default-secret-min-16-chars' — same fallback as auth.service.ts
 *   - Idempotent: checks user count before inserting; run repeatedly safely
 *   - Dev tokens are printed to stdout; NEVER log to a persistent file in prod
 *
 * Usage:
 *   DB_TYPE=sqlite npm run seed:dev
 *   DB_TYPE=postgres DB_HOST=localhost DB_PORT=5433 npm run seed:dev
 *
 * Read order:
 *   1. buildDataSource()  — creates TypeORM DataSource based on env
 *   2. seed()             — orchestrates all insert operations
 *   3. printSummary()     — prints credentials + JWT tokens
 *
 * Author:       UrbanNest.ai team
 * Last-updated: 2026-05-07
 */

import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from apps/api directory
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as jwt from 'jsonwebtoken';

// Entity imports via relative path (no @api/* aliases needed at runtime here)
import { User, UserRole } from '../modules/user/entities/user.entity';
import { Property } from '../modules/property/entities/property.entity';
import { Area } from '../modules/area/entities/area.entity';
import { Favorite } from '../modules/favorite/entities/favorite.entity';
import { Enquiry } from '../modules/enquiry/entities/enquiry.entity';
import { Notification } from '../modules/notification/entities/notification.entity';

// ─── Config ──────────────────────────────────────────────────────────────────

const DB_TYPE = (process.env.DB_TYPE ?? 'sqlite') as 'sqlite' | 'postgres';
const DB_PATH = process.env.DB_PATH ?? './dev.sqlite';
const JWT_SECRET = process.env.JWT_SECRET ?? 'default-secret-min-16-chars';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

const ENTITIES = [User, Property, Area, Favorite, Enquiry, Notification];

// ─── DataSource ───────────────────────────────────────────────────────────────

function buildDataSource(): DataSource {
  if (DB_TYPE === 'sqlite') {
    return new DataSource({
      type: 'better-sqlite3',
      database: DB_PATH,
      entities: ENTITIES,
      synchronize: true,
    });
  }
  return new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'property_app',
    entities: ENTITIES,
    synchronize: false,
  });
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const DEV_USERS: Array<Partial<User>> = [
  { id: uuidv4(), phone: '9999999999', displayName: 'Admin User', role: UserRole.ADMIN },
  { id: uuidv4(), phone: '9876543210', displayName: 'Ravi Kumar (Broker)', role: UserRole.BROKER },
  { id: uuidv4(), phone: '9123456789', displayName: 'Priya Sharma', role: UserRole.USER },
];

const DEV_AREAS: Array<Partial<Area>> = [
  {
    id: uuidv4(), locality: 'Koramangala', city: 'Bengaluru',
    localityNormalized: 'koramangala', cityNormalized: 'bengaluru',
    livabilityScore: 88, priceTrendPctAnnual: 9.2, connectivityScore: 85,
    schoolsScore: 82, safetyScore: 80,
    amenitiesSummary: 'Vibrant tech hub with excellent cafes, co-working spaces, multiple hospitals, and direct metro connectivity. 5-min walk to metro station.',
    dataSource: 'manual', latitude: 12.9352, longitude: 77.6245,
    lastAssessedAt: new Date('2026-01-15'),
  },
  {
    id: uuidv4(), locality: 'Bandra West', city: 'Mumbai',
    localityNormalized: 'bandra west', cityNormalized: 'mumbai',
    livabilityScore: 84, priceTrendPctAnnual: 7.8, connectivityScore: 90,
    schoolsScore: 88, safetyScore: 76,
    amenitiesSummary: 'Premium sea-facing suburb with top schools, fine dining, boutique shopping, and the iconic Bandra-Worli Sea Link minutes away. High livability.',
    dataSource: 'manual', latitude: 19.0596, longitude: 72.8295,
    lastAssessedAt: new Date('2026-01-10'),
  },
  {
    id: uuidv4(), locality: 'Sector 56', city: 'Gurgaon',
    localityNormalized: 'sector 56', cityNormalized: 'gurgaon',
    livabilityScore: 72, priceTrendPctAnnual: 6.5, connectivityScore: 74,
    schoolsScore: 78, safetyScore: 75,
    amenitiesSummary: 'Well-planned sector with DLF amenities, golf course proximity, and good highway access. Under-served by metro but well-connected by road.',
    dataSource: 'manual', latitude: 28.4089, longitude: 77.0757,
    lastAssessedAt: new Date('2026-01-20'),
  },
];

function buildProperties(userIds: string[], areaIds: string[]): Array<Partial<Property>> {
  const [adminId, brokerId] = userIds;
  const [koraArea, bandraArea, gurArea] = areaIds;

  return [
    {
      id: uuidv4(), title: '3 BHK Premium Apartment in Koramangala 4th Block',
      location: 'Koramangala 4th Block, Bengaluru', areaId: koraArea,
      locality: 'Koramangala', city: 'Bengaluru',
      latitude: 12.9352, longitude: 77.6245,
      price: 18500000, type: 'apartment', bedrooms: 3, bathrooms: 3,
      areaSqft: 1650, status: 'available', listingFor: 'buy',
      specs: ['Modular kitchen', 'Premium fixtures', 'Covered parking x2', 'Club access', '24×7 security'],
      aiScore: 88, aiTip: 'Top 10% in locality. Metro access + school zone proximity drive above-average appreciation.',
      coverImageUrl: 'https://picsum.photos/seed/kora3bhk/800/600',
      imageUrls: ['https://picsum.photos/seed/kora3bhk/800/600', 'https://picsum.photos/seed/kora3bhk2/800/600', 'https://picsum.photos/seed/kora3bhk3/800/600'],
      nearbyAmenities: ['Metro: 0.6 km', 'Apollo Hospital: 1.2 km', 'Forum Mall: 2.1 km', 'ITSM School: 1.5 km'],
      isVerified: true, isFreeListing: false, viewCount: 342, priceDropPercent: null,
      createdByUserId: brokerId,
    },
    {
      id: uuidv4(), title: '2 BHK Modern Flat — Koramangala 5th Block',
      location: 'Koramangala 5th Block, Bengaluru', areaId: koraArea,
      locality: 'Koramangala', city: 'Bengaluru',
      latitude: 12.9349, longitude: 77.6189,
      price: 42000, type: 'apartment', bedrooms: 2, bathrooms: 2,
      areaSqft: 1150, status: 'available', listingFor: 'rent',
      specs: ['Semi-furnished', 'Gym access', 'Covered parking', 'Lift'],
      aiScore: 84, aiTip: 'Strong rental demand. 3-min walk to metro makes this ideal for IT professionals.',
      coverImageUrl: 'https://picsum.photos/seed/kora2bhkrent/800/600',
      imageUrls: ['https://picsum.photos/seed/kora2bhkrent/800/600', 'https://picsum.photos/seed/kora2bhkrent2/800/600'],
      nearbyAmenities: ['Metro: 0.3 km', 'Supermarket: 0.4 km', 'Office park: 1.8 km'],
      isVerified: true, isFreeListing: true, viewCount: 218, priceDropPercent: null,
      createdByUserId: brokerId,
    },
    {
      id: uuidv4(), title: 'Luxe 4 BHK Independent Villa with Private Pool',
      location: 'Bandra West, Mumbai', areaId: bandraArea,
      locality: 'Bandra West', city: 'Mumbai',
      latitude: 19.0596, longitude: 72.8295,
      price: 85000000, type: 'villa', bedrooms: 4, bathrooms: 4,
      areaSqft: 3500, status: 'available', listingFor: 'buy',
      specs: ['Private pool', 'Home theatre', 'Landscaped garden', 'Smart home', '3-car garage', 'Staff quarters'],
      aiScore: 91, aiTip: 'Rare sea-view villa. Bandra West supply constrained — long-term capital appreciation outlook: strong.',
      coverImageUrl: 'https://picsum.photos/seed/bandravilla/800/600',
      imageUrls: ['https://picsum.photos/seed/bandravilla/800/600', 'https://picsum.photos/seed/bandravilla2/800/600', 'https://picsum.photos/seed/bandravilla3/800/600', 'https://picsum.photos/seed/bandravilla4/800/600'],
      nearbyAmenities: ['Sea Link: 1.2 km', 'Lilavati Hospital: 0.8 km', 'Linking Road: 0.9 km', 'St Andrews School: 0.6 km'],
      isVerified: true, isFreeListing: false, viewCount: 1240, priceDropPercent: 5,
      createdByUserId: adminId,
    },
    {
      id: uuidv4(), title: '3 BHK Sea-View Apartment — Bandra',
      location: 'Bandra, Mumbai', areaId: bandraArea,
      locality: 'Bandra West', city: 'Mumbai',
      latitude: 19.0550, longitude: 72.8310,
      price: 32000000, type: 'apartment', bedrooms: 3, bathrooms: 2,
      areaSqft: 1800, status: 'available', listingFor: 'buy',
      specs: ['Partial sea view', 'Modular kitchen', 'Power backup', '2 parking', 'Clubhouse', 'Swimming pool'],
      aiScore: 86, aiTip: 'Well-priced for the micro-market. Sea-view commands 18% premium vs street-facing units.',
      coverImageUrl: 'https://picsum.photos/seed/bandraseaview/800/600',
      imageUrls: ['https://picsum.photos/seed/bandraseaview/800/600', 'https://picsum.photos/seed/bandraseaview2/800/600'],
      nearbyAmenities: ['Beach: 0.5 km', 'Metro: 1.1 km', 'Restaurant row: 0.7 km'],
      isVerified: true, isFreeListing: false, viewCount: 895, priceDropPercent: null,
      createdByUserId: brokerId,
    },
    {
      id: uuidv4(), title: '1 BHK Studio — Bandra East near Kurla Station',
      location: 'Bandra East, Mumbai', areaId: bandraArea,
      locality: 'Bandra West', city: 'Mumbai',
      latitude: 19.0630, longitude: 72.8487,
      price: 28000, type: 'apartment', bedrooms: 1, bathrooms: 1,
      areaSqft: 600, status: 'available', listingFor: 'rent',
      specs: ['Fully furnished', 'High-speed WiFi', 'AC', 'Washing machine'],
      aiScore: 77, aiTip: 'Good entry-point rental. Proximity to BKC makes it a reliable earner at sub-30k range.',
      coverImageUrl: 'https://picsum.photos/seed/bandra1bhk/800/600',
      imageUrls: ['https://picsum.photos/seed/bandra1bhk/800/600'],
      nearbyAmenities: ['Kurla Station: 1.4 km', 'BKC: 2.0 km', 'Phoenix Mall: 1.9 km'],
      isVerified: false, isFreeListing: true, viewCount: 443, priceDropPercent: null,
      createdByUserId: brokerId,
    },
    {
      id: uuidv4(), title: 'Commercial Office Space — Gurgaon Sector 56',
      location: 'Sector 56, Gurgaon', areaId: gurArea,
      locality: 'Sector 56', city: 'Gurgaon',
      latitude: 28.4089, longitude: 77.0757,
      price: 21000000, type: 'commercial', bedrooms: 0, bathrooms: 2,
      areaSqft: 2200, status: 'available', listingFor: 'buy',
      specs: ['Open floor plan', 'Glass facade', 'Server room', 'Cafeteria', '10 parking slots', 'Generator backup'],
      aiScore: 74, aiTip: 'Grade A office space in Gurgaon corridor. Suitable for IT/ITES mid-size team (50–120 seats).',
      coverImageUrl: 'https://picsum.photos/seed/gurgaoncommercial/800/600',
      imageUrls: ['https://picsum.photos/seed/gurgaoncommercial/800/600', 'https://picsum.photos/seed/gurgaoncommercial2/800/600'],
      nearbyAmenities: ['IFFCO Chowk Metro: 3.5 km', 'Golf Course Road: 1.8 km', 'Rapid Metro: 1.2 km'],
      isVerified: true, isFreeListing: false, viewCount: 267, priceDropPercent: null,
      createdByUserId: adminId,
    },
    {
      id: uuidv4(), title: '2 BHK Builder Floor — DLF Phase 3, Gurgaon',
      location: 'DLF Phase 3, Gurgaon', areaId: gurArea,
      locality: 'Sector 56', city: 'Gurgaon',
      latitude: 28.4933, longitude: 77.0862,
      price: 7800000, type: 'apartment', bedrooms: 2, bathrooms: 2,
      areaSqft: 1050, status: 'available', listingFor: 'buy',
      specs: ['Independent entry', 'Terrace garden', 'Covered parking', 'Modular kitchen', 'Marble flooring'],
      aiScore: 70, aiTip: 'Builder floors offer privacy advantage over societies. This one has price drop — negotiate to ₹72L.',
      coverImageUrl: 'https://picsum.photos/seed/gurgaon2bhk/800/600',
      imageUrls: ['https://picsum.photos/seed/gurgaon2bhk/800/600', 'https://picsum.photos/seed/gurgaon2bhk2/800/600'],
      nearbyAmenities: ['DLF Mega Mall: 1.6 km', 'Artemis Hospital: 2.4 km', 'Cyber Hub: 3.0 km'],
      isVerified: false, isFreeListing: true, viewCount: 156, priceDropPercent: 8,
      createdByUserId: brokerId,
    },
    {
      id: uuidv4(), title: 'New Project: Orchid Heights — 2 BHK, Koramangala',
      location: 'Koramangala, Bengaluru', areaId: koraArea,
      locality: 'Koramangala', city: 'Bengaluru',
      latitude: 12.9360, longitude: 77.6270,
      price: 9500000, type: 'apartment', bedrooms: 2, bathrooms: 2,
      areaSqft: 1200, status: 'under_construction', listingFor: 'buy',
      specs: ['RERA registered: KA/01/BuildingPlan/2025/001234', 'Completion: Dec 2027', 'Sky garden on 20F', 'EV charging points', 'Rainwater harvesting', '100% power backup'],
      aiScore: 85, aiTip: 'Under-construction at competitive pricing. Area appreciation historically 9%+ annually.',
      coverImageUrl: 'https://picsum.photos/seed/orchidheights/800/600',
      imageUrls: ['https://picsum.photos/seed/orchidheights/800/600', 'https://picsum.photos/seed/orchidheights2/800/600'],
      nearbyAmenities: ['Metro: 0.5 km', 'Proposed park: 0.3 km', 'Tech park: 2.2 km'],
      isVerified: true, isFreeListing: false, viewCount: 678, priceDropPercent: null,
      createdByUserId: brokerId,
    },
    {
      id: uuidv4(), title: '3 BHK Independent House with Garden',
      location: 'Sohna Road, Gurgaon', areaId: gurArea,
      locality: 'Sector 56', city: 'Gurgaon',
      latitude: 28.3804, longitude: 77.0555,
      price: 14000000, type: 'house', bedrooms: 3, bathrooms: 3,
      areaSqft: 2100, status: 'available', listingFor: 'buy',
      specs: ['200 sq yd plot', 'Landscaped garden', 'Servant quarters', 'Solar panels', '2 parking', 'Modular kitchen'],
      aiScore: 73, aiTip: 'Independent houses on Sohna Road offer good value vs Sector-facing properties. ROI from rental: ~4%.',
      coverImageUrl: 'https://picsum.photos/seed/gurhouse/800/600',
      imageUrls: ['https://picsum.photos/seed/gurhouse/800/600'],
      nearbyAmenities: ['St. Xavier School: 1.5 km', 'Medanta Hospital: 5.2 km', 'Southern Peripheral Road: 1.1 km'],
      isVerified: false, isFreeListing: true, viewCount: 204, priceDropPercent: null,
      createdByUserId: adminId,
    },
    {
      id: uuidv4(), title: '1 BHK Cozy Apartment near Silk Board',
      location: 'BTM Layout, Bengaluru', areaId: koraArea,
      locality: 'Koramangala', city: 'Bengaluru',
      latitude: 12.9166, longitude: 77.6101,
      price: 18000, type: 'apartment', bedrooms: 1, bathrooms: 1,
      areaSqft: 550, status: 'available', listingFor: 'rent',
      specs: ['Semi-furnished', 'Security guard', 'CCTV', '24h water'],
      aiScore: 79, aiTip: 'Excellent connectivity for Koramangala/Electronic City commuters. Occupancy rate near 97% in this micro-market.',
      coverImageUrl: 'https://picsum.photos/seed/btm1bhk/800/600',
      imageUrls: ['https://picsum.photos/seed/btm1bhk/800/600'],
      nearbyAmenities: ['Metro (under construction): 0.9 km', 'Supermarket: 0.2 km', 'Bus stop: 0.1 km'],
      isVerified: false, isFreeListing: true, viewCount: 530, priceDropPercent: null,
      createdByUserId: brokerId,
    },
    {
      id: uuidv4(), title: 'Penthouse with Private Terrace — Bandra',
      location: 'Bandra West, Mumbai', areaId: bandraArea,
      locality: 'Bandra West', city: 'Mumbai',
      latitude: 19.0612, longitude: 72.8287,
      price: 120000000, type: 'apartment', bedrooms: 5, bathrooms: 4,
      areaSqft: 4800, status: 'available', listingFor: 'buy',
      specs: ['Private rooftop terrace (1000 sqft)', 'Panoramic sea view', '360° city view', 'Private lift', 'Jacuzzi', 'Home automation'],
      aiScore: 95, aiTip: 'Ultra-premium inventory. Less than 5 such units in Mumbai market. Asset class, not just a home.',
      coverImageUrl: 'https://picsum.photos/seed/bandrapenthouse/800/600',
      imageUrls: ['https://picsum.photos/seed/bandrapenthouse/800/600', 'https://picsum.photos/seed/bandrapenthouse2/800/600', 'https://picsum.photos/seed/bandrapenthouse3/800/600'],
      nearbyAmenities: ['Arabian Sea: 0.3 km', 'Carter Road: 0.5 km', 'Bandstand: 0.8 km'],
      isVerified: true, isFreeListing: false, viewCount: 3421, priceDropPercent: null,
      createdByUserId: adminId,
    },
    {
      id: uuidv4(), title: '2 BHK Society Flat — Sector 54, Gurgaon',
      location: 'Sector 54, Gurgaon', areaId: gurArea,
      locality: 'Sector 56', city: 'Gurgaon',
      latitude: 28.4384, longitude: 77.0977,
      price: 6200000, type: 'apartment', bedrooms: 2, bathrooms: 2,
      areaSqft: 985, status: 'available', listingFor: 'buy',
      specs: ['Club membership included', 'Power backup', 'Covered parking', 'Intercom', 'Kids play area'],
      aiScore: 68, aiTip: 'Decent society with price drop — original ask ₹70L. Good opportunity for first-time buyers.',
      coverImageUrl: 'https://picsum.photos/seed/sec54flat/800/600',
      imageUrls: ['https://picsum.photos/seed/sec54flat/800/600'],
      nearbyAmenities: ['Golf Course Extension: 1.2 km', 'IFFCO Chowk: 4.0 km', 'DLF Emporio: 5.5 km'],
      isVerified: false, isFreeListing: true, viewCount: 187, priceDropPercent: 12,
      createdByUserId: brokerId,
    },
    {
      id: uuidv4(), title: 'Retail Shop in Commercial Complex — Koramangala',
      location: 'Koramangala 1st Block, Bengaluru', areaId: koraArea,
      locality: 'Koramangala', city: 'Bengaluru',
      latitude: 12.9358, longitude: 77.6131,
      price: 5500000, type: 'commercial', bedrooms: 0, bathrooms: 1,
      areaSqft: 450, status: 'available', listingFor: 'buy',
      specs: ['Ground floor', 'High street visibility', 'Double height', '3-phase power', 'Water connection'],
      aiScore: 81, aiTip: 'Prime retail on one of Bengaluru\'s highest-footfall streets. Rental yield potential: 6–8%.',
      coverImageUrl: 'https://picsum.photos/seed/koraretail/800/600',
      imageUrls: ['https://picsum.photos/seed/koraretail/800/600'],
      nearbyAmenities: ['Metro: 0.4 km', 'Foot traffic: high', 'Parking lot: 0.1 km'],
      isVerified: true, isFreeListing: false, viewCount: 392, priceDropPercent: null,
      createdByUserId: adminId,
    },
    {
      id: uuidv4(), title: '3 BHK Spacious Flat — Bandra for Rent',
      location: 'Bandra West, Mumbai', areaId: bandraArea,
      locality: 'Bandra West', city: 'Mumbai',
      latitude: 19.0580, longitude: 72.8315,
      price: 55000, type: 'apartment', bedrooms: 3, bathrooms: 2,
      areaSqft: 1600, status: 'available', listingFor: 'rent',
      specs: ['Fully furnished', '2 car parking', 'Kids play area', 'Gym', '24h security', 'Gas pipeline'],
      aiScore: 82, aiTip: 'Mid-luxury rental in the most sought-after Mumbai suburb. Consistently occupied within weeks of listing.',
      coverImageUrl: 'https://picsum.photos/seed/bandrarent3bhk/800/600',
      imageUrls: ['https://picsum.photos/seed/bandrarent3bhk/800/600', 'https://picsum.photos/seed/bandrarent3bhk2/800/600'],
      nearbyAmenities: ['Metro: 0.7 km', 'Bandra Fort: 1.5 km', 'Lilavati Hospital: 0.6 km'],
      isVerified: true, isFreeListing: false, viewCount: 712, priceDropPercent: null,
      createdByUserId: brokerId,
    },
    {
      id: uuidv4(), title: 'Studio Apartment near Rapid Metro — Gurgaon',
      location: 'Sector 56, Gurgaon', areaId: gurArea,
      locality: 'Sector 56', city: 'Gurgaon',
      latitude: 28.4102, longitude: 77.0802,
      price: 15000, type: 'apartment', bedrooms: 1, bathrooms: 1,
      areaSqft: 480, status: 'available', listingFor: 'rent',
      specs: ['Fully furnished', 'AC', 'Washing machine', 'WiFi included', 'CCTV lobby'],
      aiScore: 72, aiTip: 'Affordable option for single working professionals. Rapid Metro connectivity makes this better-than-average for the price.',
      coverImageUrl: 'https://picsum.photos/seed/gurmetrostudio/800/600',
      imageUrls: ['https://picsum.photos/seed/gurmetrostudio/800/600'],
      nearbyAmenities: ['Rapid Metro: 0.3 km', 'DLF Galleria: 1.1 km', 'Sector 56 Park: 0.5 km'],
      isVerified: false, isFreeListing: true, viewCount: 289, priceDropPercent: null,
      createdByUserId: brokerId,
    },
  ];
}

// ─── Sign JWT ─────────────────────────────────────────────────────────────────

function signToken(user: Partial<User>): string {
  return jwt.sign(
    { sub: user.id, phone: user.phone, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
}

// ─── Main seed ────────────────────────────────────────────────────────────────

async function seed(): Promise<void> {
  const ds = buildDataSource();
  await ds.initialize();

  const userRepo = ds.getRepository(User);
  const areaRepo = ds.getRepository(Area);
  const propertyRepo = ds.getRepository(Property);
  const favoriteRepo = ds.getRepository(Favorite);
  const enquiryRepo = ds.getRepository(Enquiry);
  const notifRepo = ds.getRepository(Notification);

  // Idempotency check
  const existingCount = await userRepo.count();
  if (existingCount > 0) {
    console.log('\n⚠️  Database already seeded (' + existingCount + ' users found). Skipping insert.\n');
    console.log('   To re-seed: delete dev.sqlite and run again.\n');

    // Still print tokens for existing users
    const users = await userRepo.find();
    printSummary(users, DEV_AREAS as Area[]);
    await ds.destroy();
    return;
  }

  // Insert users
  const users = userRepo.create(DEV_USERS);
  await userRepo.save(users);

  // Insert areas
  const areas = areaRepo.create(DEV_AREAS);
  await areaRepo.save(areas);

  // Insert properties
  const userIds = users.map((u) => u.id);
  const areaIds = areas.map((a) => a.id);
  const propertyData = buildProperties(userIds, areaIds);
  const properties = propertyRepo.create(propertyData as Property[]);
  await propertyRepo.save(properties);

  // Insert favorites (admin user saves 3 properties)
  const adminUser = users[0];
  const favoriteProps = properties.slice(0, 3);
  const favorites = favoriteRepo.create(
    favoriteProps.map((p) => ({
      id: uuidv4(),
      userId: adminUser.id,
      propertyId: p.id,
    })),
  );
  await favoriteRepo.save(favorites);

  // Insert enquiries
  const regularUser = users[2];
  const enquiries = enquiryRepo.create([
    {
      id: uuidv4(),
      propertyId: properties[0].id,
      fromUserId: regularUser.id,
      ownerUserId: users[1].id,
      message: 'Hi, I am interested in this property. Can we schedule a visit this Saturday at 11 AM? Please confirm availability.',
      phone: regularUser.phone,
      status: 'open',
    },
    {
      id: uuidv4(),
      propertyId: properties[2].id,
      fromUserId: regularUser.id,
      ownerUserId: adminUser.id,
      message: 'Is the price negotiable? Looking at this property seriously. Can we discuss terms?',
      phone: regularUser.phone,
      status: 'open',
    },
  ]);
  await enquiryRepo.save(enquiries);

  // Insert notifications for admin user
  const notifications = notifRepo.create([
    {
      id: uuidv4(),
      userId: adminUser.id,
      type: 'enquiry',
      title: 'New enquiry on your listing',
      body: 'Priya Sharma sent an enquiry about "3 BHK Premium Apartment in Koramangala".',
      data: { propertyId: properties[0].id },
      readAt: null,
    },
    {
      id: uuidv4(),
      userId: adminUser.id,
      type: 'price_alert',
      title: 'Price drop alert — Bandra Villa',
      body: 'The Luxe 4 BHK Villa in Bandra West dropped by 5%. Current ask: ₹8.07 Cr.',
      data: { propertyId: properties[2].id, dropPercent: 5 },
      readAt: null,
    },
    {
      id: uuidv4(),
      userId: regularUser.id,
      type: 'ai_score',
      title: 'AI score updated',
      body: 'The Koramangala Penthouse you saved now has an AI score of 95 — top 5% in Mumbai.',
      data: { propertyId: properties[10].id },
      readAt: new Date(),
    },
  ]);
  await notifRepo.save(notifications);

  console.log('\n✅  Seed complete!');
  console.log('   Users: ' + users.length);
  console.log('   Areas: ' + areas.length);
  console.log('   Properties: ' + properties.length);
  console.log('   Favorites: ' + favorites.length);
  console.log('   Enquiries: ' + enquiries.length);
  console.log('   Notifications: ' + notifications.length);

  printSummary(users, areas);
  await ds.destroy();
}

function printSummary(users: User[], areas: Area[]): void {
  const tokens = users.map((u) => ({ ...u, token: signToken(u) }));

  console.log('\n' + '─'.repeat(70));
  console.log('  DEV LOGIN CREDENTIALS');
  console.log('─'.repeat(70));
  console.log('\n  Three accounts seeded. Log in with phone + OTP stub (check API logs)');
  console.log('  OR use the dev-login endpoint (see below).\n');

  tokens.forEach((u) => {
    console.log('  📱 ' + u.role.toUpperCase() + ' — ' + u.displayName);
    console.log('     Phone:    ' + u.phone);
    console.log('     JWT:      ' + u.token.substring(0, 60) + '...');
    console.log('     Full JWT: ' + u.token);
    console.log();
  });

  console.log('─'.repeat(70));
  console.log('  HOW TO LOGIN (pick one method)');
  console.log('─'.repeat(70));
  console.log('\n  1. OTP stub: enter phone in the web login modal →');
  console.log('     check `npm run dev:api` console for the OTP code → enter it.\n');
  console.log('  2. Dev login endpoint (fastest):');
  console.log('     POST http://localhost:3333/dev/login');
  console.log('     Body: { "phone": "9999999999" }');
  console.log('     Returns { token, user } — paste token into browser console:\n');
  console.log('       await fetch("/api/auth/login", {');
  console.log('         method: "POST",');
  console.log('         headers: { "Content-Type": "application/json" },');
  console.log('         body: JSON.stringify({ token: "<paste-token-here>" }),');
  console.log('         credentials: "include"');
  console.log('       })');
  console.log('     then reload the page.\n');
  console.log('  3. One-liner to login as admin (run in browser DevTools console):');
  console.log('       fetch("http://localhost:3333/dev/login", {');
  console.log('         method: "POST",');
  console.log('         headers: { "Content-Type": "application/json" },');
  console.log('         body: JSON.stringify({ phone: "9999999999" })');
  console.log('       }).then(r => r.json()).then(d =>');
  console.log('         fetch("/api/auth/login", {');
  console.log('           method: "POST",');
  console.log('           headers: { "Content-Type": "application/json" },');
  console.log('           body: JSON.stringify({ token: d.token }),');
  console.log('           credentials: "include"');
  console.log('         })');
  console.log('       ).then(() => location.reload())');
  console.log('\n─'.repeat(70) + '\n');
  console.log('  Seeded areas: ' + areas.map((a) => a.locality + ', ' + a.city).join(' | '));
  console.log('  Properties: 15 listings (apartments, villas, commercial, rental, buy)');
  console.log('─'.repeat(70) + '\n');
}

seed().catch((err) => {
  console.error('\n❌ Seed failed:', err);
  process.exit(1);
});
