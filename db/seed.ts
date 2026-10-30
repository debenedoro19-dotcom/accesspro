import "server-only";
import { randomUUID } from "crypto";
import { db } from "@/db";
import {
  users, providerProfiles, jobs, accessCodes, reviews, activity,
  disputes, regionSettings, analyticsEvents, emails,
} from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";

const g = globalThis as typeof globalThis & { __apSeed?: Promise<void> };

export function ensureSeeded(): Promise<void> {
  if (!g.__apSeed) g.__apSeed = seed().catch((e) => {
    console.error("seed failed", e);
    g.__apSeed = undefined;
  });
  return g.__apSeed;
}

const h = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 3600 * 1000);

/** Adds the expanded service mix to both fresh and already-seeded databases. */
async function ensureExpandedOpenGigs() {
  const homeowners = await db.select({ id: users.id, email: users.email })
    .from(users).where(eq(users.role, "homeowner"));
  const ownerByEmail = new Map(homeowners.map((u) => [u.email, u.id]));
  const existing = await db.select({ title: jobs.title }).from(jobs);
  const titles = new Set(existing.map((j) => j.title));

  type NewJob = typeof jobs.$inferInsert;
  const samples: (Omit<NewJob, "homeownerId"> & { ownerEmail: string })[] = [
    { ownerEmail: "home@accesspro.demo", title: "Move-in deep clean – 3-bedroom Lincoln Park home", category: "House Cleaning", region: "US", city: "Chicago · Lincoln Park", address: "Near N Halsted St", distanceKm: 4.8, urgency: "standard", payMin: 310, payMax: 480, needsAccess: true, lockBrand: "yale", windowLabel: "Fri 9 AM–1 PM", description: "Kitchen, two baths, baseboards and inside appliances before move-in. Eco-friendly supplies preferred.", createdAt: h(3) },
    { ownerEmail: "home@accesspro.demo", title: "Evening janitorial – boutique office refresh", category: "Janitorial / Commercial Cleaning", region: "US", city: "Chicago · The Loop", address: "Near W Madison St", distanceKm: 7.2, urgency: "urgent", payMin: 620, payMax: 900, needsAccess: false, windowLabel: "Tonight 6–10 PM", description: "Light commercial, 3,200 sq ft: vacuum, desks, two washrooms and kitchen. Recurring option available.", createdAt: h(2) },
    { ownerEmail: "home@accesspro.demo", title: "Weekly housekeeping, laundry & linen change", category: "Housekeeping", region: "US", city: "Chicago · Lakeview", address: "Near W Belmont Ave", distanceKm: 5.6, urgency: "standard", payMin: 160, payMax: 250, needsAccess: true, lockBrand: "august", windowLabel: "Tue 10 AM–1 PM", description: "Three-hour weekly visit: tidy, fold laundry, change bed linens and reset kitchen. References appreciated.", createdAt: h(5) },
    { ownerEmail: "home@accesspro.demo", title: "Level 2 EV charger installation – garage circuit", category: "EV Charger", region: "US", city: "Chicago · Hyde Park", address: "Near S Cornell Ave", distanceKm: 12.5, urgency: "standard", payMin: 1100, payMax: 1900, needsAccess: false, windowLabel: "Sat 8 AM–2 PM", description: "Licensed electrician for 60A circuit, permit and Wall Connector commissioning. Panel is in basement.", createdAt: h(7) },
    { ownerEmail: "home@accesspro.demo", title: "Companion visit & light home help for senior", category: "Senior / Care-related Light Home Help", region: "US", city: "Chicago · Evanston", address: "Near Central St", distanceKm: 9.4, urgency: "standard", payMin: 150, payMax: 240, needsAccess: true, lockBrand: "schlage", windowLabel: "Wed 11 AM–2 PM", description: "Non-clinical companionship, meal prep, light tidying and a short escorted garden walk. No personal or medical care.", createdAt: h(9) },

    { ownerEmail: "mia@accesspro.demo", title: "Move-out deep clean – 2-bedroom condo", category: "House Cleaning", region: "CA", city: "Toronto · North York", address: "Near Yonge St", distanceKm: 6.7, urgency: "standard", payMin: 280, payMax: 430, needsAccess: true, lockBrand: "yale", windowLabel: "Sat 9 AM–2 PM", description: "Empty condo clean: oven, fridge, cupboards, two bathrooms and balcony glass. Supplies included.", createdAt: h(4) },
    { ownerEmail: "mia@accesspro.demo", title: "Evening janitorial – physio clinic touchpoint clean", category: "Janitorial / Commercial Cleaning", region: "CA", city: "Toronto · Etobicoke", address: "Near Bloor St W", distanceKm: 10.2, urgency: "urgent", payMin: 540, payMax: 820, needsAccess: false, windowLabel: "Today 7–10 PM", description: "Light commercial clean for 2,400 sq ft: reception, treatment rooms, floors and washrooms. Non-medical surfaces only.", createdAt: h(2.5) },
    { ownerEmail: "mia@accesspro.demo", title: "Laundry reset & pantry organization", category: "Laundry & Organizing", region: "CA", city: "Toronto · Leslieville", address: "Near Queen St E", distanceKm: 8.3, urgency: "standard", payMin: 180, payMax: 310, needsAccess: true, lockBrand: "august", windowLabel: "Thu 1–4 PM", description: "Wash, fold and put away family laundry; label pantry shelves and organize a small hall closet.", createdAt: h(6) },
    { ownerEmail: "mia@accesspro.demo", title: "Carpet & upholstery refresh – living room set", category: "Carpet / Upholstery Cleaning", region: "CA", city: "Toronto · Scarborough", address: "Near Kingston Rd", distanceKm: 14.8, urgency: "standard", payMin: 220, payMax: 390, needsAccess: false, windowLabel: "Mon 9 AM–12 PM", description: "Hot-water extraction for one area rug, two bedrooms and a fabric sectional. Please bring equipment.", createdAt: h(11) },
    { ownerEmail: "mia@accesspro.demo", title: "Condo window cleaning – interior and balcony glass", category: "Window Cleaning", region: "CA", city: "Toronto · Waterfront", address: "Near Queens Quay W", distanceKm: 5.2, urgency: "standard", payMin: 140, payMax: 240, needsAccess: true, lockBrand: "yale", windowLabel: "Tue 10 AM–1 PM", description: "Interior windows and safely reachable balcony glass in a two-bedroom condo. No exterior high-rise work required.", createdAt: h(12) },

    { ownerEmail: "oliver@accesspro.demo", title: "Housekeeping & laundry – weekly London visit", category: "Housekeeping", region: "UK", city: "London · Islington", address: "Near Upper Street", distanceKm: 3.8, urgency: "standard", payMin: 150, payMax: 240, needsAccess: true, lockBrand: "yale", windowLabel: "Wed 10 AM–1 PM", description: "Regular 3-hour visit: linen change, laundry, kitchen reset and light dusting. Reliable weekly booking.", createdAt: h(3.5) },
    { ownerEmail: "oliver@accesspro.demo", title: "End-of-tenancy deep clean – two-bed flat", category: "House Cleaning", region: "UK", city: "London · Hackney", address: "Near Wilton Way", distanceKm: 4.2, urgency: "urgent", payMin: 260, payMax: 420, needsAccess: true, lockBrand: "august", windowLabel: "Tomorrow 8 AM–1 PM", description: "Inventory-ready clean including oven, limescale removal, skirting boards and inside windows.", createdAt: h(1.5) },
    { ownerEmail: "oliver@accesspro.demo", title: "Commercial office janitorial – evening shift", category: "Janitorial / Commercial Cleaning", region: "UK", city: "London · Shoreditch", address: "Near Old Street", distanceKm: 5.1, urgency: "standard", payMin: 340, payMax: 540, needsAccess: false, windowLabel: "Weekdays 6–9 PM", description: "Light commercial clean for a 1,900 sq ft studio: desks, kitchenette, glass meeting rooms and washrooms. Ongoing work.", createdAt: h(8) },
    { ownerEmail: "oliver@accesspro.demo", title: "Traditional sash window cleaning – front & rear", category: "Window Cleaning", region: "UK", city: "London · Walthamstow", address: "Near Carnarvon Rd", distanceKm: 8.6, urgency: "standard", payMin: 140, payMax: 260, needsAccess: true, lockBrand: "manual", windowLabel: "Fri 9 AM–12 PM", description: "Inside and reachable outside panes on a two-storey Victorian terrace. Bring a water-fed pole for rear access.", createdAt: h(13) },
    { ownerEmail: "oliver@accesspro.demo", title: "Carpet steam clean & stain treatment – two bedrooms", category: "Carpet / Upholstery Cleaning", region: "UK", city: "London · Camden", address: "Near Kentish Town Rd", distanceKm: 6.3, urgency: "standard", payMin: 180, payMax: 310, needsAccess: true, lockBrand: "august", windowLabel: "Sat 1–4 PM", description: "Hot-water extraction for two carpeted bedrooms and a hallway, with pet-safe stain treatment. Bring professional equipment.", createdAt: h(15) },

    { ownerEmail: "rupert@accesspro.demo", title: "Short-stay home clean & linen reset", category: "House Cleaning", region: "AU", city: "Sydney · Northern Beaches", address: "Near Barrenjoey Rd", distanceKm: 9.8, urgency: "urgent", payMin: 250, payMax: 420, needsAccess: true, lockBrand: "schlage", windowLabel: "Today 11 AM–2 PM", description: "Turnover clean between guests: kitchen and bathroom reset, linen change, floors and restock checklist.", createdAt: h(1) },
    { ownerEmail: "rupert@accesspro.demo", title: "Small studio janitorial & washroom service", category: "Janitorial / Commercial Cleaning", region: "AU", city: "Sydney · Marrickville", address: "Near Illawarra Rd", distanceKm: 7.1, urgency: "standard", payMin: 370, payMax: 620, needsAccess: false, windowLabel: "Mon–Fri after 5 PM", description: "Light commercial clean of a 2,100 sq ft creative studio, kitchenette and two washrooms. Weekly contract considered.", createdAt: h(6.5) },
    { ownerEmail: "rupert@accesspro.demo", title: "Carpet & sofa steam clean – family home", category: "Carpet / Upholstery Cleaning", region: "AU", city: "Sydney · Parramatta", address: "Near George St", distanceKm: 11.6, urgency: "standard", payMin: 250, payMax: 450, needsAccess: true, lockBrand: "yale", windowLabel: "Sat 1–4 PM", description: "Steam clean three bedrooms, lounge rug and a 3-seat sofa. Pet-safe products requested.", createdAt: h(10) },
    { ownerEmail: "rupert@accesspro.demo", title: "Light handyman & clean-up – rental refresh", category: "Light Handyman + Cleaning", region: "AU", city: "Sydney · Newtown", address: "Near King St", distanceKm: 5.9, urgency: "urgent", payMin: 320, payMax: 520, needsAccess: true, lockBrand: "august", windowLabel: "Tomorrow 8 AM–12 PM", description: "Patch two small wall marks, tighten cabinet hinges, replace a smoke alarm battery and finish with a kitchen/bathroom reset.", createdAt: h(2) },
    { ownerEmail: "rupert@accesspro.demo", title: "Laundry, linen and pantry reset – family home", category: "Laundry & Organizing", region: "AU", city: "Sydney · Surry Hills", address: "Near Crown St", distanceKm: 4.6, urgency: "standard", payMin: 180, payMax: 290, needsAccess: true, lockBrand: "schlage", windowLabel: "Thu 9 AM–12 PM", description: "Wash and fold two loads, change bed linen and organize pantry shelves. Regular fortnightly booking possible.", createdAt: h(14) },
  ];

  const additions: NewJob[] = samples
    .filter((job) => !titles.has(job.title))
    .flatMap(({ ownerEmail, ...job }) => {
      const homeownerId = ownerByEmail.get(ownerEmail);
      return homeownerId ? [{ ...job, homeownerId }] : [];
    });
  if (additions.length) await db.insert(jobs).values(additions);
}

async function seed() {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(users);
  if (count > 0) {
    await ensureExpandedOpenGigs();
    return;
  }

  const pw = hashPassword("demo1234");
  const id = () => randomUUID();
  const [admin, marcus, priya, sofia, liam, emma, jack, noah, dana, oliver, mia, rupert] =
    Array.from({ length: 12 }, id);

  await db.insert(users).values([
    { id: admin, email: "admin@accesspro.demo", passwordHash: pw, name: "Ava Sterling", role: "admin", region: "US", city: "Chicago", phone: "+1 312 555 0100" },
    { id: marcus, email: "pro@accesspro.demo", passwordHash: pw, name: "Marcus Reed", role: "provider", region: "US", city: "Chicago", phone: "+1 312 555 0142" },
    { id: priya, email: "pending@accesspro.demo", passwordHash: pw, name: "Priya Shah", role: "provider", region: "UK", city: "London", phone: "+44 20 7946 0821" },
    { id: sofia, email: "sofia@accesspro.demo", passwordHash: pw, name: "Sofia Delgado", role: "provider", region: "US", city: "Austin", phone: "+1 512 555 0177" },
    { id: liam, email: "liam@accesspro.demo", passwordHash: pw, name: "Liam Tremblay", role: "provider", region: "CA", city: "Toronto", phone: "+1 416 555 0139" },
    { id: emma, email: "emma@accesspro.demo", passwordHash: pw, name: "Emma Whitfield", role: "provider", region: "UK", city: "Manchester", phone: "+44 161 555 0114" },
    { id: jack, email: "jack@accesspro.demo", passwordHash: pw, name: "Jack Nguyen", role: "provider", region: "AU", city: "Sydney", phone: "+61 2 5550 0163" },
    { id: noah, email: "noah@accesspro.demo", passwordHash: pw, name: "Noah Bennett", role: "provider", region: "US", city: "Denver", phone: "+1 720 555 0158" },
    { id: dana, email: "home@accesspro.demo", passwordHash: pw, name: "Dana Whitmore", role: "homeowner", region: "US", city: "Chicago", phone: "+1 773 555 0122" },
    { id: oliver, email: "oliver@accesspro.demo", passwordHash: pw, name: "Oliver Hart", role: "homeowner", region: "UK", city: "London", phone: "+44 20 7946 0333" },
    { id: mia, email: "mia@accesspro.demo", passwordHash: pw, name: "Mia Chen", role: "homeowner", region: "CA", city: "Toronto", phone: "+1 647 555 0129" },
    { id: rupert, email: "rupert@accesspro.demo", passwordHash: pw, name: "Rupert Vale", role: "homeowner", region: "AU", city: "Sydney", phone: "+61 2 5550 0171" },
  ]);

  const docs = (region: string) => [
    { type: "Government photo ID", name: "passport_front.jpg", uploadedAt: h(200).toISOString() },
    { type: "Liability insurance", name: "liability_certificate.pdf", uploadedAt: h(200).toISOString() },
    { type: region === "UK" ? "Gas Safe registration" : "Trade license", name: "license.pdf", uploadedAt: h(200).toISOString() },
  ];

  await db.insert(providerProfiles).values([
    { userId: marcus, trades: ["HVAC", "Plumbing"], yearsExperience: 12, hourlyRate: 95, radiusKm: 60, bio: "Master HVAC & plumbing technician. Emergency response specialist, 2,300+ jobs completed across Chicagoland.", availability: "24/7 emergency", specialties: ["Emergency", "High-ticket", "Smart Home"], verificationStatus: "fully_verified", documents: docs("US"), facialCompletedAt: h(4000), profileStrength: 100, rating: 4.9, jobsCompleted: 127 },
    { userId: priya, trades: ["Boiler & Heating"], yearsExperience: 6, hourlyRate: 68, radiusKm: 30, bio: "", availability: "Weekdays", specialties: [], verificationStatus: "unverified", documents: [], profileStrength: 45, rating: 5, jobsCompleted: 0 },
    { userId: sofia, trades: ["Electrical", "Smart Home"], yearsExperience: 9, hourlyRate: 88, radiusKm: 50, bio: "Licensed master electrician. Whole-home automation, EV chargers, panel upgrades.", availability: "Weekdays + Sat", specialties: ["Smart Home", "High-ticket"], verificationStatus: "fully_verified", documents: docs("US"), facialCompletedAt: h(3200), profileStrength: 96, rating: 4.8, jobsCompleted: 89 },
    { userId: liam, trades: ["Plumbing", "HVAC"], yearsExperience: 14, hourlyRate: 92, radiusKm: 70, bio: "Red Seal plumber & gas fitter. Cold-climate heating specialist.", availability: "24/7 emergency", specialties: ["Emergency"], verificationStatus: "fully_verified", documents: docs("CA"), facialCompletedAt: h(5100), profileStrength: 92, rating: 4.9, jobsCompleted: 112 },
    { userId: emma, trades: ["Boiler & Heating", "Plumbing"], yearsExperience: 11, hourlyRate: 74, radiusKm: 45, bio: "Gas Safe registered engineer. Boiler installs, power flushing, landlord certificates.", availability: "Weekdays", specialties: ["High-ticket"], verificationStatus: "fully_verified", documents: docs("UK"), facialCompletedAt: h(6000), profileStrength: 98, rating: 5, jobsCompleted: 143 },
    { userId: jack, trades: ["Solar", "Electrical"], yearsExperience: 8, hourlyRate: 96, radiusKm: 90, bio: "CEC-accredited solar designer & A-grade electrician. 1.2MW installed.", availability: "Mon–Sat", specialties: ["High-ticket", "Solar"], verificationStatus: "fully_verified", documents: docs("AU"), facialCompletedAt: h(2800), profileStrength: 94, rating: 4.9, jobsCompleted: 98 },
    { userId: noah, trades: ["Roofing", "Carpentry"], yearsExperience: 16, hourlyRate: 79, radiusKm: 80, bio: "Storm response roofing crew lead. Insurance documentation included.", availability: "24/7 emergency", specialties: ["Emergency"], verificationStatus: "fully_verified", documents: docs("US"), facialCompletedAt: h(7000), profileStrength: 90, rating: 4.7, jobsCompleted: 64 },
  ]);

  type NewJob = typeof jobs.$inferInsert;
  const open: NewJob[] = [
    { homeownerId: dana, title: "Emergency HVAC – compressor failure, no cooling", category: "HVAC", region: "US", city: "Chicago · Lincoln Park", address: "2314 N Sheffield Ave", distanceKm: 6.2, urgency: "emergency", payMin: 1800, payMax: 3200, needsAccess: true, lockBrand: "yale", windowLabel: "Today 4–8 PM", description: "5-ton condenser stopped. House at 86°F with a newborn. Prefer full diagnosis + repair or swap quote.", createdAt: h(2) },
    { homeownerId: dana, title: "200A electrical panel upgrade + permit", category: "Electrical", region: "US", city: "Chicago · Oak Park", address: "418 N Elmwood Ave", distanceKm: 11.4, urgency: "standard", payMin: 2400, payMax: 4500, needsAccess: false, windowLabel: "Thu 9 AM–1 PM", description: "Federal Pacific panel replacement, permit + inspection handled by pro.", createdAt: h(26) },
    { homeownerId: dana, title: "Whole-home smart lock + thermostat install", category: "Smart Home", region: "US", city: "Chicago · Wicker Park", address: "1922 W Division St", distanceKm: 4.1, urgency: "urgent", payMin: 900, payMax: 1600, needsAccess: true, lockBrand: "august", windowLabel: "Tomorrow 1–5 PM", description: "3 smart locks, 2 thermostats, mesh wifi tuning. Devices on site.", createdAt: h(5) },
    { homeownerId: dana, title: "Burst water heater replacement (50 gal)", category: "Plumbing", region: "US", city: "Chicago · Evanston", address: "904 Dodge Ave", distanceKm: 8.9, urgency: "emergency", payMin: 750, payMax: 1400, needsAccess: true, lockBrand: "schlage", windowLabel: "ASAP today", description: "Tank leaking into pan, water shut off. Same-day swap needed.", createdAt: h(1) },
    { homeownerId: dana, title: "EV charger circuit + Level 2 install", category: "Electrical", region: "US", city: "Chicago · Hyde Park", address: "5490 S Cornell Ave", distanceKm: 15.2, urgency: "standard", payMin: 800, payMax: 1500, needsAccess: false, windowLabel: "Sat 10 AM–2 PM", description: "60A run to garage, Tesla Wall Connector supplied.", createdAt: h(48) },
    { homeownerId: mia, title: "Furnace replacement – emergency, −18°C forecast", category: "HVAC", region: "CA", city: "Toronto · Etobicoke", address: "27 Rathburn Rd", distanceKm: 7.4, urgency: "emergency", payMin: 1200, payMax: 2600, needsAccess: true, lockBrand: "yale", windowLabel: "Today 6–10 PM", description: "Cracked heat exchanger, red-tagged. High-efficiency replacement preferred.", createdAt: h(3) },
    { homeownerId: mia, title: "Heat pump system install (ducted)", category: "HVAC", region: "CA", city: "Toronto · North York", address: "112 Finch Ave W", distanceKm: 18.3, urgency: "standard", payMin: 3800, payMax: 6500, needsAccess: false, windowLabel: "Next Tue 8 AM–4 PM", description: "Cold-climate heat pump, rebate paperwork supported.", createdAt: h(30) },
    { homeownerId: mia, title: "Basement rough-in plumbing – 3-piece bath", category: "Plumbing", region: "CA", city: "Toronto · Scarborough", address: "48 Coral Gable Dr", distanceKm: 12.1, urgency: "standard", payMin: 900, payMax: 1700, needsAccess: false, windowLabel: "Fri 9 AM–1 PM", description: "Rough-in for future basement bath, permit ready.", createdAt: h(70) },
    { homeownerId: oliver, title: "Combi boiler swap + power flush", category: "Boiler & Heating", region: "UK", city: "London · Islington", address: "12 Almeida St", distanceKm: 5.5, urgency: "urgent", payMin: 1900, payMax: 3200, needsAccess: true, lockBrand: "yale", windowLabel: "Tomorrow 8 AM–12 PM", description: "Worcester 30Si to new combi, 8 rads power flush. Gas Safe required.", createdAt: h(6) },
    { homeownerId: oliver, title: "Full rewire – 3-bed Victorian terrace", category: "Electrical", region: "UK", city: "London · Walthamstow", address: "63 Carnarvon Rd", distanceKm: 9.8, urgency: "standard", payMin: 3200, payMax: 5200, needsAccess: false, windowLabel: "Mon–Wed next week", description: "EICR failed. Full rewire + new consumer unit, NICEIC cert.", createdAt: h(28) },
    { homeownerId: oliver, title: "Emergency roof leak – active ingress", category: "Roofing", region: "UK", city: "London · Hackney", address: "5 Wilton Way", distanceKm: 3.2, urgency: "emergency", payMin: 450, payMax: 900, needsAccess: true, lockBrand: "manual", windowLabel: "ASAP today", description: "Slipped tiles above bedroom, water coming in during rain.", createdAt: h(0.7) },
    { homeownerId: rupert, title: "10kW solar + battery-ready install", category: "Solar", region: "AU", city: "Sydney · Northern Beaches", address: "8 Barrenjoey Rd", distanceKm: 22.4, urgency: "standard", payMin: 5500, payMax: 8900, needsAccess: false, windowLabel: "Thu 7 AM–3 PM", description: "23-panel array, inverter + battery-ready switchboard. CEC accredited.", createdAt: h(27) },
    { homeownerId: rupert, title: "Switchboard upgrade + RCBO compliance", category: "Electrical", region: "AU", city: "Sydney · Marrickville", address: "31 Illawarra Rd", distanceKm: 13.0, urgency: "urgent", payMin: 1400, payMax: 2400, needsAccess: true, lockBrand: "schlage", windowLabel: "Tomorrow 8 AM–12 PM", description: "Ceramic fuses to RCBOs, surge protection, certificate of compliance.", createdAt: h(8) },
    { homeownerId: rupert, title: "Ducted A/C replacement – 5 zones", category: "HVAC", region: "AU", city: "Sydney · Parramatta", address: "77 George St", distanceKm: 16.8, urgency: "standard", payMin: 4200, payMax: 7000, needsAccess: false, windowLabel: "Next Mon 8 AM–4 PM", description: "R22 system replacement, 5-zone controller, ceiling access good.", createdAt: h(50) },
  ];
  const insertedOpen = await db.insert(jobs).values(open).returning({ id: jobs.id });

  const acceptedId = id();
  const progressId = id();
  const completedIds = Array.from({ length: 6 }, id);
  const pipeline: NewJob[] = [
    { id: acceptedId, homeownerId: dana, title: "Smart thermostat + Yale lock install", category: "Smart Home", region: "US", city: "Chicago · River North", address: "350 W Ontario St", distanceKm: 2.8, urgency: "urgent", payMin: 650, payMax: 1100, needsAccess: true, lockBrand: "yale", windowLabel: "Today 2–6 PM", status: "accepted", acceptedById: marcus, description: "Ecobee + Yale Assure, homeowner travelling – temporary access issued.", createdAt: h(22) },
    { id: progressId, homeownerId: dana, title: "Radiant floor manifold repair", category: "HVAC", region: "US", city: "Chicago · Gold Coast", address: "1240 N State Pkwy", distanceKm: 3.5, urgency: "standard", payMin: 1100, payMax: 1900, needsAccess: false, windowLabel: "Today 9 AM–1 PM", status: "in_progress", acceptedById: marcus, description: "Zone valve + actuator replacement on 4-zone manifold.", createdAt: h(46) },
    { id: completedIds[0], homeownerId: dana, title: "AC condenser + coil replacement", category: "HVAC", region: "US", city: "Chicago", payMin: 2200, payMax: 3000, payFinal: 2600, status: "completed", acceptedById: marcus, completedAt: h(72), createdAt: h(120), windowLabel: "Completed" },
    { id: completedIds[1], homeownerId: dana, title: "Sump pump + battery backup", category: "Plumbing", region: "US", city: "Chicago", payMin: 1200, payMax: 1700, payFinal: 1450, status: "completed", acceptedById: marcus, completedAt: h(190), createdAt: h(240), windowLabel: "Completed" },
    { id: completedIds[2], homeownerId: dana, title: "High-efficiency furnace install", category: "HVAC", region: "US", city: "Chicago", payMin: 3400, payMax: 4400, payFinal: 3900, status: "completed", acceptedById: marcus, completedAt: h(360), createdAt: h(420), windowLabel: "Completed" },
    { id: completedIds[3], homeownerId: dana, title: "Tankless water heater conversion", category: "Plumbing", region: "US", city: "Chicago", payMin: 850, payMax: 1150, payFinal: 980, status: "completed", acceptedById: marcus, completedAt: h(530), createdAt: h(600), windowLabel: "Completed" },
    { id: completedIds[4], homeownerId: dana, title: "Zoned HVAC control retrofit", category: "HVAC", region: "US", city: "Chicago", payMin: 1800, payMax: 2500, payFinal: 2150, status: "completed", acceptedById: marcus, completedAt: h(720), createdAt: h(790), windowLabel: "Completed" },
    { id: completedIds[5], homeownerId: dana, title: "Commercial-grade air scrubber install", category: "HVAC", region: "US", city: "Chicago", payMin: 1500, payMax: 2000, payFinal: 1750, status: "completed", acceptedById: marcus, completedAt: h(910), createdAt: h(980), windowLabel: "Completed" },
  ];
  await db.insert(jobs).values(pipeline);

  await db.insert(accessCodes).values([
    {
      jobId: acceptedId, providerId: marcus, homeownerId: dana, brand: "yale", code: "483926",
      validFrom: h(1), validUntil: new Date(Date.now() + 5 * 3600 * 1000), status: "active",
      events: [
        { at: h(20).toISOString(), type: "created", label: "Credential issued to Marcus Reed (Yale Access)" },
        { at: h(1).toISOString(), type: "activated", label: "Window opened – code is live" },
      ],
    },
    {
      jobId: completedIds[0], providerId: marcus, homeownerId: dana, brand: "august", code: "902417",
      validFrom: h(80), validUntil: h(72), status: "expired",
      events: [
        { at: h(82).toISOString(), type: "created", label: "Credential issued to Marcus Reed (August Home)" },
        { at: h(79).toISOString(), type: "entry", label: "Entry recorded – front door" },
        { at: h(73).toISOString(), type: "exit", label: "Exit recorded – door locked" },
        { at: h(72).toISOString(), type: "expired", label: "Code auto-expired" },
      ],
    },
  ]);

  await db.insert(reviews).values([
    { jobId: completedIds[0], proId: marcus, homeownerId: dana, rating: 5, comment: "Marcus swapped the condenser in 3 hours and the access code expired itself. Flawless.", createdAt: h(70) },
    { jobId: completedIds[2], proId: marcus, homeownerId: dana, rating: 5, comment: "Premium work, spotless install, transparent invoice.", createdAt: h(355) },
    { jobId: completedIds[1], proId: marcus, homeownerId: dana, rating: 4, comment: "Fast emergency response during the storm.", createdAt: h(185) },
  ]);

  await db.insert(activity).values([
    { userId: marcus, kind: "match", text: "New high-pay match: Emergency HVAC – up to $3,200 · 6.2 km away", createdAt: h(2) },
    { userId: marcus, kind: "access", text: "Yale access code activated for 350 W Ontario St", createdAt: h(1) },
    { userId: marcus, kind: "payout", text: "Payout of $2,600 released via Stripe Connect", createdAt: h(70) },
    { userId: marcus, kind: "review", text: "Dana W. left a 5★ review – “Flawless.”", createdAt: h(70) },
    { userId: dana, kind: "access", text: "Marcus Reed accepted your job – temporary code issued", createdAt: h(20) },
    { userId: dana, kind: "job", text: "Emergency HVAC gig posted – 4 verified pros notified", createdAt: h(2) },
  ]);

  await db.insert(disputes).values([
    { subject: "Late arrival flagged on emergency callout", detail: "Pro arrived 90 min after window start; homeowner requests partial refund of callout fee.", region: "UK", status: "open", createdAt: h(30) },
    { subject: "Invoice mismatch – materials line", detail: "Materials billed $210 above quote. Awaiting pro response and receipts.", region: "US", status: "open", createdAt: h(12) },
  ]);

  await db.insert(regionSettings).values([
    { region: "US", active: true, demandMultiplier: 1.2, featured: ["HVAC", "Electrical", "Smart Home"] },
    { region: "CA", active: true, demandMultiplier: 1.1, featured: ["HVAC", "Plumbing"] },
    { region: "UK", active: true, demandMultiplier: 1.15, featured: ["Boiler & Heating", "Roofing"] },
    { region: "AU", active: true, demandMultiplier: 1.1, featured: ["Solar", "Electrical"] },
  ]);

  const funnel: { name: string }[] = [];
  for (let i = 0; i < 24; i++) funnel.push({ name: "documents_submitted" });
  for (let i = 0; i < 19; i++) funnel.push({ name: "email_opened" });
  for (let i = 0; i < 17; i++) funnel.push({ name: "facial_completed" });
  await db.insert(analyticsEvents).values(funnel);

  await db.insert(emails).values({
    toEmail: "pending@accesspro.demo",
    subject: "Welcome to AccessPro – finish your verification to unlock premium gigs",
    kind: "welcome",
    bodyHtml: `<div style="font-family:Inter,Arial,sans-serif;padding:24px;color:#1a1917;"><h2 style="color:#1a1917;">Welcome, Priya 👋</h2><p>Your profile is created. Submit your documents from the onboarding page and we'll email your secure facial-verification link.</p><p style="color:#64748b;font-size:13px;">Verified pros earn 2.4× more on AccessPro.</p></div>`,
  });
  // Extra verified pros so every region has a deep, credible bench.
  const bench: { name: string; region: string; city: string; trades: string[]; rating: number; done: number; rate: number }[] = [
    { name: "Grace Okafor", region: "US", city: "Chicago", trades: ["Electrical"], rating: 4.9, done: 76, rate: 90 },
    { name: "Tom Alvarez", region: "US", city: "Austin", trades: ["HVAC", "Plumbing"], rating: 4.8, done: 91, rate: 85 },
    { name: "Hannah Kim", region: "US", city: "Denver", trades: ["Smart Home", "Electrical"], rating: 5, done: 54, rate: 98 },
    { name: "Derek Boone", region: "US", city: "Seattle", trades: ["Roofing"], rating: 4.7, done: 68, rate: 78 },
    { name: "Isabelle Roy", region: "CA", city: "Montréal", trades: ["Plumbing"], rating: 4.9, done: 83, rate: 88 },
    { name: "Owen Fraser", region: "CA", city: "Vancouver", trades: ["HVAC"], rating: 4.8, done: 97, rate: 94 },
    { name: "Nina Patel", region: "CA", city: "Toronto", trades: ["Electrical", "Smart Home"], rating: 4.9, done: 61, rate: 92 },
    { name: "Callum Byrne", region: "UK", city: "London", trades: ["Electrical"], rating: 4.8, done: 104, rate: 72 },
    { name: "Freya Lawson", region: "UK", city: "Birmingham", trades: ["Boiler & Heating"], rating: 4.9, done: 88, rate: 70 },
    { name: "Rhys Morgan", region: "UK", city: "Cardiff", trades: ["Roofing", "Carpentry"], rating: 4.7, done: 72, rate: 64 },
    { name: "Amelia Ford", region: "UK", city: "London", trades: ["Plumbing"], rating: 4.9, done: 59, rate: 75 },
    { name: "Lachlan West", region: "AU", city: "Melbourne", trades: ["Solar", "Electrical"], rating: 4.9, done: 86, rate: 99 },
    { name: "Ruby Harper", region: "AU", city: "Brisbane", trades: ["HVAC"], rating: 4.8, done: 74, rate: 91 },
    { name: "Ethan Cole", region: "AU", city: "Perth", trades: ["Plumbing"], rating: 4.8, done: 69, rate: 89 },
    { name: "Sienna Brooks", region: "AU", city: "Sydney", trades: ["Smart Home", "Electrical"], rating: 5, done: 47, rate: 102 },
    { name: "Mateo Silva", region: "US", city: "Miami", trades: ["HVAC"], rating: 4.9, done: 118, rate: 87 },
  ];
  for (const b of bench) {
    const uid = id();
    await db.insert(users).values({
      id: uid,
      email: b.name.toLowerCase().replace(/[^a-z]+/g, ".") + "@accesspro.demo",
      passwordHash: pw, name: b.name, role: "provider", region: b.region, city: b.city, phone: "",
    });
    await db.insert(providerProfiles).values({
      userId: uid, trades: b.trades, yearsExperience: 6 + (b.done % 9), hourlyRate: b.rate,
      radiusKm: 50, bio: `${b.trades.join(" & ")} specialist serving ${b.city}. Fully verified with insurance on file.`,
      availability: "Weekdays", specialties: b.done > 80 ? ["Emergency"] : ["High-ticket"],
      verificationStatus: "fully_verified", documents: docs(b.region),
      facialCompletedAt: h(1000 + b.done * 7), profileStrength: 88 + (b.done % 10),
      rating: b.rating, jobsCompleted: b.done,
    });
  }
  await ensureExpandedOpenGigs();
  void insertedOpen;
}